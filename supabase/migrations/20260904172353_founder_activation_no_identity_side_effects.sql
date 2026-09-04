create or replace function public.activate_founder_access(
  p_user_id uuid,
  p_email text,
  p_cpf text,
  p_phone text,
  p_full_name text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_lead public.pilot_leads%rowtype;
  v_end timestamptz;
  v_session_user uuid := auth.uid();
  v_effective_user uuid;
  v_is_service boolean := coalesce(auth.role() = 'service_role', false);
  v_active_count integer;
begin
  if v_is_service then
    if p_user_id is null then raise exception 'user_required'; end if;
    v_effective_user := p_user_id;
  else
    if v_session_user is null then raise exception 'authentication_required'; end if;
    if p_user_id is null or p_user_id <> v_session_user then raise exception 'user_mismatch'; end if;
    v_effective_user := v_session_user;
  end if;

  perform pg_advisory_xact_lock(hashtext('domina_oab_founder_slots'));

  select * into v_lead
  from public.pilot_leads
  where lower(email)=v_email
  for update;

  if found then
    if v_lead.activation_status='cancelled' then raise exception 'founder_reservation_cancelled'; end if;
    if v_lead.user_id is not null and v_lead.user_id<>v_effective_user then raise exception 'founder_already_claimed'; end if;
    if v_lead.activation_status='active' and v_lead.user_id=v_effective_user then
      return jsonb_build_object('ok',true,'plan_id','founder-annual','expires_at',v_lead.expires_at);
    end if;
  end if;

  select count(*) into v_active_count
  from public.pilot_leads
  where activation_status='active';

  if v_active_count >= 25 then
    raise exception 'founder_slots_full';
  end if;

  perform public.upsert_identity(v_effective_user,v_email,p_cpf,p_phone,p_full_name);

  v_end := now() + interval '365 days';

  if found then
    update public.pilot_leads
    set user_id=v_effective_user,
        status='founder',
        activation_status='active',
        activated_at=now(),
        expires_at=v_end,
        cancelled_at=null
    where id=v_lead.id
    returning * into v_lead;
  else
    insert into public.pilot_leads(email,status,user_id,activation_status,activated_at,expires_at)
    values(v_email,'founder',v_effective_user,'active',now(),v_end)
    returning * into v_lead;
  end if;

  if not exists(
    select 1 from public.entitlements
    where user_id=v_effective_user and plan_id='founder-annual' and status='active'
  ) then
    insert into public.entitlements(user_id,email,plan_id,source_type,source_id,status,starts_at,ends_at)
    values(v_effective_user,v_email,'founder-annual','founder',v_lead.id::text,'active',now(),v_end);
  end if;

  return jsonb_build_object('ok',true,'plan_id','founder-annual','expires_at',v_end);
end;
$$;

revoke all on function public.activate_founder_access(uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.activate_founder_access(uuid,text,text,text,text) to service_role;
