alter table public.questions add column if not exists exam_edition text;
alter table public.question_versions add column if not exists exam_edition text;

create or replace function public.admin_filtered_analytics(
  p_days integer default 30,
  p_plan_id text default null,
  p_discipline_id bigint default null,
  p_source text default null,
  p_exam_edition text default null
) returns jsonb
language sql
security definer
set search_path=public
as $$
with params as (
  select greatest(1,least(coalesce(p_days,30),3650))::int as days
),
traffic as (
  select
    count(*) filter (where ae.event_type='page_view')::int as page_views,
    count(distinct ae.session_id)::int as sessions
  from public.analytics_events ae, params p
  where ae.created_at >= now() - make_interval(days=>p.days)
    and (p_source is null or coalesce(nullif(ae.utm_source,''),'Direto / sem UTM')=p_source)
),
sources as (
  select coalesce(jsonb_agg(to_jsonb(x) order by x.total desc),'[]'::jsonb) value
  from (
    select coalesce(nullif(ae.utm_source,''),'Direto / sem UTM') source,count(*)::int total
    from public.analytics_events ae, params p
    where ae.event_type='page_view'
      and ae.created_at >= now() - make_interval(days=>p.days)
      and (p_source is null or coalesce(nullif(ae.utm_source,''),'Direto / sem UTM')=p_source)
    group by 1 order by total desc limit 20
  ) x
),
financial as (
  select
    count(*) filter(where pay.status='approved')::int approved,
    coalesce(sum(pay.gross_amount_cents) filter(where pay.status='approved'),0)::bigint gross,
    coalesce(sum(pay.net_amount_cents) filter(where pay.status='approved'),0)::bigint net,
    coalesce(sum(pay.gross_amount_cents) filter(where pay.status='pending'),0)::bigint pending,
    count(*) filter(where pay.status in ('refunded','charged_back','cancelled'))::int reversed
  from public.payments pay, params p
  where pay.created_at >= now() - make_interval(days=>p.days)
    and (p_plan_id is null or pay.plan_id=p_plan_id)
),
learning as (
  select
    count(distinct sa.id)::int answers,
    count(*) filter(where sa.correct=true)::int correct,
    count(*) filter(where sa.correct=false)::int wrong,
    round(coalesce(avg(case when sa.correct then 100.0 else 0 end),0),1) accuracy
  from public.simulation_answers sa
  join public.simulation_attempts att on att.id=sa.attempt_id
  join public.questions q on q.id=sa.question_id
  , params p
  where sa.answered_at >= now() - make_interval(days=>p.days)
    and (p_discipline_id is null or att.discipline_id=p_discipline_id)
    and (p_exam_edition is null or q.exam_edition=p_exam_edition)
),
wrong_questions as (
  select coalesce(jsonb_agg(to_jsonb(x) order by x.wrong_rate desc,x.answers desc),'[]'::jsonb) value
  from (
    select q.id,q.code,q.statement,q.exam_edition,d.name discipline,
      count(sa.id)::int answers,
      count(*) filter(where sa.correct=false)::int wrong_answers,
      round((count(*) filter(where sa.correct=false)::numeric/nullif(count(sa.id),0))*100,1) wrong_rate
    from public.simulation_answers sa
    join public.simulation_attempts att on att.id=sa.attempt_id
    join public.questions q on q.id=sa.question_id
    join public.disciplines d on d.id=q.discipline_id
    , params p
    where sa.answered_at >= now() - make_interval(days=>p.days)
      and (p_discipline_id is null or q.discipline_id=p_discipline_id)
      and (p_exam_edition is null or q.exam_edition=p_exam_edition)
    group by q.id,q.code,q.statement,q.exam_edition,d.name
    having count(sa.id)>0
    order by wrong_rate desc,answers desc limit 20
  ) x
),
reported_questions as (
  select coalesce(jsonb_agg(to_jsonb(x) order by x.reports desc),'[]'::jsonb) value
  from (
    select q.id,q.code,q.statement,q.exam_edition,d.name discipline,count(r.id)::int reports,
      count(*) filter(where r.status in ('open','reviewing'))::int open_reports
    from public.question_reports r
    join public.questions q on q.id=r.question_id
    join public.disciplines d on d.id=q.discipline_id
    , params p
    where r.created_at >= now() - make_interval(days=>p.days)
      and (p_discipline_id is null or q.discipline_id=p_discipline_id)
      and (p_exam_edition is null or q.exam_edition=p_exam_edition)
    group by q.id,q.code,q.statement,q.exam_edition,d.name
    order by reports desc limit 20
  ) x
),
timed_questions as (
  select coalesce(jsonb_agg(to_jsonb(x) order by x.average_response_time_ms desc),'[]'::jsonb) value
  from (
    select q.id,q.code,q.statement,q.exam_edition,d.name discipline,
      count(sa.id)::int timed_answers,round(avg(sa.response_time_ms))::bigint average_response_time_ms
    from public.simulation_answers sa
    join public.questions q on q.id=sa.question_id
    join public.disciplines d on d.id=q.discipline_id
    , params p
    where sa.response_time_ms is not null
      and sa.answered_at >= now() - make_interval(days=>p.days)
      and (p_discipline_id is null or q.discipline_id=p_discipline_id)
      and (p_exam_edition is null or q.exam_edition=p_exam_edition)
    group by q.id,q.code,q.statement,q.exam_edition,d.name
    order by average_response_time_ms desc limit 20
  ) x
),
options as (
 select jsonb_build_object(
   'plans',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name) order by price_cents) from public.plans),'[]'::jsonb),
   'disciplines',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name) order by position) from public.disciplines where active),'[]'::jsonb),
   'sources',coalesce((select jsonb_agg(source order by source) from (select distinct coalesce(nullif(utm_source,''),'Direto / sem UTM') source from public.analytics_events) s),'[]'::jsonb),
   'editions',coalesce((select jsonb_agg(exam_edition order by exam_edition desc) from (select distinct exam_edition from public.questions where exam_edition is not null and exam_edition<>'') e),'[]'::jsonb)
 ) value
)
select jsonb_build_object(
  'periodDays',(select days from params),
  'traffic',jsonb_build_object('pageViews',(select page_views from traffic),'sessions',(select sessions from traffic),'sources',(select value from sources)),
  'financial',jsonb_build_object('approved',(select approved from financial),'gross',(select gross from financial),'net',(select net from financial),'pending',(select pending from financial),'reversed',(select reversed from financial)),
  'learning',jsonb_build_object('answers',(select answers from learning),'correct',(select correct from learning),'wrong',(select wrong from learning),'accuracy',(select accuracy from learning)),
  'questions',jsonb_build_object('mostWrong',(select value from wrong_questions),'mostReported',(select value from reported_questions),'slowest',(select value from timed_questions)),
  'options',(select value from options)
);
$$;

revoke all on function public.admin_filtered_analytics(integer,text,bigint,text,text) from public,anon,authenticated;
grant execute on function public.admin_filtered_analytics(integer,text,bigint,text,text) to service_role;