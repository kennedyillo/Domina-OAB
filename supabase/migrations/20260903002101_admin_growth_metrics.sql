create or replace function public.admin_growth_metrics()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  with sessions as (
    select count(distinct session_id)::int as total
    from public.analytics_events
    where created_at >= now() - interval '30 days'
  ),
  registrations as (
    select count(*)::int as total
    from auth.users
    where created_at >= now() - interval '30 days'
  )
  select jsonb_build_object(
    'newRegistrations', (select total from registrations),
    'conversionRate', case
      when (select total from sessions) > 0 then
        round(((select total from registrations)::numeric / (select total from sessions)) * 100, 1)
      else 0
    end
  );
$$;

revoke all on function public.admin_growth_metrics() from public, anon, authenticated;
grant execute on function public.admin_growth_metrics() to service_role;