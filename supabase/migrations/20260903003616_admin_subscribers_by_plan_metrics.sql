create or replace function public.admin_growth_metrics()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  with new_users as (
    select count(*)::int as total
    from auth.users
    where created_at >= now() - interval '30 days'
  ),
  active_users as (
    select count(*)::int as total
    from auth.users
    where last_sign_in_at >= now() - interval '30 days'
  ),
  sessions as (
    select count(distinct session_id)::int as total
    from public.analytics_events
    where created_at >= now() - interval '30 days'
  ),
  subscribers_by_plan as (
    select p.id, p.name, count(e.id)::int as total
    from public.plans p
    left join public.entitlements e
      on e.plan_id = p.id
      and e.status = 'active'
      and (e.ends_at is null or e.ends_at > now())
    group by p.id, p.name, p.price_cents
    order by p.price_cents asc
  )
  select jsonb_build_object(
    'newRegistrations', (select total from new_users),
    'activeUsers', (select total from active_users),
    'conversionRate', case
      when (select total from sessions) > 0 then round(((select total from new_users)::numeric / (select total from sessions)) * 100)::int
      else 0
    end,
    'subscribersByPlan', coalesce((select jsonb_agg(to_jsonb(s)) from subscribers_by_plan s), '[]'::jsonb)
  );
$$;

revoke all on function public.admin_growth_metrics() from public, anon, authenticated;
grant execute on function public.admin_growth_metrics() to service_role;