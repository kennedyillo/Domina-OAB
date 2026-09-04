alter table public.pilot_leads
  add column if not exists marketing_opt_in boolean not null default false;

alter table public.pilot_leads
  alter column consent_version drop not null,
  alter column consent_version drop default;

create or replace function public.register_founder_server_v2(
  p_email text,
  p_marketing_opt_in boolean default false,
  p_consent_version text default '2026-09',
  p_client_ip inet default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
  v_email text := lower(trim(p_email));
  v_inserted boolean;
begin
  v_result := public.register_founder_server(
    p_email,
    case when coalesce(p_marketing_opt_in,false) then coalesce(nullif(p_consent_version,''),'2026-09') else '2026-09' end,
    p_client_ip
  );

  v_inserted := coalesce((v_result->>'inserted')::boolean,false);

  if coalesce(p_marketing_opt_in,false) then
    update public.pilot_leads
    set marketing_opt_in=true,
        consent_version=coalesce(nullif(p_consent_version,''),'2026-09')
    where lower(email)=v_email;
  elsif v_inserted then
    update public.pilot_leads
    set marketing_opt_in=false,
        consent_version=null
    where lower(email)=v_email;
  end if;

  return v_result || jsonb_build_object('marketing_opt_in',coalesce(p_marketing_opt_in,false));
end;
$$;

create or replace function public.activate_founder_access_v2(
  p_user_id uuid,
  p_email text,
  p_cpf text,
  p_phone text,
  p_full_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
  v_marketing boolean := false;
  v_consent_version text;
  v_email text := lower(trim(p_email));
begin
  v_result := public.activate_founder_access(p_user_id,p_email,p_cpf,p_phone,p_full_name);

  select coalesce(marketing_opt_in,false), consent_version
    into v_marketing, v_consent_version
  from public.pilot_leads
  where lower(email)=v_email
  limit 1;

  if v_marketing then
    insert into public.communication_preferences(
      user_id,email,marketing_opt_in,study_reminders,opt_in_source,consent_version,unsubscribed_at,updated_at
    ) values(
      p_user_id,v_email,true,false,'founder_reservation',coalesce(v_consent_version,'2026-09'),null,now()
    )
    on conflict(user_id) do update
      set email=excluded.email,
          marketing_opt_in=true,
          opt_in_source='founder_reservation',
          consent_version=excluded.consent_version,
          unsubscribed_at=null,
          updated_at=now();
  end if;

  return v_result;
end;
$$;

revoke all on function public.register_founder_server_v2(text,boolean,text,inet) from public,anon,authenticated;
grant execute on function public.register_founder_server_v2(text,boolean,text,inet) to service_role;
revoke all on function public.activate_founder_access_v2(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.activate_founder_access_v2(uuid,text,text,text,text) to service_role;
