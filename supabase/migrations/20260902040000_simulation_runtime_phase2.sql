-- Domina OAB - Fase 2: runtime dos simulados controlado pelo catálogo

alter table public.simulation_attempts
  alter column discipline_id drop not null,
  add column if not exists definition_id bigint references public.simulation_definitions(id) on delete set null,
  add column if not exists time_limit_minutes integer,
  add column if not exists expires_at timestamptz;

create index if not exists simulation_attempts_definition_started_idx
  on public.simulation_attempts(definition_id,started_at desc);

create table if not exists public.simulation_attempt_questions (
  attempt_id bigint not null references public.simulation_attempts(id) on delete cascade,
  question_id bigint not null references public.questions(id),
  position integer not null,
  option_order integer[] not null default array[0,1,2,3],
  primary key(attempt_id,question_id),
  unique(attempt_id,position),
  check (cardinality(option_order)=4)
);

alter table public.simulation_attempt_questions enable row level security;
revoke all on table public.simulation_attempt_questions from anon,authenticated;
grant select,insert,update,delete on public.simulation_attempt_questions to service_role;

-- Mantém um simulado funcional por padrão usando as 3 questões demonstrativas já semeadas.
insert into public.simulation_definitions(
  slug,name,description,discipline_id,question_count,time_limit_minutes,
  randomize_questions,randomize_options,status,position,created_by_email,updated_by_email
)
select
  'simulado-etica','Simulado de Ética Profissional',
  'Sessão demonstrativa controlada pelo catálogo administrativo.',
  d.id,3,30,true,false,'published',1,'system','system'
from public.disciplines d
where d.slug='etica-profissional'
  and (select count(*) from public.questions q where q.discipline_id=d.id and q.status='published') >= 3
on conflict(slug) do nothing;

create or replace function public.prepare_simulation(
  p_user_id uuid,
  p_slug text
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  s public.simulation_definitions%rowtype;
  v_attempt_id bigint;
  v_saved boolean := false;
  v_questions jsonb := '[]'::jsonb;
  r record;
  v_position integer := 0;
  v_order integer[];
  v_options jsonb;
begin
  select * into s
  from public.simulation_definitions
  where slug=trim(p_slug) and status='published'
  limit 1;
  if not found then raise exception 'simulation_not_available'; end if;

  if p_user_id is not null
    and exists(select 1 from public.user_profiles where user_id=p_user_id and account_status='active')
    and exists(select 1 from public.entitlements where user_id=p_user_id and status='active' and ends_at>now()) then
    v_saved := true;
    update public.simulation_attempts
      set status='abandoned',updated_at=now()
      where user_id=p_user_id and definition_id=s.id and status='started';
    insert into public.simulation_attempts(
      user_id,discipline_id,definition_id,status,total_questions,time_limit_minutes,expires_at
    ) values(
      p_user_id,s.discipline_id,s.id,'started',s.question_count,s.time_limit_minutes,
      case when s.time_limit_minutes is null then null else now()+make_interval(mins=>s.time_limit_minutes) end
    ) returning id into v_attempt_id;
  end if;

  for r in
    select q.id,q.code,d.slug discipline_slug,d.name discipline,t.name topic,
      q.statement,q.options,q.difficulty,q.position
    from public.questions q
    join public.disciplines d on d.id=q.discipline_id
    left join public.question_topics t on t.id=q.topic_id
    where q.status='published'
      and (s.discipline_id is null or q.discipline_id=s.discipline_id)
      and (cardinality(s.topic_ids)=0 or q.topic_id=any(s.topic_ids))
    order by
      case when s.randomize_questions then random() else 0 end,
      q.position,q.id
    limit s.question_count
  loop
    v_position := v_position + 1;
    if s.randomize_options then
      select array_agg(x order by random()) into v_order from unnest(array[0,1,2,3]) x;
    else
      v_order := array[0,1,2,3];
    end if;
    v_options := jsonb_build_array(
      (r.options -> v_order[1]),(r.options -> v_order[2]),(r.options -> v_order[3]),(r.options -> v_order[4])
    );
    if v_saved then
      insert into public.simulation_attempt_questions(attempt_id,question_id,position,option_order)
      values(v_attempt_id,r.id,v_position,v_order);
    end if;
    v_questions := v_questions || jsonb_build_array(jsonb_build_object(
      'id',r.id,'code',r.code,'discipline_slug',r.discipline_slug,'discipline',r.discipline,
      'topic',r.topic,'statement',r.statement,'options',v_options,'difficulty',r.difficulty,
      'position',v_position,'option_order',to_jsonb(v_order)
    ));
  end loop;

  if jsonb_array_length(v_questions) < s.question_count then
    if v_attempt_id is not null then delete from public.simulation_attempts where id=v_attempt_id; end if;
    raise exception 'insufficient_published_questions';
  end if;

  return jsonb_build_object(
    'definition',jsonb_build_object(
      'id',s.id,'slug',s.slug,'name',s.name,'description',s.description,
      'question_count',s.question_count,'time_limit_minutes',s.time_limit_minutes,
      'randomize_questions',s.randomize_questions,'randomize_options',s.randomize_options
    ),
    'saved',v_saved,
    'attempt_id',v_attempt_id,
    'questions',v_questions
  );
end;
$$;

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
begin
  if p_selected_index not between 0 and 3 then raise exception 'invalid_option'; end if;

  if p_attempt_id is not null then
    select user_id,expires_at into v_owner,v_expires
    from public.simulation_attempts
    where id=p_attempt_id and status='started';
    if v_owner is null or p_user_id is null or v_owner<>p_user_id then raise exception 'attempt_not_found'; end if;
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
    on conflict(attempt_id,question_id) do update set
      selected_index=excluded.selected_index,correct=excluded.correct,answered_at=now();
    update public.simulation_attempts a set
      answered_questions=(select count(*)::int from public.simulation_answers where attempt_id=a.id),
      correct_answers=(select count(*)::int from public.simulation_answers where attempt_id=a.id and correct=true),
      updated_at=now()
    where a.id=p_attempt_id;
  end if;

  return jsonb_build_object(
    'correct',v_correct,
    'correct_index',array_position(v_order,q.correct_index)-1,
    'explanation',q.explanation
  );
end;
$$;

create or replace function public.finish_simulation_v2(p_user_id uuid,p_attempt_id bigint)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare v public.simulation_attempts%rowtype;
begin
  update public.simulation_attempts
  set status='completed',completed_at=coalesce(completed_at,now()),updated_at=now()
  where id=p_attempt_id and user_id=p_user_id and status='started'
  returning * into v;
  if not found then
    select * into v from public.simulation_attempts where id=p_attempt_id and user_id=p_user_id and status='completed';
    if not found then raise exception 'attempt_not_found'; end if;
  end if;
  return jsonb_build_object(
    'attempt_id',v.id,'answered',v.answered_questions,'correct',v.correct_answers,'total',v.total_questions,
    'score_percent',case when v.total_questions>0 then round(v.correct_answers::numeric/v.total_questions*100)::int else 0 end
  );
end;
$$;

revoke all on function public.prepare_simulation(uuid,text) from public,anon,authenticated;
revoke all on function public.verify_simulation_answer(uuid,bigint,bigint,integer,integer[]) from public,anon,authenticated;
revoke all on function public.finish_simulation_v2(uuid,bigint) from public,anon,authenticated;
grant execute on function public.prepare_simulation(uuid,text) to service_role;
grant execute on function public.verify_simulation_answer(uuid,bigint,bigint,integer,integer[]) to service_role;
grant execute on function public.finish_simulation_v2(uuid,bigint) to service_role;
