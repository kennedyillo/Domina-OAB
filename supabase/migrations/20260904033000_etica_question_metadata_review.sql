-- Auditoria editorial de metadados de Ética Profissional.
-- Não altera status editorial nem publica questões.

-- Preserva o estado anterior das 71 questões antes da classificação de metadados.
do $$
declare r record;
begin
  for r in
    select q.id
    from public.questions q
    join public.disciplines d on d.id=q.discipline_id
    where d.slug='etica-profissional'
      and (q.subtopic is null or q.incidence is null)
    order by q.id
  loop
    perform public.snapshot_question_version(r.id,'metadata_review','migration@dominaoab.local');
  end loop;
end $$;

-- Subtópicos específicos por questão, definidos a partir do conteúdo e fundamento jurídico já cadastrados.
with metadata(id,subtopic) as (values
  (1,'Função social e deveres fundamentais'),
  (2,'Alcance do sigilo profissional'),
  (3,'Contratação e transparência dos honorários'),
  (4,'Habeas corpus e exceção aos atos privativos'),
  (5,'Consultoria, assessoria e direção jurídicas'),
  (6,'Requisitos para inscrição como advogado'),
  (7,'Inscrição suplementar e habitualidade'),
  (8,'Comunicação reservada com cliente preso'),
  (9,'Renúncia ao mandato'),
  (10,'Sigilo em consulta preliminar'),
  (11,'Titularidade dos honorários sucumbenciais'),
  (12,'Sociedade unipessoal de advocacia'),
  (13,'Efeitos da incompatibilidade e do impedimento'),
  (14,'Espécies de sanções disciplinares'),
  (15,'Impulsionamento e publicidade informativa'),
  (16,'Acesso a autos de investigação'),
  (17,'Inviolabilidade do escritório'),
  (18,'Prisão cautelar e sala de Estado-Maior'),
  (19,'Prescrição da cobrança de honorários'),
  (20,'Acordo do cliente e preservação dos honorários'),
  (21,'Cobrança pelo substabelecido com reserva'),
  (22,'Chefe do Poder Executivo e incompatibilidade'),
  (23,'Servidor público e Fazenda remuneradora'),
  (24,'Atividade policial e incompatibilidade'),
  (25,'Sanção de censura'),
  (26,'Sanção de exclusão e quórum qualificado'),
  (27,'Retenção abusiva de autos'),
  (28,'Divulgação de preços e descontos'),
  (29,'Conteúdo jurídico informativo'),
  (30,'Promessa de resultados'),
  (31,'Atividade incompatível como requisito de inscrição'),
  (32,'Pluralidade de sociedades na mesma Seccional'),
  (33,'Depoimento e sigilo profissional'),
  (34,'Comunicação com cliente preso sem procuração'),
  (35,'Ausência de hierarquia profissional'),
  (36,'Inviolabilidade do local e instrumentos de trabalho'),
  (37,'Titularidade dos honorários de sucumbência'),
  (38,'Contrato e fixação de honorários'),
  (39,'Distinção entre incompatibilidade e impedimento'),
  (40,'Servidor público contra Fazenda remuneradora'),
  (41,'Captação de clientela'),
  (42,'Preços e descontos em publicidade'),
  (43,'Impulsionamento de conteúdo jurídico'),
  (44,'Competências do Conselho Federal'),
  (45,'Competências do Conselho Seccional'),
  (46,'Competência disciplinar do Tribunal de Ética'),
  (47,'Caixa de Assistência dos Advogados'),
  (48,'Subseções da OAB'),
  (49,'Atuação urgente sem procuração'),
  (50,'Substabelecimento do mandato'),
  (51,'Renúncia ao mandato'),
  (52,'Atos do estagiário'),
  (53,'Nulidade de atos privativos irregulares'),
  (54,'Visto de advogado em atos constitutivos'),
  (55,'Responsabilidade da sociedade e dos sócios'),
  (56,'Denominação da sociedade de advogados'),
  (57,'Aquisição de personalidade jurídica da sociedade'),
  (58,'Licenciamento da inscrição'),
  (59,'Cancelamento da inscrição'),
  (60,'Requisitos para inscrição como advogado'),
  (61,'Abrangência do sigilo profissional'),
  (62,'Exceções ao sigilo profissional'),
  (63,'Indispensabilidade do advogado à Justiça'),
  (64,'Imunidade profissional'),
  (65,'Direção e gerência em instituição financeira'),
  (66,'Membros do Poder Legislativo e impedimento'),
  (67,'Prisão em flagrante por motivo profissional'),
  (68,'Exame e acesso aos autos'),
  (69,'Sucessão nos honorários de sucumbência'),
  (70,'Sanção disciplinar de suspensão'),
  (71,'Prescrição disciplinar')
)
update public.questions q
set subtopic=m.subtopic,
    updated_at=now()
from metadata m
where q.id=m.id
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
where id=26;

update public.questions
set source_label='Autoral | EAOAB, arts. 45, §4º, e 62',
    updated_at=now()
where id=47;

update public.questions
set source_label='Autoral | EAOAB, art. 28, VIII',
    explanation='A advocacia é incompatível, ainda que em causa própria, com a ocupação de funções de direção e gerência em instituições financeiras, inclusive privadas. A incompatibilidade importa proibição total do exercício da advocacia. Fundamento principal: Lei nº 8.906/1994, art. 28, VIII.',
    updated_at=now()
where id=65;
