-- Domina OAB - Identidade única, fundadores e administração Fase 1

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  cpf text unique,
  email text not null,
  phone text unique,
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  cpf_verified boolean not null default false,
  account_status text not null default 'active' check (account_status in ('active','blocked','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_profiles_email_unique_idx
  on public.user_profiles ((lower(email)));

alter table public.user_profiles enable row level security;

drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own on public.user_profiles
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own on public.user_profiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.only_digits(p_value text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(p_value,''), '[^0-9]', '', 'g');
$$;

create or replace function public.valid_cpf(p_cpf text)
returns boolean
language plpgsql
immutable
as $$
declare
  c text := public.only_digits(p_cpf);
  s integer;
  d1 integer;
  d2 integer;
  i integer;
begin
  if length(c) <> 11 then return false; end if;
  if c ~ '^([0-9])\1{10}$' then return false; end if;

  s := 0;
  for i in 1..9 loop
    s := s + substring(c from i for 1)::integer * (11 - i);
  end loop;
  d1 := 11 - (s % 11);
  if d1 >= 10 then d1 := 0; end if;
  if d1 <> substring(c from 10 for 1)::integer then return false; end if;

  s := 0;
  for i in 1..10 loop
    s := s + substring(c from i for 1)::integer * (12 - i);
  end loop;
  d2 := 11 - (s % 11);
  if d2 >= 10 then d2 := 0; end if;

  return d2 = substring(c from 11 for 1)::integer;
end;
$$;

alter table public.pilot_leads
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists activation_status text not null default 'reserved',
  add column if not exists activated_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists cancelled_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname='pilot_leads_activation_status_check'
  ) then
    alter table public.pilot_leads add constraint pilot_leads_activation_status_check
      check (activation_status in ('reserved','active','expired','cancelled'));
  end if;
end $$;

create unique index if not exists pilot_leads_user_unique_idx
  on public.pilot_leads(user_id)
  where user_id is not null;

create or replace function public.upsert_identity(
  p_user_id uuid,
  p_email text,
  p_cpf text,
  p_phone text,
  p_full_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text := lower(trim(p_email));
  v_cpf text := public.only_digits(p_cpf);
  v_phone text := public.only_digits(p_phone);
  v_auth_email text;
begin
  if p_user_id is null then raise exception 'invalid_user'; end if;
  if v_email = '' or position('@' in v_email) <= 1 then raise exception 'invalid_email'; end if;
  if not public.valid_cpf(v_cpf) then raise exception 'invalid_cpf'; end if;
  if length(v_phone) < 10 or length(v_phone) > 13 then raise exception 'invalid_phone'; end if;

  select lower(email) into v_auth_email from auth.users where id = p_user_id;
  if v_auth_email is null then raise exception 'auth_user_not_found'; end if;
  if v_auth_email <> v_email then raise exception 'email_mismatch'; end if;

  if exists(select 1 from public.user_profiles where cpf=v_cpf and user_id<>p_user_id) then
    raise exception 'cpf_already_in_use';
  end if;
  if exists(select 1 from public.user_profiles where lower(email)=v_email and user_id<>p_user_id) then
    raise exception 'email_already_in_use';
  end if;
  if exists(select 1 from public.user_profiles where phone=v_phone and user_id<>p_user_id) then
    raise exception 'phone_already_in_use';
  end if;

  insert into public.user_profiles(user_id,full_name,cpf,email,phone,email_verified,cpf_verified,updated_at)
  values(p_user_id,nullif(trim(p_full_name),''),v_cpf,v_email,v_phone,true,true,now())
  on conflict(user_id) do update set
    full_name=coalesce(excluded.full_name,public.user_profiles.full_name),
    cpf=excluded.cpf,
    email=excluded.email,
    phone=excluded.phone,
    email_verified=true,
    cpf_verified=true,
    updated_at=now();

  return jsonb_build_object('ok',true,'user_id',p_user_id);
end;
$$;

create or replace function public.resolve_login_identifier(p_identifier text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v text := trim(p_identifier);
  v_digits text := public.only_digits(p_identifier);
  result_email text;
begin
  if position('@' in v) > 1 then
    select email into result_email from public.user_profiles where lower(email)=lower(v) limit 1;
  elsif length(v_digits)=11 and public.valid_cpf(v_digits) then
    select email into result_email from public.user_profiles where cpf=v_digits limit 1;
  else
    select email into result_email from public.user_profiles where phone=v_digits limit 1;
  end if;
  return result_email;
end;
$$;

create or replace function public.activate_founder_access(
  p_user_id uuid,
  p_email text,
  p_cpf text,
  p_phone text,
  p_full_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_lead public.pilot_leads%rowtype;
  v_end timestamptz;
begin
  perform public.upsert_identity(p_user_id,v_email,p_cpf,p_phone,p_full_name);

  select * into v_lead from public.pilot_leads
  where lower(email)=v_email
  for update;

  if not found then raise exception 'founder_reservation_not_found'; end if;
  if v_lead.activation_status='cancelled' then raise exception 'founder_reservation_cancelled'; end if;
  if v_lead.user_id is not null and v_lead.user_id<>p_user_id then raise exception 'founder_already_claimed'; end if;

  v_end := coalesce(v_lead.activated_at,now()) + interval '365 days';

  update public.pilot_leads
  set user_id=p_user_id,
      activation_status='active',
      activated_at=coalesce(activated_at,now()),
      expires_at=coalesce(expires_at,v_end),
      cancelled_at=null
  where id=v_lead.id;

  if not exists(
    select 1 from public.entitlements
    where user_id=p_user_id and plan_id='founder-annual' and status='active'
  ) then
    insert into public.entitlements(user_id,email,plan_id,source_type,source_id,status,starts_at,ends_at)
    values(p_user_id,v_email,'founder-annual','founder',v_lead.id::text,'active',now(),v_end);
  end if;

  return jsonb_build_object('ok',true,'plan_id','founder-annual','expires_at',v_end);
end;
$$;

create or replace function public.admin_users(p_query text default null)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb)
  from (
    select
      p.user_id,
      p.full_name,
      regexp_replace(coalesce(p.cpf,''),'^(...)(...)(...)(..)$','***.***.***-\\4') as cpf_masked,
      p.email,
      p.phone,
      p.email_verified,
      p.phone_verified,
      p.cpf_verified,
      p.account_status,
      p.created_at,
      coalesce(l.activation_status,'none') founder_status,
      l.activated_at founder_activated_at,
      l.expires_at founder_expires_at,
      e.plan_id active_plan,
      e.ends_at access_ends_at,
      greatest(0,ceil(extract(epoch from (e.ends_at-now()))/86400))::int days_remaining
    from public.user_profiles p
    left join public.pilot_leads l on l.user_id=p.user_id
    left join lateral (
      select plan_id,ends_at from public.entitlements
      where user_id=p.user_id and status='active' and ends_at>now()
      order by ends_at desc limit 1
    ) e on true
    where coalesce(trim(p_query),'')=''
       or lower(p.email) like '%'||lower(trim(p_query))||'%'
       or public.only_digits(p.cpf)=public.only_digits(p_query)
       or public.only_digits(p.phone) like '%'||public.only_digits(p_query)||'%'
       or lower(coalesce(p.full_name,'')) like '%'||lower(trim(p_query))||'%'
    order by p.created_at desc
    limit 200
  ) x;
$$;

create or replace function public.admin_set_account_status(p_user_id uuid,p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('active','blocked','cancelled') then raise exception 'invalid_status'; end if;
  update public.user_profiles set account_status=p_status,updated_at=now() where user_id=p_user_id;
  if not found then raise exception 'user_not_found'; end if;
end;
$$;

create or replace function public.admin_extend_access(p_user_id uuid,p_days integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
  v_end timestamptz;
begin
  if p_days < 1 or p_days > 730 then raise exception 'invalid_days'; end if;
  select id,ends_at into v_id,v_end from public.entitlements
  where user_id=p_user_id and status='active'
  order by ends_at desc limit 1 for update;
  if v_id is null then raise exception 'active_access_not_found'; end if;
  v_end := greatest(v_end,now()) + make_interval(days=>p_days);
  update public.entitlements set ends_at=v_end,updated_at=now() where id=v_id;
  update public.pilot_leads set expires_at=v_end where user_id=p_user_id and activation_status='active';
  return jsonb_build_object('ok',true,'expires_at',v_end);
end;
$$;

create or replace function public.admin_cancel_access(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.entitlements set status='cancelled',updated_at=now()
  where user_id=p_user_id and status='active';
  update public.pilot_leads set activation_status='cancelled',cancelled_at=now()
  where user_id=p_user_id and activation_status='active';
end;
$$;

revoke all on function public.upsert_identity(uuid,text,text,text,text) from public, anon;
revoke all on function public.resolve_login_identifier(text) from public, anon, authenticated;
revoke all on function public.activate_founder_access(uuid,text,text,text,text) from public, anon;
revoke all on function public.admin_users(text) from public, anon, authenticated;
revoke all on function public.admin_set_account_status(uuid,text) from public, anon, authenticated;
revoke all on function public.admin_extend_access(uuid,integer) from public, anon, authenticated;
revoke all on function public.admin_cancel_access(uuid) from public, anon, authenticated;

grant execute on function public.upsert_identity(uuid,text,text,text,text) to authenticated, service_role;
grant execute on function public.activate_founder_access(uuid,text,text,text,text) to authenticated, service_role;
grant execute on function public.resolve_login_identifier(text) to service_role;
grant execute on function public.admin_users(text) to service_role;
grant execute on function public.admin_set_account_status(uuid,text) to service_role;
grant execute on function public.admin_extend_access(uuid,integer) to service_role;
grant execute on function public.admin_cancel_access(uuid) to service_role;
