create table if not exists public.exam_question_topic_observations (
  id bigint generated always as identity primary key,
  discipline_id bigint not null references public.disciplines(id) on delete cascade,
  topic_id bigint not null references public.question_topics(id) on delete restrict,
  exam_number integer not null check (exam_number > 0),
  exam_date date not null,
  question_number integer not null check (question_number between 1 and 80),
  exam_variant text not null default 'tipo-1-branca',
  subtopic text not null,
  source_url text not null,
  status text not null default 'valid' check (status in ('valid','annulled')),
  calibration_eligible boolean not null default true,
  notes text,
  classified_at timestamptz not null default now(),
  classified_by text not null default 'system@dominaoab.com.br',
  unique (discipline_id, exam_number, exam_variant, question_number)
);

create index if not exists exam_question_topic_observations_topic_idx
  on public.exam_question_topic_observations(topic_id, exam_number);

alter table public.exam_question_topic_observations enable row level security;
revoke all on table public.exam_question_topic_observations from anon, authenticated;
grant select, insert, update, delete on table public.exam_question_topic_observations to service_role;

comment on table public.exam_question_topic_observations is
  'Classificacao autoral de questoes oficiais OAB/FGV por tema. Nao armazena o texto integral das provas; preserva apenas metadados, classificacao e fonte oficial.';

with d as (
  select id from public.disciplines where slug='etica-profissional'
), base as (
  select d.id discipline_id, coalesce(max(qt.position),0) max_position
  from d left join public.question_topics qt on qt.discipline_id=d.id
  group by d.id
), novos(name,slug,offset_pos) as (
  values
    ('Responsabilidade profissional do advogado','responsabilidade-profissional',1),
    ('Advogado empregado','advogado-empregado',2)
)
insert into public.question_topics(
  discipline_id,name,slug,position,active,historical_occurrences,incidence_weight,incidence_source,incidence_updated_at
)
select b.discipline_id,n.name,n.slug,b.max_position+n.offset_pos,false,0,0.100,
       'aguardando-calibracao-eou-41-46',now()
from base b cross join novos n
on conflict (discipline_id,slug) do update
set name=excluded.name,
    updated_at=now();

with obs(exam_number,exam_date,question_number,topic_slug,subtopic,source_url,status,calibration_eligible,notes) as (
  values
  (41,date '2024-07-28',1,'infracoes-sancoes','Reabilitação disciplinar','https://oab.fgv.br/arq/644/552356_ADVOGADO%20OAB%28CNS01%29%20Tipo%201%20%281%29.pdf','valid',true,null),
  (41,date '2024-07-28',2,'direitos-prerrogativas','Acesso a autos de investigação sigilosa','https://oab.fgv.br/arq/644/552356_ADVOGADO%20OAB%28CNS01%29%20Tipo%201%20%281%29.pdf','valid',true,null),
  (41,date '2024-07-28',3,'responsabilidade-profissional','Responsabilidade civil por lide temerária','https://oab.fgv.br/arq/644/552356_ADVOGADO%20OAB%28CNS01%29%20Tipo%201%20%281%29.pdf','valid',true,null),
  (41,date '2024-07-28',4,'principios-fundamentais','Deveres éticos, independência e orientação profissional','https://oab.fgv.br/arq/644/552356_ADVOGADO%20OAB%28CNS01%29%20Tipo%201%20%281%29.pdf','valid',true,null),
  (41,date '2024-07-28',5,'advogado-empregado','Advogado empregado, dedicação exclusiva e sucumbência','https://oab.fgv.br/arq/644/552356_ADVOGADO%20OAB%28CNS01%29%20Tipo%201%20%281%29.pdf','valid',true,null),
  (41,date '2024-07-28',6,'atos-privativos','Consultoria jurídica sem mandato e contratação verbal','https://oab.fgv.br/arq/644/552356_ADVOGADO%20OAB%28CNS01%29%20Tipo%201%20%281%29.pdf','valid',true,null),
  (41,date '2024-07-28',7,'publicidade-marketing','Divulgação conjunta da advocacia com outra atividade','https://oab.fgv.br/arq/644/552356_ADVOGADO%20OAB%28CNS01%29%20Tipo%201%20%281%29.pdf','valid',true,null),
  (41,date '2024-07-28',8,'inscricao-oab','Diploma estrangeiro e revalidação para inscrição','https://oab.fgv.br/arq/644/552356_ADVOGADO%20OAB%28CNS01%29%20Tipo%201%20%281%29.pdf','valid',true,null),
  (42,date '2024-12-01',1,'direitos-prerrogativas','Inviolabilidade profissional e busca e apreensão','https://oab.fgv.br/arq/645/402439_OAB%2042%20-%20ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (42,date '2024-12-01',2,'responsabilidade-profissional','Responsabilidade solidária por lide temerária','https://oab.fgv.br/arq/645/402439_OAB%2042%20-%20ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (42,date '2024-12-01',3,'incompatibilidades-impedimentos','Prefeito, incompatibilidade e permanência em sociedade','https://oab.fgv.br/arq/645/402439_OAB%2042%20-%20ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (42,date '2024-12-01',4,'sigilo-profissional','Sigilo profissional de dirigente da OAB e depoimento','https://oab.fgv.br/arq/645/402439_OAB%2042%20-%20ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (42,date '2024-12-01',5,'incompatibilidades-impedimentos','Servidor docente de curso jurídico e impedimento','https://oab.fgv.br/arq/645/402439_OAB%2042%20-%20ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (42,date '2024-12-01',6,'orgaos-oab','Elegibilidade para cargo na OAB e reabilitação','https://oab.fgv.br/arq/645/402439_OAB%2042%20-%20ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (42,date '2024-12-01',7,'atos-privativos','Consultoria jurídica independente de mandato','https://oab.fgv.br/arq/645/402439_OAB%2042%20-%20ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (42,date '2024-12-01',8,'direitos-prerrogativas','Carteira da OAB como identidade civil','https://oab.fgv.br/arq/645/402439_OAB%2042%20-%20ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (43,date '2025-04-27',1,'publicidade-marketing','Publicidade informativa e meios de contato','https://oab.fgv.br/arq/646/838452_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','annulled',false,'Questão 1 do Tipo 1 anulada oficialmente pela OAB em 30/04/2025.'),
  (43,date '2025-04-27',2,'infracoes-sancoes','Processo disciplinar e ampla defesa','https://oab.fgv.br/arq/646/838452_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (43,date '2025-04-27',3,'sociedade-advogados','Sociedade unipessoal, sede compartilhada e limites societários','https://oab.fgv.br/arq/646/838452_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (43,date '2025-04-27',4,'honorarios-advocaticios','Liberação de bens bloqueados para honorários e gastos de defesa','https://oab.fgv.br/arq/646/838452_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (43,date '2025-04-27',5,'incompatibilidades-impedimentos','Membro do Legislativo e impedimento profissional','https://oab.fgv.br/arq/646/838452_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (43,date '2025-04-27',6,'atos-privativos','Habeas corpus por pessoa não inscrita na OAB','https://oab.fgv.br/arq/646/838452_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (43,date '2025-04-27',7,'direitos-prerrogativas','Comunicação reservada com preso sem procuração','https://oab.fgv.br/arq/646/838452_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (43,date '2025-04-27',8,'infracoes-sancoes','Responsabilidade disciplinar por peça com citações falsas geradas por IA','https://oab.fgv.br/arq/646/838452_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (44,date '2025-08-17',1,'infracoes-sancoes','Advocacia contra literal disposição de lei e presunção de boa-fé','https://s.oab.org.br/arquivos/2025/08/fda2cc49-fbbd-4893-9b75-0f61c177cd5d.pdf','valid',true,null),
  (44,date '2025-08-17',2,'incompatibilidades-impedimentos','Diretor jurídico de empresa pública no mercado financeiro','https://s.oab.org.br/arquivos/2025/08/fda2cc49-fbbd-4893-9b75-0f61c177cd5d.pdf','valid',true,null),
  (44,date '2025-08-17',3,'sociedade-advogados','Sócio não advogado e atividade estranha à advocacia','https://s.oab.org.br/arquivos/2025/08/fda2cc49-fbbd-4893-9b75-0f61c177cd5d.pdf','valid',true,null),
  (44,date '2025-08-17',4,'infracoes-sancoes','Instauração de processo disciplinar e termo de ajustamento','https://s.oab.org.br/arquivos/2025/08/fda2cc49-fbbd-4893-9b75-0f61c177cd5d.pdf','valid',true,null),
  (44,date '2025-08-17',5,'honorarios-advocaticios','Acordo do cliente sem aquiescência e preservação dos honorários','https://s.oab.org.br/arquivos/2025/08/fda2cc49-fbbd-4893-9b75-0f61c177cd5d.pdf','valid',true,null),
  (44,date '2025-08-17',6,'direitos-prerrogativas','Carteira da OAB como documento de identidade civil','https://s.oab.org.br/arquivos/2025/08/fda2cc49-fbbd-4893-9b75-0f61c177cd5d.pdf','valid',true,null),
  (44,date '2025-08-17',7,'direitos-prerrogativas','Acesso a investigação sigilosa e diligências em andamento','https://s.oab.org.br/arquivos/2025/08/fda2cc49-fbbd-4893-9b75-0f61c177cd5d.pdf','valid',true,null),
  (44,date '2025-08-17',8,'infracoes-sancoes','Suspensão preventiva e prazo do processo disciplinar','https://s.oab.org.br/arquivos/2025/08/fda2cc49-fbbd-4893-9b75-0f61c177cd5d.pdf','valid',true,null),
  (45,date '2025-12-21',1,'publicidade-marketing','Divulgação conjunta da advocacia com consultoria empresarial','https://oab.fgv.br/arq/648/405589_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (45,date '2025-12-21',2,'atos-privativos','Nulidade de atos praticados por não inscrito e advogado suspenso','https://oab.fgv.br/arq/648/405589_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (45,date '2025-12-21',3,'incompatibilidades-impedimentos','Titular de serventia notarial e registral','https://oab.fgv.br/arq/648/405589_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (45,date '2025-12-21',4,'advogado-empregado','Jornada e horas extras do advogado empregado','https://oab.fgv.br/arq/648/405589_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (45,date '2025-12-21',5,'infracoes-sancoes','Documento falso, sanção disciplinar e prescrição','https://oab.fgv.br/arq/648/405589_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (45,date '2025-12-21',6,'sigilo-profissional','Depoimento sobre fatos conhecidos em relação profissional encerrada','https://oab.fgv.br/arq/648/405589_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (45,date '2025-12-21',7,'direitos-prerrogativas','Prerrogativas da advogada lactante','https://oab.fgv.br/arq/648/405589_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (45,date '2025-12-21',8,'sociedade-advogados','Participação simultânea em sociedade unipessoal e sociedade de advogados','https://oab.fgv.br/arq/648/405589_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (46,date '2026-05-03',1,'direitos-prerrogativas','Prerrogativas da advogada gestante','https://oab.fgv.br/arq/649/561671_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (46,date '2026-05-03',2,'incompatibilidades-impedimentos','Procurador-Geral e exclusividade da advocacia pública','https://oab.fgv.br/arq/649/561671_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (46,date '2026-05-03',3,'inscricao-oab','Estágio profissional e inscrição de bacharel como estagiário','https://oab.fgv.br/arq/649/561671_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (46,date '2026-05-03',4,'sociedade-advogados','Conflito de interesses entre sócios da mesma sociedade','https://oab.fgv.br/arq/649/561671_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (46,date '2026-05-03',5,'infracoes-sancoes','Censura e circunstâncias atenuantes','https://oab.fgv.br/arq/649/561671_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (46,date '2026-05-03',6,'honorarios-advocaticios','Quota litis, pagamento em bens e bloqueio patrimonial','https://oab.fgv.br/arq/649/561671_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (46,date '2026-05-03',7,'publicidade-marketing','Divulgação conjunta da advocacia com outra atividade','https://oab.fgv.br/arq/649/561671_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null),
  (46,date '2026-05-03',8,'sigilo-profissional','Colaboração premiada contra cliente ou ex-cliente','https://oab.fgv.br/arq/649/561671_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf','valid',true,null)
), d as (
  select id from public.disciplines where slug='etica-profissional'
)
insert into public.exam_question_topic_observations(
  discipline_id,topic_id,exam_number,exam_date,question_number,exam_variant,subtopic,source_url,status,calibration_eligible,notes
)
select d.id,t.id,o.exam_number,o.exam_date,o.question_number,'tipo-1-branca',o.subtopic,o.source_url,o.status,o.calibration_eligible,o.notes
from obs o cross join d
join public.question_topics t on t.discipline_id=d.id and t.slug=o.topic_slug
on conflict (discipline_id,exam_number,exam_variant,question_number) do update
set topic_id=excluded.topic_id,
    exam_date=excluded.exam_date,
    subtopic=excluded.subtopic,
    source_url=excluded.source_url,
    status=excluded.status,
    calibration_eligible=excluded.calibration_eligible,
    notes=excluded.notes,
    classified_at=now();

with d as (
  select id from public.disciplines where slug='etica-profissional'
), counts as (
  select t.id topic_id, count(o.id)::int occurrences
  from public.question_topics t
  join d on d.id=t.discipline_id
  left join public.exam_question_topic_observations o
    on o.topic_id=t.id and o.calibration_eligible=true and o.exam_number between 41 and 46
  group by t.id
)
update public.question_topics t
set historical_occurrences=c.occurrences,
    incidence_weight=greatest(round((c.occurrences::numeric/6.0),3),0.100),
    incidence_source='EOU 41-46 | Tipo 1 | 47 questões válidas; 43-Q1 anulada excluída | peso=média de questões por exame, piso 0,100',
    incidence_updated_at=now(),
    updated_at=now()
from counts c
where t.id=c.topic_id;

create or replace function public.prepare_simulation(p_user_id uuid, p_slug text)
returns jsonb
language plpgsql
security definer
set search_path='public'
as $function$
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
    select x.*
    from (
      select q.id,q.code,d.slug discipline_slug,d.name discipline,t.name topic,
        q.statement,q.options,q.difficulty,q.position,
        coalesce(t.incidence_weight,1.000) incidence_weight,
        count(*) over (partition by q.topic_id) topic_question_count
      from public.questions q
      join public.disciplines d on d.id=q.discipline_id
      left join public.question_topics t on t.id=q.topic_id
      where q.status='published'
        and (s.discipline_id is null or q.discipline_id=s.discipline_id)
        and (cardinality(s.topic_ids)=0 or q.topic_id=any(s.topic_ids))
    ) x
    order by
      case
        when s.randomize_questions and s.use_incidence_weights
          then ln(greatest(random(),0.000000001)) /
               greatest(x.incidence_weight/greatest(x.topic_question_count,1),0.001)
        when s.randomize_questions
          then random()
        else 0
      end desc,
      x.position,x.id
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
$function$;
