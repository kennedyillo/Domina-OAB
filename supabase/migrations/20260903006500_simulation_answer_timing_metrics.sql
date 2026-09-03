alter table public.simulation_answers
  add column if not exists response_time_ms integer;

alter table public.simulation_answers
  drop constraint if exists simulation_answers_response_time_ms_check;

alter table public.simulation_answers
  add constraint simulation_answers_response_time_ms_check
  check (response_time_ms is null or response_time_ms between 0 and 3600000);

create or replace function public.record_simulation_answer_timing(
  p_user_id uuid,
  p_attempt_id bigint,
  p_question_id bigint,
  p_response_time_ms integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
begin
  if p_user_id is null then
    return;
  end if;
  if p_response_time_ms is null or p_response_time_ms < 0 or p_response_time_ms > 3600000 then
    raise exception 'invalid_response_time';
  end if;
  select user_id into v_owner from public.simulation_attempts where id = p_attempt_id;
  if v_owner is null or v_owner <> p_user_id then raise exception 'attempt_not_found'; end if;
  update public.simulation_answers
  set response_time_ms = p_response_time_ms
  where attempt_id = p_attempt_id and question_id = p_question_id;
end;
$$;

revoke all on function public.record_simulation_answer_timing(uuid,bigint,bigint,integer) from public, anon, authenticated;
grant execute on function public.record_simulation_answer_timing(uuid,bigint,bigint,integer) to service_role;

create or replace function public.admin_question_timing_metrics()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'slowest', coalesce((
      select jsonb_agg(to_jsonb(x))
      from (
        select q.id,q.code,left(q.statement,180) as statement,
          count(sa.id)::int as timed_answers,
          round(avg(sa.response_time_ms))::int as average_response_time_ms
        from public.questions q
        join public.simulation_answers sa on sa.question_id=q.id
        where sa.response_time_ms is not null
        group by q.id,q.code,q.statement
        having count(sa.id)>0
        order by average_response_time_ms desc,timed_answers desc,q.id
        limit 10
      ) x
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.admin_question_timing_metrics() from public, anon, authenticated;
grant execute on function public.admin_question_timing_metrics() to service_role;
