-- Domina OAB — Ética Profissional, lote 3
-- Questões autorais estilo 1ª fase, priorizando temas de maior incidência.
-- Mantidas em draft até revisão jurídica/editorial.

-- 023 — prerrogativas / acesso a autos
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-023',d.id,t.id,
  'Advogada regularmente constituída pretende examinar autos de investigação já documentados. A autoridade nega acesso integralmente, sem indicar diligência em andamento que possa ser prejudicada. À luz das prerrogativas profissionais, assinale a correta.',
  '["A negativa é sempre legítima em investigação","O acesso a elementos já documentados deve ser assegurado nos limites legais, ressalvadas diligências em andamento cuja eficácia possa ser comprometida","Somente o Ministério Público pode autorizar o acesso","O acesso depende de sentença judicial"]'::jsonb,
  1,
  'A prerrogativa de acesso alcança os elementos de prova já documentados, observadas as restrições legais relativas a diligências em andamento. Fundamento: EAOAB, art. 7º, e legislação correlata.',
  'Autoral | EAOAB, art. 7º','hard','draft',123
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='direitos-prerrogativas'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 024 — prerrogativas / inviolabilidade
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-024',d.id,t.id,
  'Sobre a inviolabilidade do local de trabalho do advogado, assinale a afirmativa correta.',
  '["É absoluta e impede qualquer medida judicial","Protege o local, instrumentos e comunicações profissionais, sem afastar hipóteses legais de busca e apreensão submetidas a requisitos específicos","Existe apenas para escritórios individuais","Não alcança dados eletrônicos"]'::jsonb,
  1,
  'A inviolabilidade profissional é garantia funcional, mas não absoluta. Medidas excepcionais dependem do cumprimento dos requisitos legais e da proteção do material estranho ao objeto da investigação. Fundamento: EAOAB, art. 7º, II e §§ correlatos.',
  'Autoral | EAOAB, art. 7º','hard','draft',124
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='direitos-prerrogativas'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 025 — prerrogativas / prisão
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-025',d.id,t.id,
  'Em razão de fato ligado ao exercício profissional, advogado é preso antes do trânsito em julgado. Quanto ao local de custódia, a disciplina estatutária estabelece proteção específica. Qual alternativa melhor traduz essa regra?',
  '["O advogado deve ser colocado obrigatoriamente em cela comum","A lei assegura recolhimento em sala de Estado-Maior e, na sua falta, prisão domiciliar, nos termos estatutários e da interpretação jurisprudencial aplicável","A OAB escolhe livremente o estabelecimento prisional","Não existe qualquer prerrogativa relacionada à custódia"]'::jsonb,
  1,
  'O Estatuto prevê garantia específica de recolhimento antes do trânsito em julgado, sujeita à disciplina legal e à jurisprudência aplicável. Fundamento principal: EAOAB, art. 7º, V.',
  'Autoral | EAOAB, art. 7º, V','hard','draft',125
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='direitos-prerrogativas'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 026 — honorários / prescrição
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-026',d.id,t.id,
  'A pretensão de cobrança de honorários advocatícios prescreve, em regra, em:',
  '["dois anos","três anos","cinco anos","dez anos"]'::jsonb,
  2,
  'O Estatuto fixa prazo prescricional de cinco anos para a ação de cobrança de honorários, contado conforme a hipótese legal. Fundamento: EAOAB, art. 25.',
  'Autoral | EAOAB, art. 25','easy','draft',126
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='honorarios-advocaticios'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 027 — honorários / acordo do cliente
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-027',d.id,t.id,
  'Cliente e parte contrária celebram acordo sem participação do advogado. Em relação aos honorários convencionados ou fixados judicialmente do profissional, assinale a correta.',
  '["O acordo sempre extingue os honorários","O acordo não prejudica os honorários do advogado, salvo sua aquiescência","Os honorários passam automaticamente à parte contrária","Somente subsistem os honorários contratuais"]'::jsonb,
  1,
  'O acordo feito pelo cliente com a parte contrária, salvo aquiescência do advogado, não lhe prejudica os honorários convencionados nem os concedidos por sentença. Fundamento: EAOAB, art. 24, §4º.',
  'Autoral | EAOAB, art. 24, §4º','medium','draft',127
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='honorarios-advocaticios'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 028 — honorários / substabelecimento
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-028',d.id,t.id,
  'Advogado substabelecido com reserva de poderes pretende cobrar diretamente honorários do cliente. Segundo o Estatuto:',
  '["pode cobrar livremente em qualquer hipótese","não pode cobrar honorários sem a intervenção daquele que lhe conferiu o substabelecimento","só pode cobrar se renunciar aos poderes","a cobrança depende exclusivamente de autorização judicial"]'::jsonb,
  1,
  'O advogado substabelecido com reserva de poderes não pode cobrar honorários sem a intervenção daquele que lhe conferiu o substabelecimento. Fundamento: EAOAB, art. 26.',
  'Autoral | EAOAB, art. 26','medium','draft',128
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='honorarios-advocaticios'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 029 — incompatibilidade / chefia do Executivo
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-029',d.id,t.id,
  'Prefeito municipal regularmente inscrito na OAB pretende continuar exercendo advocacia privada durante o mandato. A situação configura:',
  '["mero impedimento contra o Município","incompatibilidade com o exercício da advocacia","ausência de qualquer restrição","impedimento apenas em causas tributárias"]'::jsonb,
  1,
  'Titulares de cargos ou funções de direção na Administração e integrantes de hipóteses legais específicas podem estar sujeitos à incompatibilidade total. Chefia do Poder Executivo integra as hipóteses estatutárias. Fundamento: EAOAB, arts. 27 e 28.',
  'Autoral | EAOAB, arts. 27-28','medium','draft',129
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='incompatibilidades-impedimentos'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 030 — impedimento / servidor público
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-030',d.id,t.id,
  'Servidor público que não ocupa função incompatível com a advocacia pretende advogar contra a Fazenda Pública que o remunera. Em regra, ele está:',
  '["livre para atuar sem restrição","impedido de advogar contra a Fazenda Pública que o remunera ou à qual esteja vinculada a entidade empregadora","totalmente incompatibilizado com qualquer advocacia","impedido apenas de atuar em processos criminais"]'::jsonb,
  1,
  'O Estatuto prevê impedimento parcial para servidores públicos em relação à Fazenda Pública que os remunera ou à qual seja vinculada a entidade empregadora, ressalvadas hipóteses específicas. Fundamento: EAOAB, art. 30, I.',
  'Autoral | EAOAB, art. 30, I','medium','draft',130
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='incompatibilidades-impedimentos'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 031 — incompatibilidade / atividade policial
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-031',d.id,t.id,
  'Integrante de órgão policial requer inscrição para exercer advocacia paralelamente. À luz do Estatuto, a atividade policial é:',
  '["compatível sem restrições","hipótese de incompatibilidade com a advocacia","mero impedimento contra o Estado","compatível apenas para consultoria extrajudicial"]'::jsonb,
  1,
  'O exercício de atividade vinculada direta ou indiretamente à atividade policial integra as hipóteses estatutárias de incompatibilidade. Fundamento: EAOAB, art. 28.',
  'Autoral | EAOAB, art. 28','easy','draft',131
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='incompatibilidades-impedimentos'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 032 — sanção / censura
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-032',d.id,t.id,
  'No regime disciplinar da OAB, a censura:',
  '["não é sanção disciplinar","é uma das sanções disciplinares previstas no Estatuto","somente pode ser aplicada por juiz criminal","equivale sempre à exclusão"]'::jsonb,
  1,
  'Censura, suspensão, exclusão e multa são sanções disciplinares previstas no Estatuto. Fundamento: EAOAB, art. 35.',
  'Autoral | EAOAB, art. 35','easy','draft',132
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='infracoes-sancoes'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 033 — sanção / exclusão
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-033',d.id,t.id,
  'A aplicação da sanção disciplinar de exclusão do advogado exige:',
  '["decisão individual do presidente da Subseção","procedimento e quórum qualificado previstos no Estatuto","condenação criminal transitada em julgado em qualquer hipótese","pedido do cliente prejudicado"]'::jsonb,
  1,
  'A exclusão é sanção grave e depende do procedimento e do quórum qualificado estabelecidos no Estatuto. Fundamento: EAOAB, arts. 35 e seguintes.',
  'Autoral | EAOAB, regime disciplinar','hard','draft',133
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='infracoes-sancoes'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 034 — infração / retenção de autos
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-034',d.id,t.id,
  'Advogado mantém abusivamente autos recebidos com vista e ignora intimação para devolvê-los. A conduta pode:',
  '["ser irrelevante disciplinarmente","configurar infração disciplinar prevista no Estatuto","gerar apenas responsabilidade civil, nunca disciplinar","ser admitida sempre que existirem honorários em aberto"]'::jsonb,
  1,
  'A retenção abusiva de autos, especialmente após intimação para devolução, pode configurar infração disciplinar. Fundamento: EAOAB, art. 34.',
  'Autoral | EAOAB, art. 34','medium','draft',134
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='infracoes-sancoes'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 035 — publicidade / honorários e desconto
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-035',d.id,t.id,
  'Em anúncio patrocinado, escritório divulga “divórcio por R$ 499, desconto até sexta-feira”. Segundo as regras de publicidade profissional, essa prática é:',
  '["permitida por se tratar de informação objetiva","vedada por utilizar preço, desconto e linguagem promocional como forma de captação","permitida se o anúncio for apenas em rede social","permitida se o escritório informar o número da OAB"]'::jsonb,
  1,
  'O Provimento 205/2021 veda referência a valores, forma de pagamento, gratuidade, descontos ou reduções de preço como mecanismo de captação de clientela. Fundamento: Provimento CFOAB 205/2021, art. 3º.',
  'Autoral | Provimento 205/2021, art. 3º','easy','draft',135
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='publicidade-marketing'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 036 — publicidade / conteúdo informativo
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-036',d.id,t.id,
  'Advogada publica vídeo explicando, de modo sóbrio e geral, alterações legislativas relevantes, sem prometer resultado nem estimular contratação. A conduta é:',
  '["sempre proibida","admitida como marketing jurídico informativo, observados os limites éticos","permitida apenas sem identificação profissional","permitida somente em ambiente acadêmico fechado"]'::jsonb,
  1,
  'O marketing jurídico e a produção de conteúdo informativo são admitidos, desde que respeitados discrição, sobriedade e ausência de captação indevida ou mercantilização. Fundamento: Provimento CFOAB 205/2021.',
  'Autoral | Provimento 205/2021','easy','draft',136
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='publicidade-marketing'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 037 — publicidade / promessa de resultado
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-037',d.id,t.id,
  'Escritório anuncia em rede social: “100% de êxito em ações desta espécie; garanta sua indenização”. Essa publicidade:',
  '["é válida se baseada em casos reais","é incompatível com os deveres éticos por envolver promessa/indução de resultado e captação","é permitida apenas para clientes antigos","é válida quando impulsionada sem segmentação"]'::jsonb,
  1,
  'A publicidade não pode induzir resultado, usar linguagem persuasiva de autoengrandecimento nem configurar captação de clientela. Fundamento: Provimento CFOAB 205/2021, art. 3º.',
  'Autoral | Provimento 205/2021, art. 3º','medium','draft',137
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='publicidade-marketing'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 038 — inscrição / atividade incompatível
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-038',d.id,t.id,
  'Candidato aprovado no Exame de Ordem exerce atividade legalmente incompatível com a advocacia e requer inscrição definitiva. A OAB deve considerar que:',
  '["a aprovação no Exame supera qualquer incompatibilidade","o exercício de atividade incompatível impede o preenchimento dos requisitos de inscrição enquanto persistir","basta declaração de que não atuará judicialmente","a incompatibilidade só é relevante depois da inscrição"]'::jsonb,
  1,
  'A ausência de exercício de atividade incompatível integra os requisitos legais de inscrição. Fundamento: EAOAB, art. 8º.',
  'Autoral | EAOAB, art. 8º','medium','draft',138
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='inscricao-oab'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 039 — sociedade / sócio em duas sociedades
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-039',d.id,t.id,
  'Advogado pretende integrar simultaneamente mais de uma sociedade de advogados com sede ou filial na mesma área territorial do Conselho Seccional. A pretensão:',
  '["é livre, desde que informe aos clientes","submete-se às limitações estatutárias e regulamentares próprias da participação societária na advocacia","é sempre permitida se as sociedades tiverem nomes distintos","depende apenas de autorização dos demais sócios"]'::jsonb,
  1,
  'A participação societária na advocacia possui limitações próprias destinadas a preservar independência, lealdade e evitar conflitos. Fundamento: EAOAB, art. 15 e Regulamento Geral.',
  'Autoral | EAOAB, art. 15','hard','draft',139
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='sociedade-advogados'
where d.slug='etica-profissional' on conflict(code) do nothing;

-- 040 — sigilo / depoimento
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L3-040',d.id,t.id,
  'Advogado é chamado a depor sobre fato que conheceu exclusivamente em razão de atuação profissional anterior. Em regra:',
  '["deve revelar tudo sempre que intimado","pode invocar o sigilo profissional e recusar-se a revelar fatos protegidos nos limites éticos e legais","o sigilo cessa automaticamente com o fim do mandato","só existe sigilo se houver processo em segredo de justiça"]'::jsonb,
  1,
  'O dever de sigilo subsiste e protege fatos conhecidos em razão da profissão, inclusive após o término da relação profissional, ressalvadas hipóteses excepcionais previstas nas normas éticas. Fundamento: CED/OAB e EAOAB.',
  'Autoral | CED OAB — sigilo profissional','medium','draft',140
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='sigilo-profissional'
where d.slug='etica-profissional' on conflict(code) do nothing;
