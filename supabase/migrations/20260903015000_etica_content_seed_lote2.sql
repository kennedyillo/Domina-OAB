-- Domina OAB — Ética Profissional, lote 2
-- Reforço dos temas com maior peso no sorteio dos simulados.
-- Questões autorais; status draft até revisão jurídica/editorial.

-- 013 — prerrogativas: comunicação com cliente preso
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L2-013',d.id,t.id,
  'Um advogado comparece a estabelecimento prisional para conversar reservadamente com cliente detido. A administração condiciona o encontro à apresentação de procuração. Considerando o Estatuto da Advocacia, assinale a correta.',
  '["A exigência é válida sempre que o cliente estiver preso preventivamente","A comunicação pessoal e reservada é prerrogativa do advogado mesmo sem procuração","A conversa sem procuração depende de autorização judicial","A prerrogativa existe apenas depois do oferecimento da denúncia"]'::jsonb,
  1,
  'O advogado tem direito de comunicar-se com seus clientes pessoal e reservadamente, mesmo sem procuração, quando presos, detidos ou recolhidos. Fundamento: Lei nº 8.906/1994, art. 7º, III.',
  'Autoral | EAOAB, art. 7º, III','easy','draft',113
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='direitos-prerrogativas'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 014 — prerrogativas: ausência de hierarquia
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L2-014',d.id,t.id,
  'Durante uma audiência, um magistrado afirma que o advogado ocupa posição hierarquicamente inferior aos membros do Judiciário e do Ministério Público. À luz do Estatuto, essa afirmação é:',
  '["correta, porque o advogado exerce função privada","incorreta, pois não há hierarquia nem subordinação entre advogados, magistrados e membros do Ministério Público","correta apenas em processos criminais","incorreta somente quando o advogado atua em causa própria"]'::jsonb,
  1,
  'O Estatuto estabelece expressamente que não há hierarquia nem subordinação entre advogados, magistrados e membros do Ministério Público, impondo tratamento recíproco com consideração e respeito. Fundamento: Lei nº 8.906/1994, art. 6º.',
  'Autoral | EAOAB, art. 6º','easy','draft',114
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='direitos-prerrogativas'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 015 — prerrogativas: inviolabilidade do escritório
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L2-015',d.id,t.id,
  'Sobre a proteção do local de trabalho do advogado, assinale a alternativa compatível com o Estatuto da Advocacia.',
  '["O escritório jamais pode ser objeto de medida judicial","A proteção alcança escritório, instrumentos e comunicações profissionais, nos limites legais, não constituindo imunidade absoluta","A inviolabilidade protege apenas documentos físicos","A garantia somente existe quando o imóvel pertence ao advogado"]'::jsonb,
  1,
  'O Estatuto assegura a inviolabilidade do escritório ou local de trabalho, instrumentos e comunicações relacionadas ao exercício da advocacia, observadas as hipóteses legais de afastamento mediante decisão judicial e garantias específicas. Fundamento: Lei nº 8.906/1994, art. 7º, II e §§ correlatos.',
  'Autoral | EAOAB, art. 7º, II','medium','draft',115
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='direitos-prerrogativas'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 016 — honorários: sucumbência
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L2-016',d.id,t.id,
  'Após decisão favorável ao cliente, foram fixados honorários de sucumbência. O contrato particular nada dispõe sobre essa verba. Nesse caso:',
  '["a sucumbência pertence ao cliente, por ser vencedor da demanda","a sucumbência pertence ao advogado, com direito autônomo à execução dessa parcela","a verba deve ser dividida obrigatoriamente em partes iguais","a sucumbência somente pertence ao advogado se houver cláusula contratual expressa"]'::jsonb,
  1,
  'Os honorários incluídos na condenação, por arbitramento ou sucumbência pertencem ao advogado, que possui direito autônomo para executar a sentença nessa parte. Fundamento: Lei nº 8.906/1994, art. 23.',
  'Autoral | EAOAB, art. 23','medium','draft',116
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='honorarios-advocaticios'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 017 — honorários: natureza da relação
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L2-017',d.id,t.id,
  'Ao contratar serviços advocatícios, cliente e advogado pretendem evitar dúvidas futuras quanto à extensão do trabalho e à remuneração. A prática eticamente mais adequada é:',
  '["deixar todos os valores para definição unilateral ao fim do processo","formalizar por escrito o objeto, a remuneração e as condições relevantes da contratação","vincular necessariamente a remuneração apenas ao êxito","omitir despesas previsíveis para simplificar o contrato"]'::jsonb,
  1,
  'A formalização escrita dos honorários e da extensão dos serviços favorece transparência, segurança e delimitação das obrigações profissionais, em consonância com o Estatuto e o Código de Ética.',
  'Autoral | EAOAB/CED — honorários','easy','draft',117
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='honorarios-advocaticios'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 018 — incompatibilidade x impedimento
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L2-018',d.id,t.id,
  'Um candidato confunde os efeitos de incompatibilidade e impedimento para o exercício da advocacia. A distinção correta é:',
  '["ambos geram proibição total do exercício profissional","incompatibilidade gera proibição total; impedimento, proibição parcial nos limites previstos em lei","impedimento gera proibição total e incompatibilidade apenas parcial","nenhum deles restringe atuação consultiva"]'::jsonb,
  1,
  'O Estatuto diferencia incompatibilidade, que importa proibição total, de impedimento, que importa proibição parcial do exercício da advocacia. Fundamento: Lei nº 8.906/1994, art. 27.',
  'Autoral | EAOAB, art. 27','easy','draft',118
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='incompatibilidades-impedimentos'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 019 — impedimento do servidor público
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L2-019',d.id,t.id,
  'Servidor público regularmente inscrito na OAB, que não ocupa cargo submetido a incompatibilidade total, deseja advogar em causa contra a Fazenda Pública que o remunera. Em regra, essa atuação é:',
  '["permitida, por força da liberdade profissional","vedada pelo impedimento previsto no Estatuto","permitida se a causa tiver valor inferior ao limite do Juizado Especial","permitida desde que não envolva matéria administrativa"]'::jsonb,
  1,
  'Servidores da administração direta, indireta e fundacional são impedidos de exercer a advocacia contra a Fazenda Pública que os remunera ou à qual se vincule a entidade empregadora, ressalvadas as hipóteses legais. Fundamento: Lei nº 8.906/1994, art. 30, I.',
  'Autoral | EAOAB, art. 30, I','medium','draft',119
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='incompatibilidades-impedimentos'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 020 — infração: captação de clientela
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L2-020',d.id,t.id,
  'Advogado organiza campanha dirigida a pessoas envolvidas em determinado acidente, incentivando-as individualmente a contratar seus serviços para ajuizar ações. A conduta pode caracterizar:',
  '["marketing jurídico permitido sem restrições","captação de clientela e infração ético-disciplinar","mera publicidade institucional obrigatória","atividade comercial estranha à fiscalização da OAB"]'::jsonb,
  1,
  'A angariação ou captação de causas, com ou sem intervenção de terceiros, é infração disciplinar, e as regras de publicidade também vedam mecanismos destinados a induzir contratação ou estimular litígio. Fundamentos: Lei nº 8.906/1994, art. 34, IV; Provimento CFOAB nº 205/2021.',
  'Autoral | EAOAB, art. 34, IV | Prov. 205/2021','medium','draft',120
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='infracoes-sancoes'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 021 — publicidade: valores e descontos
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L2-021',d.id,t.id,
  'Em anúncio patrocinado, advogado divulga: “Divórcio por R$ 499, desconto de 30% somente esta semana”. Segundo as regras de publicidade da advocacia, essa prática é:',
  '["permitida por se tratar de anúncio pago","vedada, pois utiliza referência a honorários e descontos como instrumento de captação e mercantilização","permitida desde que o valor seja verdadeiro","permitida se veiculada apenas em rede social"]'::jsonb,
  1,
  'O Provimento nº 205/2021 determina caráter informativo, discreto e sóbrio à publicidade e veda referência a valores, formas de pagamento, gratuidade ou descontos como forma de captação de clientes. Fundamento: Provimento CFOAB nº 205/2021, art. 3º, I.',
  'Autoral | Provimento CFOAB 205/2021, art. 3º, I','medium','draft',121
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='publicidade-marketing'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 022 — publicidade: impulsionamento
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L2-022',d.id,t.id,
  'Advogada produz conteúdo educativo sobre direito do consumidor e pretende impulsioná-lo em rede social, sem oferta direta de serviços, promessa de resultado ou estímulo ao litígio. Segundo o Provimento nº 205/2021:',
  '["todo impulsionamento pago é proibido à advocacia","o impulsionamento pode ser admitido, desde que respeitadas as limitações éticas e não haja oferta de serviços ou captação indevida","só é permitido se não houver identificação da advogada","é permitido anunciar resultados concretos obtidos para demonstrar experiência"]'::jsonb,
  1,
  'O marketing de conteúdo e anúncios podem ser utilizados dentro dos limites éticos. O Anexo Único do Provimento nº 205/2021 admite patrocínio e impulsionamento em redes sociais desde que não contenham oferta de serviços jurídicos e sejam respeitadas as demais vedações.',
  'Autoral | Provimento CFOAB 205/2021 e Anexo Único','medium','draft',122
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='publicidade-marketing'
where d.slug='etica-profissional'
on conflict(code) do nothing;
