create or replace function public.admin_set_communication_preferences(p_user_id uuid,p_marketing_opt_in boolean,p_study_reminders boolean)
returns void language plpgsql security definer set search_path=public as $$
declare v_email text;
begin
 select email into v_email from public.user_profiles where user_id=p_user_id; if v_email is null then raise exception 'user_not_found'; end if;
 insert into public.communication_preferences(user_id,email,marketing_opt_in,study_reminders,opt_in_source,consent_version,unsubscribed_at,updated_at)
 values(p_user_id,v_email,p_marketing_opt_in,p_study_reminders,'admin','2026-09',case when not p_marketing_opt_in and not p_study_reminders then now() else null end,now())
 on conflict(user_id) do update set email=excluded.email,marketing_opt_in=excluded.marketing_opt_in,study_reminders=excluded.study_reminders,
  unsubscribed_at=case when excluded.marketing_opt_in or excluded.study_reminders then null else coalesce(public.communication_preferences.unsubscribed_at,now()) end,updated_at=now();
end; $$;

create or replace function public.set_my_communication_preferences(p_user_id uuid,p_marketing_opt_in boolean,p_study_reminders boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_email text;
begin
 if p_user_id is null then raise exception 'authentication_required'; end if;
 select email into v_email from public.user_profiles where user_id=p_user_id; if v_email is null then raise exception 'user_not_found'; end if;
 insert into public.communication_preferences(user_id,email,marketing_opt_in,study_reminders,opt_in_source,consent_version,unsubscribed_at,updated_at)
 values(p_user_id,v_email,p_marketing_opt_in,p_study_reminders,'account','2026-09',case when not p_marketing_opt_in and not p_study_reminders then now() else null end,now())
 on conflict(user_id) do update set email=excluded.email,marketing_opt_in=excluded.marketing_opt_in,study_reminders=excluded.study_reminders,opt_in_source='account',consent_version='2026-09',
  unsubscribed_at=case when excluded.marketing_opt_in or excluded.study_reminders then null else coalesce(public.communication_preferences.unsubscribed_at,now()) end,updated_at=now();
 return jsonb_build_object('ok',true,'marketing_opt_in',p_marketing_opt_in,'study_reminders',p_study_reminders,'unsubscribed',not p_marketing_opt_in and not p_study_reminders);
end; $$;

revoke all on function public.set_my_communication_preferences(uuid,boolean,boolean) from public,anon,authenticated;
grant execute on function public.set_my_communication_preferences(uuid,boolean,boolean) to service_role;
