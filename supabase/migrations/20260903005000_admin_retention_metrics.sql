create or replace function public.admin_retention_metrics()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  with cohort as (
    select id as user_id, created_at
    from auth.users
    where created_at >= now() - interval '120 days'
  ), retention as (
    select
      count(*) filter (where created_at <= now() - interval '1 day')::int as cohort_d1,
      count(*) filter (where created_at <= now() - interval '7 days')::int as cohort_d7,
      count(*) filter (where created_at <= now() - interval '15 days')::int as cohort_d15,
      count(*) filter (where created_at <= now() - interval '30 days')::int as cohort_d30,
      count(*) filter (
        where created_at <= now() - interval '1 day'
          and exists (
            select 1 from public.simulation_attempts s
            where s.user_id = cohort.user_id
              and s.started_at >= cohort.created_at + interval '1 day'
              and s.started_at < cohort.created_at + interval '2 days'
          )
      )::int as retained_d1,
      count(*) filter (
        where created_at <= now() - interval '7 days'
          and exists (
            select 1 from public.simulation_attempts s
            where s.user_id = cohort.user_id
              and s.started_at >= cohort.created_at + interval '7 days'
              and s.started_at < cohort.created_at + interval '8 days'
          )
      )::int as retained_d7,
      count(*) filter (
        where created_at <= now() - interval '15 days'
          and exists (
            select 1 from public.simulation_attempts s
            where s.user_id = cohort.user_id
              and s.started_at >= cohort.created_at + interval '15 days'
              and s.started_at < cohort.created_at + interval '16 days'
          )
      )::int as retained_d15,
      count(*) filter (
        where created_at <= now() - interval '30 days'
          and exists (
            select 1 from public.simulation_attempts s
            where s.user_id = cohort.user_id
              and s.started_at >= cohort.created_at + interval '30 days'
              and s.started_at < cohort.created_at + interval '31 days'
          )
      )::int as retained_d30
    from cohort
  )
  select jsonb_build_object(
    'd1', case when cohort_d1 > 0 then round(retained_d1::numeric * 100 / cohort_d1)::int else 0 end,
    'd7', case when cohort_d7 > 0 then round(retained_d7::numeric * 100 / cohort_d7)::int else 0 end,
    'd15', case when cohort_d15 > 0 then round(retained_d15::numeric * 100 / cohort_d15)::int else 0 end,
    'd30', case when cohort_d30 > 0 then round(retained_d30::numeric * 100 / cohort_d30)::int else 0 end,
    'cohortD1', cohort_d1,
    'cohortD7', cohort_d7,
    'cohortD15', cohort_d15,
    'cohortD30', cohort_d30
  )
  from retention;
$$;

revoke all on function public.admin_retention_metrics() from public, anon, authenticated;
grant execute on function public.admin_retention_metrics() to service_role;
