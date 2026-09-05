-- Persist expiration instead of raising after UPDATE.
-- A PostgreSQL exception would roll back the status change in the same transaction.

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
  v_persisted_correct boolean;
begin
  if p_selected_index not between 0 and 3 then raise exception 'invalid_option'; end if;

  if p_attempt_id is not null then
    select user_id,expires_at into v_owner,v_expires
    from public.simulation_attempts
    where id=p_attempt_id and status='started';
    if v_owner is null or p_user_id is null or v_owner<>p_user_id then raise exception 'attempt_not_found'; end if;
    if v_expires is not null and v_expires<=now() then
      update public.simulation_attempts
      set status='completed',completed_at=coalesce(completed_at,now()),updated_at=now()
      where id=p_attempt_id and status='started';
      return jsonb_build_object('expired',true,'answer_locked',true);
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

revoke all on function public.verify_simulation_answer(uuid,bigint,bigint,integer,integer[]) from public,anon,authenticated;
grant execute on function public.verify_simulation_answer(uuid,bigint,bigint,integer,integer[]) to service_role;
