-- Domina OAB — conteúdo de Ética Profissional, lote 1
-- Questões autorais inspiradas em padrões temáticos recorrentes do Exame de Ordem.
-- Todas permanecem em draft até revisão jurídica/editorial.

insert into public.question_topics(discipline_id,name,slug,position,active)
select d.id,x.name,x.slug,x.position,true
from public.disciplines d
cross join (values
  ('Atos privativos da advocacia','atos-privativos',1),
  ('Inscrição na OAB','inscricao-oab',2),
  ('Direitos e prerrogativas','direitos-prerrogativas',3),
  ('Mandato e renúncia','mandato-renuncia',4),
  ('Sigilo profissional','sigilo-profissional',5),
  ('Honorários advocatícios','honorarios-advocaticios',6),
  ('Sociedade de advogados','sociedade-advogados',7),
  ('Incompatibilidades e impedimentos','incompatibilidades-impedimentos',8),
  ('Infrações e sanções disciplinares','infracoes-sancoes',9),
  ('Publicidade e marketing jurídico','publicidade-marketing',10),
  ('Órgãos da OAB','orgaos-oab',11)
) as x(name,slug,position)
where d.slug='etica-profissional'
on conflict(discipline_id,slug) do update
set name=excluded.name,position=excluded.position,active=true,updated_at=now();

-- 001 — atos privativos / habeas corpus
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-001',d.id,t.id,
  'Marcos, que não é advogado, pretende impetrar habeas corpus em favor de seu irmão. À luz do Estatuto da Advocacia, assinale a afirmativa correta.',
  '["A impetração é ato privativo de advogado em qualquer hipótese","Marcos pode impetrar habeas corpus, pois a impetração não integra os atos privativos de advocacia","Marcos só pode impetrar se obtiver autorização da OAB","Marcos pode impetrar apenas perante juiz de primeiro grau"]'::jsonb,
  1,
  'A impetração de habeas corpus não se inclui entre os atos privativos de advocacia. Por isso, não se exige capacidade postulatória de advogado para a impetração. Fundamento principal: Lei nº 8.906/1994, art. 1º, § 1º.',
  'Autoral | EAOAB, art. 1º, §1º','easy','draft',101
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='atos-privativos'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 002 — consultoria jurídica
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-002',d.id,t.id,
  'Uma empresa deseja contratar profissional não inscrito na OAB para exercer, de forma habitual, atividade de consultoria jurídica interna. Segundo o Estatuto da Advocacia, essa contratação é:',
  '["regular, desde que o profissional seja bacharel em Direito","regular, se não houver atuação judicial","irregular, porque consultoria jurídica integra as atividades privativas de advocacia","regular, desde que o contrato seja denominado consultoria empresarial"]'::jsonb,
  2,
  'Consultoria, assessoria e direção jurídicas são atividades privativas de advocacia. A ausência de atuação judicial não afasta essa natureza. Fundamento principal: Lei nº 8.906/1994, art. 1º, II.',
  'Autoral | EAOAB, art. 1º, II','easy','draft',102
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='atos-privativos'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 003 — requisitos de inscrição
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-003',d.id,t.id,
  'Após concluir o curso de Direito e ser aprovado no Exame de Ordem, Lara requer sua inscrição como advogada. Qual requisito continua sujeito à verificação pela OAB?',
  '["Apenas a aprovação no Exame de Ordem","Idoneidade moral, além dos demais requisitos legais de inscrição","Comprovação de dois anos de estágio profissional após a graduação","Filiação prévia a uma sociedade de advogados"]'::jsonb,
  1,
  'A aprovação no Exame de Ordem não esgota os requisitos de inscrição. O Estatuto também exige, entre outros requisitos, idoneidade moral e ausência de atividade incompatível com a advocacia. Fundamento principal: Lei nº 8.906/1994, art. 8º.',
  'Autoral | EAOAB, art. 8º','medium','draft',103
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='inscricao-oab'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 004 — inscrição suplementar
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-004',d.id,t.id,
  'Advogada regularmente inscrita em uma Seccional passa a atuar habitualmente também em outra unidade da Federação. Havendo habitualidade profissional nos termos do Estatuto, deverá:',
  '["cancelar a inscrição principal e iniciar nova inscrição do zero","requerer inscrição suplementar na outra Seccional","atuar sem qualquer providência, pois a inscrição principal produz efeitos ilimitados","solicitar autorização judicial para cada novo processo"]'::jsonb,
  1,
  'A atuação habitual em território de outra Seccional exige inscrição suplementar, observados os critérios do Estatuto. Fundamento principal: Lei nº 8.906/1994, art. 10.',
  'Autoral | EAOAB, art. 10','medium','draft',104
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='inscricao-oab'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 005 — prerrogativas e cliente preso
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-005',d.id,t.id,
  'Durante investigação criminal, um advogado procura comunicar-se pessoal e reservadamente com cliente preso. A autoridade afirma que a conversa só ocorrerá se houver procuração nos autos. À luz do Estatuto, a exigência é:',
  '["correta, porque toda comunicação com preso exige procuração","incorreta, pois o advogado possui prerrogativa de comunicar-se pessoal e reservadamente com cliente preso, ainda que sem procuração","correta apenas durante o inquérito","incorreta somente se houver autorização do Ministério Público"]'::jsonb,
  1,
  'O Estatuto assegura ao advogado comunicar-se pessoal e reservadamente com clientes presos, detidos ou recolhidos, mesmo sem procuração, observadas as hipóteses e garantias legais. Fundamento principal: Lei nº 8.906/1994, art. 7º.',
  'Autoral | EAOAB, art. 7º','medium','draft',105
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='direitos-prerrogativas'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 006 — renúncia
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-006',d.id,t.id,
  'Patrícia renuncia ao mandato recebido de seu cliente e comprova que o notificou regularmente. Em regra, para evitar prejuízo ao mandante, ela:',
  '["cessa imediatamente qualquer responsabilidade processual, mesmo sem substituição","continua representando o mandante durante os dez dias seguintes à notificação, salvo substituição anterior","deve atuar obrigatoriamente até o trânsito em julgado","só pode deixar o processo após autorização da parte contrária"]'::jsonb,
  1,
  'O advogado que renuncia continua, durante os dez dias seguintes à notificação da renúncia, a representar o mandante, salvo se for substituído antes do término desse prazo. Fundamento principal: Lei nº 8.906/1994, art. 5º, § 3º.',
  'Autoral | EAOAB, art. 5º, §3º','medium','draft',106
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='mandato-renuncia'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 007 — sigilo em consulta
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-007',d.id,t.id,
  'Em consulta inicial, uma pessoa relata fatos sensíveis a uma advogada, mas decide não contratá-la. Posteriormente, terceiro solicita detalhes da conversa. A advogada deve considerar que:',
  '["não há sigilo, porque não houve contrato","o sigilo profissional alcança as informações recebidas em razão da consulta, ainda que não haja contratação posterior","o sigilo só existe depois do ajuizamento da ação","o sigilo depende de termo escrito assinado pelo consulente"]'::jsonb,
  1,
  'O dever de sigilo decorre da natureza profissional da informação e não depende da formalização posterior do contrato ou do ajuizamento de ação. Deve ser observada a disciplina do Código de Ética e do Estatuto.',
  'Autoral | CED OAB — sigilo profissional','medium','draft',107
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='sigilo-profissional'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 008 — honorários sucumbenciais
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-008',d.id,t.id,
  'Em ação judicial, a decisão condena a parte vencida ao pagamento de honorários de sucumbência. Em relação a essa verba, assinale a afirmativa correta.',
  '["pertence exclusivamente ao cliente vencedor","pertence ao advogado, que possui direito autônomo para executar a decisão quanto a essa parcela","deve ser dividida obrigatoriamente em partes iguais entre advogado e cliente","só pertence ao advogado se não houver contrato de honorários"]'::jsonb,
  1,
  'Os honorários incluídos na condenação por sucumbência pertencem ao advogado, que possui direito autônomo para executar a sentença nessa parte. Fundamento principal: Lei nº 8.906/1994, art. 23.',
  'Autoral | EAOAB, art. 23','medium','draft',108
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='honorarios-advocaticios'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 009 — sociedade unipessoal
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-009',d.id,t.id,
  'Renato pretende organizar sua atividade profissional sem outros sócios. Segundo o Estatuto da Advocacia, ele:',
  '["não pode constituir pessoa jurídica para advocacia sem ao menos outro advogado","pode constituir sociedade unipessoal de advocacia, observadas as regras próprias da OAB","deve constituir sociedade empresária limitada comum","somente pode atuar como pessoa física"]'::jsonb,
  1,
  'O Estatuto admite sociedade unipessoal de advocacia, sujeita ao regime próprio da advocacia e ao registro competente na OAB. Fundamento principal: Lei nº 8.906/1994, art. 15.',
  'Autoral | EAOAB, art. 15','easy','draft',109
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='sociedade-advogados'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 010 — incompatibilidade x impedimento
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-010',d.id,t.id,
  'Ao estudar restrições ao exercício profissional, um candidato afirma que incompatibilidade e impedimento produzem exatamente os mesmos efeitos. A afirmação é:',
  '["correta, pois ambos proíbem totalmente a advocacia","incorreta, pois incompatibilidade implica proibição total, enquanto impedimento representa proibição parcial nos limites legais","correta apenas para agentes públicos","incorreta, pois impedimento é sempre mais amplo que incompatibilidade"]'::jsonb,
  1,
  'O Estatuto distingue incompatibilidade, que importa proibição total do exercício da advocacia, de impedimento, que importa proibição parcial. Fundamento principal: Lei nº 8.906/1994, arts. 27 a 30.',
  'Autoral | EAOAB, arts. 27-30','easy','draft',110
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='incompatibilidades-impedimentos'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 011 — sanções disciplinares
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-011',d.id,t.id,
  'Qual conjunto corresponde às sanções disciplinares previstas no Estatuto da Advocacia?',
  '["advertência, prisão, suspensão e multa","censura, suspensão, exclusão e multa","censura, demissão, cassação civil e multa","advertência, censura judicial, detenção e exclusão"]'::jsonb,
  1,
  'O Estatuto prevê como sanções disciplinares censura, suspensão, exclusão e multa. A aplicação concreta depende da infração e das regras legais. Fundamento principal: Lei nº 8.906/1994, art. 35.',
  'Autoral | EAOAB, art. 35','easy','draft',111
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='infracoes-sancoes'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 012 — publicidade
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L1-012',d.id,t.id,
  'Um escritório publica conteúdo jurídico informativo em rede social e utiliza ferramenta de impulsionamento, sem prometer resultados nem fazer oferta direta de contratação. À luz das regras atuais de publicidade na advocacia, a conduta:',
  '["é necessariamente proibida, porque qualquer impulsionamento é vedado","pode ser admitida, desde que respeitados os limites éticos e seja evitada captação indevida de clientela ou mercantilização da profissão","é permitida apenas se o anúncio divulgar preços promocionais","é livre de qualquer limitação porque ocorre em rede social"]'::jsonb,
  1,
  'O Provimento CFOAB nº 205/2021 admite marketing jurídico e formas de publicidade informativa, inclusive em meios digitais, desde que observados os limites éticos, especialmente a vedação à captação indevida de clientela e à mercantilização da advocacia.',
  'Autoral | Provimento CFOAB nº 205/2021','medium','draft',112
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='publicidade-marketing'
where d.slug='etica-profissional'
on conflict(code) do nothing;
