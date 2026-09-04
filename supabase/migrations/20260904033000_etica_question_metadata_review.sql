-- Auditoria editorial de metadados de Ética Profissional.
-- Não altera status editorial nem publica questões.

-- Preserva o estado anterior das questões de Ética antes da classificação de metadados.
do $$
declare r record;
begin
  for r in
    select q.id
    from public.questions q
    join public.disciplines d on d.id=q.discipline_id
    where d.slug='etica-profissional'
      and (q.subtopic is null or q.incidence is null)
    order by q.code
  loop
    perform public.snapshot_question_version(r.id,'metadata_review','migration@dominaoab.local');
  end loop;
end $$;

-- Subtópicos específicos por código editorial estável.
-- Não usar IDs sequenciais em data migrations: eles podem variar entre instalações.
with metadata(code,subtopic) as (values
  ('ETICA-DEMO-001','Função social e deveres fundamentais'),
  ('ETICA-DEMO-002','Alcance do sigilo profissional'),
  ('ETICA-DEMO-003','Contratação e transparência dos honorários'),
  ('ETICA-L1-001','Habeas corpus e exceção aos atos privativos'),
  ('ETICA-L1-002','Consultoria, assessoria e direção jurídicas'),
  ('ETICA-L1-003','Requisitos para inscrição como advogado'),
  ('ETICA-L1-004','Inscrição suplementar e habitualidade'),
  ('ETICA-L1-005','Comunicação reservada com cliente preso'),
  ('ETICA-L1-006','Renúncia ao mandato'),
  ('ETICA-L1-007','Sigilo em consulta preliminar'),
  ('ETICA-L1-008','Titularidade dos honorários sucumbenciais'),
  ('ETICA-L1-009','Sociedade unipessoal de advocacia'),
  ('ETICA-L1-010','Efeitos da incompatibilidade e do impedimento'),
  ('ETICA-L1-011','Espécies de sanções disciplinares'),
  ('ETICA-L1-012','Impulsionamento e publicidade informativa'),
  ('ETICA-L3-023','Acesso a autos de investigação'),
  ('ETICA-L3-024','Inviolabilidade do escritório'),
  ('ETICA-L3-025','Prisão cautelar e sala de Estado-Maior'),
  ('ETICA-L3-026','Prescrição da cobrança de honorários'),
  ('ETICA-L3-027','Acordo do cliente e preservação dos honorários'),
  ('ETICA-L3-028','Cobrança pelo substabelecido com reserva'),
  ('ETICA-L3-029','Chefe do Poder Executivo e incompatibilidade'),
  ('ETICA-L3-030','Servidor público e Fazenda remuneradora'),
  ('ETICA-L3-031','Atividade policial e incompatibilidade'),
  ('ETICA-L3-032','Sanção de censura'),
  ('ETICA-L3-033','Sanção de exclusão e quórum qualificado'),
  ('ETICA-L3-034','Retenção abusiva de autos'),
  ('ETICA-L3-035','Divulgação de preços e descontos'),
  ('ETICA-L3-036','Conteúdo jurídico informativo'),
  ('ETICA-L3-037','Promessa de resultados'),
  ('ETICA-L3-038','Atividade incompatível como requisito de inscrição'),
  ('ETICA-L3-039','Pluralidade de sociedades na mesma Seccional'),
  ('ETICA-L3-040','Depoimento e sigilo profissional'),
  ('ETICA-L2-013','Comunicação com cliente preso sem procuração'),
  ('ETICA-L2-014','Ausência de hierarquia profissional'),
  ('ETICA-L2-015','Inviolabilidade do local e instrumentos de trabalho'),
  ('ETICA-L2-016','Titularidade dos honorários de sucumbência'),
  ('ETICA-L2-017','Contrato e fixação de honorários'),
  ('ETICA-L2-018','Distinção entre incompatibilidade e impedimento'),
  ('ETICA-L2-019','Servidor público contra Fazenda remuneradora'),
  ('ETICA-L2-020','Captação de clientela'),
  ('ETICA-L2-021','Preços e descontos em publicidade'),
  ('ETICA-L2-022','Impulsionamento de conteúdo jurídico'),
  ('ETICA-L4-041','Competências do Conselho Federal'),
  ('ETICA-L4-042','Competências do Conselho Seccional'),
  ('ETICA-L4-043','Competência disciplinar do Tribunal de Ética'),
  ('ETICA-L4-044','Caixa de Assistência dos Advogados'),
  ('ETICA-L4-045','Subseções da OAB'),
  ('ETICA-L4-046','Atuação urgente sem procuração'),
  ('ETICA-L4-047','Substabelecimento do mandato'),
  ('ETICA-L4-048','Renúncia ao mandato'),
  ('ETICA-L4-049','Atos do estagiário'),
  ('ETICA-L4-050','Nulidade de atos privativos irregulares'),
  ('ETICA-L4-051','Visto de advogado em atos constitutivos'),
  ('ETICA-L4-052','Responsabilidade da sociedade e dos sócios'),
  ('ETICA-L4-053','Denominação da sociedade de advogados'),
  ('ETICA-L4-054','Aquisição de personalidade jurídica da sociedade'),
  ('ETICA-L4-055','Licenciamento da inscrição'),
  ('ETICA-L4-056','Cancelamento da inscrição'),
  ('ETICA-L4-057','Requisitos para inscrição como advogado'),
  ('ETICA-L4-058','Abrangência do sigilo profissional'),
  ('ETICA-L4-059','Exceções ao sigilo profissional'),
  ('ETICA-L4-060','Indispensabilidade do advogado à Justiça'),
  ('ETICA-L4-061','Imunidade profissional'),
  ('ETICA-L4-062','Direção e gerência em instituição financeira'),
  ('ETICA-L4-063','Membros do Poder Legislativo e impedimento'),
  ('ETICA-L4-064','Prisão em flagrante por motivo profissional'),
  ('ETICA-L4-065','Exame e acesso aos autos'),
  ('ETICA-L4-066','Sucessão nos honorários de sucumbência'),
  ('ETICA-L4-067','Sanção disciplinar de suspensão'),
  ('ETICA-L4-068','Prescrição disciplinar')
)
update public.questions q
set subtopic=m.subtopic,
    updated_at=now()
from metadata m
where q.code=m.code
  and q.subtopic is null;

-- Incidência em nível de questão herdada do peso EDITORIAL atual do tema.
-- Não representa frequência histórica observada em provas FGV.
update public.questions q
set incidence = case
      when t.incidence_weight >= 4.0 then 'high'
      when t.incidence_weight >= 3.0 then 'medium'
      else 'low'
    end,
    updated_at=now()
from public.question_topics t
join public.disciplines d on d.id=t.discipline_id
where q.topic_id=t.id
  and d.slug='etica-profissional'
  and q.incidence is null;

-- Precisão jurídica encontrada na revisão da redação vigente do Estatuto.
update public.questions
set source_label='Autoral | EAOAB, art. 38 e parágrafo único',
    explanation='A exclusão é sanção grave. Para sua aplicação, é necessária manifestação favorável de dois terços dos membros do Conselho Seccional competente, nos termos do art. 38 e de seu parágrafo único do Estatuto da Advocacia.',
    updated_at=now()
where code='ETICA-L3-033';

update public.questions
set source_label='Autoral | EAOAB, arts. 45, §4º, e 62',
    updated_at=now()
where code='ETICA-L4-044';

update public.questions
set source_label='Autoral | EAOAB, art. 28, VIII',
    explanation='A advocacia é incompatível, ainda que em causa própria, com a ocupação de funções de direção e gerência em instituições financeiras, inclusive privadas. A incompatibilidade importa proibição total do exercício da advocacia. Fundamento principal: Lei nº 8.906/1994, art. 28, VIII.',
    updated_at=now()
where code='ETICA-L4-062';
