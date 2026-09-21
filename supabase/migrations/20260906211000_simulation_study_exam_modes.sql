-- Separa o fluxo de estudo (feedback imediato + resposta imutável)
-- do simulado tradicional (resposta editável até a conclusão + gabarito só no fim).

alter table public.simulation_attempts
  add column if not exists mode text not null default 'study';

alter table public.simulation_attempts
  drop constraint if exists simulation_attempts_mode_check;

alter table public.simulation_attempts
  add constraint simulation_attempts_mode_check check (mode in ('study','exam'));

create or replace function public.prepare_simulation_v3(
  p_user_id uuid,
  p_slug text,
  p_mode text default 'study'
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_mode text := lower(trim(coalesce(p_mode,'study')));
  v_result jsonb;
  v_attempt_id bigint;
begin
  if v_mode not in ('study','exam') then raise exception 'invalid_simulation_mode'; end if;

  v_result := public.prepare_simulation(p_user_id,p_slug);
  v_attempt_id := nullif(v_result->>'attempt_id','')::bigint;

  if v_attempt_id is not null then
    update public.simulation_attempts
      set mode=v_mode,updated_at=now()
      where id=v_attempt_id and user_id=p_user_id;
  end if;

  return v_result || jsonb_build_object('mode',v_mode);
end;
$$;

-- O modo estudo continua imutável depois da primeira verificação e não pode
-- ser usado para espiar o gabarito de uma tentativa tradicional.
create or replace function public.verify_simulation_answer(
  p_user_id uuid,
  p_attempt_id bigint,
  p_question_id bigint,
  p_selected_index integer,
  p_option_order integer[] default null
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  q public.questions%rowtype;
  v_order integer[];
  v_original_index integer;
  v_correct boolean;
  v_owner uuid;
  v_expires timestamptz;
  v_mode text;
  v_persisted_correct boolean;
begin
  if p_selected_index not between 0 and 3 then raise exception 'invalid_option'; end if;

  if p_attempt_id is not null then
    select user_id,expires_at,mode into v_owner,v_expires,v_mode
    from public.simulation_attempts
    where id=p_attempt_id and status='started';
    if v_owner is null or p_user_id is null or v_owner<>p_user_id then raise exception 'attempt_not_found'; end if;
    if v_mode='exam' then raise exception 'exam_answer_hidden'; end if;
    if v_expires is not null and v_expires<=now() then
      update public.simulation_attempts set status='completed',completed_at=now(),updated_at=now() where id=p_attempt_id;
      raise exception 'simulation_expired';
    end if;
    select option_order into v_order
    from public.simulation_attempt_questions
    where attempt_id=p_attempt_id and question_id=p_question_id;
    if v_order is null then raise exception 'question_not_in_attempt'; end if;
  else
    v_order := p_option_order;
    if v_order is null or cardinality(v_order)<>4
      or not (0=any(v_order) and 1=any(v_order) and 2=any(v_order) and 3=any(v_order)) then
      raise exception 'invalid_option_order';
    end if;
  end if;

  select * into q from public.questions where id=p_question_id and status='published';
  if not found then raise exception 'question_not_found'; end if;

  v_original_index := v_order[p_selected_index+1];
  v_correct := v_original_index=q.correct_index;

  if p_attempt_id is not null then
    insert into public.simulation_answers(attempt_id,question_id,selected_index,correct)
    values(p_attempt_id,p_question_id,p_selected_index,v_correct)
    on conflict(attempt_id,question_id) do nothing;

    select correct into v_persisted_correct
    from public.simulation_answers
    where attempt_id=p_attempt_id and question_id=p_question_id;

    v_correct := v_persisted_correct;

    update public.simulation_attempts a set
      answered_questions=(select count(*)::int from public.simulation_answers where attempt_id=a.id),
      correct_answers=(select count(*)::int from public.simulation_answers where attempt_id=a.id and correct=true),
      updated_at=now()
    where a.id=p_attempt_id;
  end if;

  return jsonb_build_object(
    'correct',v_correct,
    'correct_index',array_position(v_order,q.correct_index)-1,
    'explanation',q.explanation,
    'answer_locked',p_attempt_id is not null
  );
end;
$$;

create or replace function public.record_exam_answer(
  p_user_id uuid,
  p_attempt_id bigint,
  p_question_id bigint,
  p_selected_index integer
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_owner uuid;
  v_expires timestamptz;
  v_mode text;
  v_order integer[];
  v_correct_index integer;
  v_original_index integer;
  v_correct boolean;
  v_answered integer;
begin
  if p_selected_index not between 0 and 3 then raise exception 'invalid_option'; end if;

  select user_id,expires_at,mode into v_owner,v_expires,v_mode
  from public.simulation_attempts
  where id=p_attempt_id and status='started';

  if v_owner is null or p_user_id is null or v_owner<>p_user_id then raise exception 'attempt_not_found'; end if;
  if v_mode<>'exam' then raise exception 'invalid_simulation_mode'; end if;
  if v_expires is not null and v_expires<=now() then
    update public.simulation_attempts set status='completed',completed_at=now(),updated_at=now() where id=p_attempt_id;
    raise exception 'simulation_expired';
  end if;

  select aq.option_order,q.correct_index into v_order,v_correct_index
  from public.simulation_attempt_questions aq
  join public.questions q on q.id=aq.question_id and q.status='published'
  where aq.attempt_id=p_attempt_id and aq.question_id=p_question_id;

  if v_order is null or v_correct_index is null then raise exception 'question_not_in_attempt'; end if;

  v_original_index := v_order[p_selected_index+1];
  v_correct := v_original_index=v_correct_index;

  insert into public.simulation_answers(attempt_id,question_id,selected_index,correct)
  values(p_attempt_id,p_question_id,p_selected_index,v_correct)
  on conflict(attempt_id,question_id) do update set
    selected_index=excluded.selected_index,
    correct=excluded.correct,
    answered_at=now();

  select count(*)::int into v_answered from public.simulation_answers where attempt_id=p_attempt_id;

  update public.simulation_attempts a set
    answered_questions=v_answered,
    correct_answers=(select count(*)::int from public.simulation_answers where attempt_id=a.id and correct=true),
    updated_at=now()
  where a.id=p_attempt_id;

  -- Deliberadamente não retorna correct/correct_index/explanation.
  return jsonb_build_object('recorded',true,'answered',v_answered);
end;
$$;

create or replace function public.finish_exam_simulation(
  p_user_id uuid,
  p_attempt_id bigint
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v public.simulation_attempts%rowtype;
  v_results jsonb;
begin
  select * into v
  from public.simulation_attempts
  where id=p_attempt_id and user_id=p_user_id and mode='exam';
  if not found then raise exception 'attempt_not_found'; end if;

  if v.status='started' then
    update public.simulation_attempts
      set status='completed',completed_at=coalesce(completed_at,now()),updated_at=now()
      where id=p_attempt_id
      returning * into v;
  elsif v.status<>'completed' then
    raise exception 'attempt_not_found';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'question_id',aq.question_id,
    'selected_index',sa.selected_index,
    'correct',sa.correct,
    'correct_index',array_position(aq.option_order,q.correct_index)-1,
    'explanation',q.explanation
  ) order by aq.position),'[]'::jsonb)
  into v_results
  from public.simulation_attempt_questions aq
  join public.questions q on q.id=aq.question_id
  left join public.simulation_answers sa
    on sa.attempt_id=aq.attempt_id and sa.question_id=aq.question_id
  where aq.attempt_id=p_attempt_id;

  return jsonb_build_object(
    'attempt_id',v.id,
    'answered',v.answered_questions,
    'correct',v.correct_answers,
    'total',v.total_questions,
    'score_percent',case when v.total_questions>0 then round(v.correct_answers::numeric/v.total_questions*100)::int else 0 end,
    'results',v_results
  );
end;
$$;

revoke all on function public.prepare_simulation_v3(uuid,text,text) from public,anon,authenticated;
revoke all on function public.verify_simulation_answer(uuid,bigint,bigint,integer,integer[]) from public,anon,authenticated;
revoke all on function public.record_exam_answer(uuid,bigint,bigint,integer) from public,anon,authenticated;
revoke all on function public.finish_exam_simulation(uuid,bigint) from public,anon,authenticated;

grant execute on function public.prepare_simulation_v3(uuid,text,text) to service_role;
grant execute on function public.verify_simulation_answer(uuid,bigint,bigint,integer,integer[]) to service_role;
grant execute on function public.record_exam_answer(uuid,bigint,bigint,integer) to service_role;
grant execute on function public.finish_exam_simulation(uuid,bigint) to service_role;
