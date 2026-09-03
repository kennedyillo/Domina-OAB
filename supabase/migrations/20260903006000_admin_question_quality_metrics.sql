create or replace function public.admin_question_quality_metrics()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'mostWrong', coalesce((
      select jsonb_agg(to_jsonb(x))
      from (
        select
          q.id,
          q.code,
          left(q.statement, 180) as statement,
          count(sa.id)::int as answers,
          count(sa.id) filter (where sa.correct = false)::int as wrong_answers,
          case when count(sa.id) > 0
            then round((count(sa.id) filter (where sa.correct = false))::numeric * 100 / count(sa.id))::int
            else 0
          end as wrong_rate
        from public.questions q
        join public.simulation_answers sa on sa.question_id = q.id
        group by q.id, q.code, q.statement
        having count(sa.id) > 0
        order by wrong_rate desc, wrong_answers desc, answers desc, q.id
        limit 10
      ) x
    ), '[]'::jsonb),
    'mostReported', coalesce((
      select jsonb_agg(to_jsonb(x))
      from (
        select
          q.id,
          q.code,
          left(q.statement, 180) as statement,
          count(qr.id)::int as reports,
          count(qr.id) filter (where qr.status in ('pending','in_review'))::int as open_reports
        from public.questions q
        join public.question_reports qr on qr.question_id = q.id
        group by q.id, q.code, q.statement
        having count(qr.id) > 0
        order by reports desc, open_reports desc, q.id
        limit 10
      ) x
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.admin_question_quality_metrics() from public, anon, authenticated;
grant execute on function public.admin_question_quality_metrics() to service_role;
