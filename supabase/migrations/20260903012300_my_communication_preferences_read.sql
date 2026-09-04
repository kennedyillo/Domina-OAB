create or replace function public.my_communication_preferences(p_user_id uuid)
returns jsonb language sql security definer set search_path=public as $$
 select jsonb_build_object(
  'marketing_opt_in',coalesce(cp.marketing_opt_in,false),
  'study_reminders',coalesce(cp.study_reminders,false),
  'transactional_enabled',coalesce(cp.transactional_enabled,true),
  'unsubscribed_at',cp.unsubscribed_at,
  'consent_version',cp.consent_version
 ) from public.user_profiles p left join public.communication_preferences cp on cp.user_id=p.user_id where p.user_id=p_user_id;
$$;
revoke all on function public.my_communication_preferences(uuid) from public,anon,authenticated;
grant execute on function public.my_communication_preferences(uuid) to service_role;