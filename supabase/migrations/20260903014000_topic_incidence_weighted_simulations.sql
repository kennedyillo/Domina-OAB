-- Domina OAB — incidência histórica e seleção ponderada de questões
-- A aleatoriedade continua existindo, mas temas mais recorrentes no Exame de Ordem
-- recebem maior probabilidade de compor cada simulado.

alter table public.question_topics
  add column if not exists historical_occurrences integer not null default 0 check (historical_occurrences >= 0),
  add column if not exists incidence_weight numeric(6,3) not null default 1.000 check (incidence_weight > 0),
  add column if not exists incidence_source text,
  add column if not exists incidence_updated_at timestamptz;

alter table public.simulation_definitions
  add column if not exists use_incidence_weights boolean not null default true;

-- Calibração editorial inicial de Ética. Estes pesos são relativos, não percentuais.
-- Serão refinados conforme a classificação histórica das provas oficiais for ampliada.
update public.question_topics t
set incidence_weight=x.weight,
    incidence_source='calibracao-inicial-provas-anteriores-oab-fgv',
    incidence_updated_at=now()
from public.disciplines d
join (values
  ('atos-privativos',2.500::numeric),
  ('inscricao-oab',3.500::numeric),
  ('direitos-prerrogativas',5.000::numeric),
  ('mandato-renuncia',3.000::numeric),
  ('sigilo-profissional',3.000::numeric),
  ('honorarios-advocaticios',4.500::numeric),
  ('sociedade-advogados',3.500::numeric),
  ('incompatibilidades-impedimentos',5.000::numeric),
  ('infracoes-sancoes',4.500::numeric),
  ('publicidade-marketing',4.000::numeric),
  ('orgaos-oab',2.500::numeric)
) as x(slug,weight) on true
where t.discipline_id=d.id
  and d.slug='etica-profissional'
  and t.slug=x.slug;

create or replace function public.admin_set_topic_incidence(
  p_topic_id bigint,
  p_historical_occurrences integer,
  p_incidence_weight numeric,
  p_incidence_source text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if p_historical_occurrences < 0 then raise exception 'invalid_historical_occurrences'; end if;
  if p_incidence_weight <= 0 or p_incidence_weight > 100 then raise exception 'invalid_incidence_weight'; end if;

  update public.question_topics
  set historical_occurrences=p_historical_occurrences,
      incidence_weight=p_incidence_weight,
      incidence_source=nullif(trim(coalesce(p_incidence_source,'')),''),
      incidence_updated_at=now(),
      updated_at=now()
  where id=p_topic_id;

  if not found then raise exception 'topic_not_found'; end if;
end;
$$;

create or replace function public.admin_topic_incidence(p_discipline_slug text default null)
returns jsonb
language sql
security definer
set search_path=public
as $$
  select coalesce(jsonb_agg(to_jsonb(x) order by x.discipline_position,x.topic_position,x.topic_id),'[]'::jsonb)
  from (
    select d.slug discipline_slug,d.name discipline,d.position discipline_position,
      t.id topic_id,t.slug topic_slug,t.name topic,t.position topic_position,
      t.historical_occurrences,t.incidence_weight,t.incidence_source,t.incidence_updated_at,
      (select count(*)::int from public.questions q where q.topic_id=t.id and q.status='published') published_questions,
      (select count(*)::int from public.questions q where q.topic_id=t.id and q.status in ('draft','reviewing')) editorial_questions
    from public.question_topics t
    join public.disciplines d on d.id=t.discipline_id
    where t.active=true and d.active=true
      and (coalesce(trim(p_discipline_slug),'')='' or d.slug=trim(p_discipline_slug))
  ) x;
$$;

create or replace function public.admin_simulation_definitions()
returns jsonb
language sql
security definer
set search_path=public
as $$
  select coalesce(jsonb_agg(to_jsonb(x) order by x.position,x.id),'[]'::jsonb)
  from (
    select s.id,s.slug,s.name,s.description,s.discipline_id,d.slug discipline_slug,d.name discipline,
      s.topic_ids,s.question_count,s.time_limit_minutes,s.randomize_questions,s.randomize_options,
      s.use_incidence_weights,s.status,s.position,s.created_by_email,s.updated_by_email,s.created_at,s.updated_at,
      (select count(*)::int from public.questions q
        where q.status='published'
          and (s.discipline_id is null or q.discipline_id=s.discipline_id)
          and (cardinality(s.topic_ids)=0 or q.topic_id=any(s.topic_ids))) available_questions
    from public.simulation_definitions s
    left join public.disciplines d on d.id=s.discipline_id
  ) x;
$$;

create or replace function public.public_simulation_definition(p_slug text)
returns jsonb
language sql
security definer
set search_path=public
as $$
  select to_jsonb(x) from (
    select s.id,s.slug,s.name,s.description,d.slug discipline_slug,d.name discipline,
      s.topic_ids,s.question_count,s.time_limit_minutes,s.randomize_questions,s.randomize_options,
      s.use_incidence_weights
    from public.simulation_definitions s
    left join public.disciplines d on d.id=s.discipline_id
    where s.slug=p_slug and s.status='published'
    limit 1
  ) x;
$$;

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
      q.statement,q.options,q.difficulty,q.position,
      coalesce(t.incidence_weight,1.000) incidence_weight
    from public.questions q
    join public.disciplines d on d.id=q.discipline_id
    left join public.question_topics t on t.id=q.topic_id
    where q.status='published'
      and (s.discipline_id is null or q.discipline_id=s.discipline_id)
      and (cardinality(s.topic_ids)=0 or q.topic_id=any(s.topic_ids))
    order by
      case
        when s.randomize_questions and s.use_incidence_weights
          then ln(greatest(random(),0.000000001))/greatest(coalesce(t.incidence_weight,1.000),0.001)
        when s.randomize_questions
          then random()
        else 0
      end desc,
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
      'incidence_weight',r.incidence_weight,'position',v_position,'option_order',to_jsonb(v_order)
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
      'randomize_questions',s.randomize_questions,'randomize_options',s.randomize_options,
      'use_incidence_weights',s.use_incidence_weights
    ),
    'saved',v_saved,
    'attempt_id',v_attempt_id,
    'questions',v_questions
  );
end;
$$;

revoke all on function public.admin_set_topic_incidence(bigint,integer,numeric,text) from public,anon,authenticated;
revoke all on function public.admin_topic_incidence(text) from public,anon,authenticated;
grant execute on function public.admin_set_topic_incidence(bigint,integer,numeric,text) to service_role;
grant execute on function public.admin_topic_incidence(text) to service_role;
