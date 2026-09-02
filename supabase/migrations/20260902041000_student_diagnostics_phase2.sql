-- Domina OAB - Fase 2: diagnóstico e evolução do aluno

create or replace function public.student_diagnostics(p_user_id uuid)
returns jsonb
language sql
security definer
set search_path=public
as $$
with attempts as (
  select a.*,
    case when a.total_questions>0 then round(a.correct_answers::numeric/a.total_questions*100)::int else 0 end score
  from public.simulation_attempts a
  where a.user_id=p_user_id and a.status='completed'
), topic_stats as (
  select d.name discipline,t.name topic,
    count(sa.*)::int answers,
    count(*) filter(where sa.correct)::int correct,
    round((count(*) filter(where sa.correct))::numeric/nullif(count(sa.*),0)*100)::int accuracy
  from public.simulation_answers sa
  join public.simulation_attempts a on a.id=sa.attempt_id and a.user_id=p_user_id and a.status='completed'
  join public.questions q on q.id=sa.question_id
  join public.disciplines d on d.id=q.discipline_id
  left join public.question_topics t on t.id=q.topic_id
  group by d.name,t.name
), recent as (
  select a.id,coalesce(s.name,d.name,'Simulado') name,a.started_at,a.completed_at,a.total_questions,a.correct_answers,a.score
  from attempts a
  left join public.simulation_definitions s on s.id=a.definition_id
  left join public.disciplines d on d.id=a.discipline_id
  order by a.completed_at desc
  limit 20
)
select jsonb_build_object(
  'summary',jsonb_build_object(
    'completed',(select count(*)::int from attempts),
    'averageScore',(select coalesce(round(avg(score))::int,0) from attempts),
    'bestScore',(select coalesce(max(score),0) from attempts),
    'latestScore',(select coalesce(score,0) from attempts order by completed_at desc limit 1),
    'previousScore',(select coalesce(score,0) from attempts order by completed_at desc offset 1 limit 1),
    'totalAnswers',(select count(*)::int from public.simulation_answers sa join public.simulation_attempts a on a.id=sa.attempt_id where a.user_id=p_user_id and a.status='completed'),
    'totalCorrect',(select count(*)::int from public.simulation_answers sa join public.simulation_attempts a on a.id=sa.attempt_id where a.user_id=p_user_id and a.status='completed' and sa.correct)
  ),
  'topics',coalesce((select jsonb_agg(to_jsonb(x) order by x.accuracy asc,x.answers desc) from topic_stats x),'[]'::jsonb),
  'recent',coalesce((select jsonb_agg(to_jsonb(x) order by x.completed_at desc) from recent x),'[]'::jsonb),
  'priorities',coalesce((select jsonb_agg(to_jsonb(x) order by x.accuracy asc,x.answers desc) from (select * from topic_stats where answers>=2 order by accuracy asc,answers desc limit 5) x),'[]'::jsonb),
  'strengths',coalesce((select jsonb_agg(to_jsonb(x) order by x.accuracy desc,x.answers desc) from (select * from topic_stats where answers>=2 order by accuracy desc,answers desc limit 5) x),'[]'::jsonb)
);
$$;

revoke all on function public.student_diagnostics(uuid) from public,anon,authenticated;
grant execute on function public.student_diagnostics(uuid) to service_role;

create or replace function public.admin_user_diagnostics(p_user_id uuid)
returns jsonb
language sql
security definer
set search_path=public
as $$ select public.student_diagnostics(p_user_id); $$;

revoke all on function public.admin_user_diagnostics(uuid) from public,anon,authenticated;
grant execute on function public.admin_user_diagnostics(uuid) to service_role;
