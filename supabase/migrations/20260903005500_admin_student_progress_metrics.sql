create or replace function public.admin_student_progress_metrics()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  with completed as (
    select
      user_id,
      discipline_id,
      id,
      completed_at,
      case when total_questions > 0 then (correct_answers::numeric * 100 / total_questions) else null end as score
    from public.simulation_attempts
    where status = 'completed'
      and completed_at is not null
      and total_questions > 0
  ), ranked as (
    select
      *,
      row_number() over (partition by user_id, discipline_id order by completed_at asc, id asc) as rn_first,
      row_number() over (partition by user_id, discipline_id order by completed_at desc, id desc) as rn_last,
      count(*) over (partition by user_id, discipline_id) as attempts_in_group
    from completed
  ), pairs as (
    select
      f.user_id,
      f.discipline_id,
      f.score as first_score,
      l.score as last_score
    from ranked f
    join ranked l
      on l.user_id = f.user_id
     and l.discipline_id = f.discipline_id
    where f.rn_first = 1
      and l.rn_last = 1
      and f.attempts_in_group >= 2
  )
  select jsonb_build_object(
    'comparablePairs', count(*)::int,
    'averageFirstScore', coalesce(round(avg(first_score),1),0),
    'averageLatestScore', coalesce(round(avg(last_score),1),0),
    'averageEvolution', coalesce(round(avg(last_score - first_score),1),0)
  )
  from pairs;
$$;

revoke all on function public.admin_student_progress_metrics() from public, anon, authenticated;
grant execute on function public.admin_student_progress_metrics() to service_role;
