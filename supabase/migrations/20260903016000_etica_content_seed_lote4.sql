-- Domina OAB — Ética Profissional, lote 4
-- Fecha as lacunas de temas com poucas questões (órgãos da OAB, mandato/renúncia,
-- atos privativos, sociedade de advogados, inscrição, sigilo, disposições gerais)
-- e reforça os temas de maior incidência.
-- Questões autorais estilo 1ª fase FGV; permanecem em draft até revisão jurídica/editorial.

-- 041 — órgãos da OAB / Conselho Federal
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-041',d.id,t.id,
  'Assinale a opção que indica matéria de competência privativa do Conselho Federal da OAB.',
  '["Editar e alterar o Código de Ética e Disciplina, o Regulamento Geral e os Provimentos, além de julgar recursos contra decisões dos Conselhos Seccionais","Instaurar e instruir, em primeira instância, os processos disciplinares contra advogados inscritos","Aplicar o Exame de Ordem em cada unidade da Federação e expedir as carteiras profissionais","Fixar a tabela de honorários advocatícios aplicável a cada comarca"]'::jsonb,
  0,
  'Compete privativamente ao Conselho Federal, entre outras matérias, editar e alterar o Código de Ética e Disciplina, o Regulamento Geral e os Provimentos, e julgar, em grau de recurso, as questões decididas pelos Conselhos Seccionais. A instrução de processos disciplinares cabe às Subseções e Seccionais; a tabela de honorários é fixada pelo Conselho Seccional. Fundamento principal: Lei nº 8.906/1994, art. 54.',
  'Autoral | EAOAB, art. 54','medium','draft',141
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='orgaos-oab'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 042 — órgãos da OAB / Conselho Seccional
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-042',d.id,t.id,
  'A respeito da competência do Conselho Seccional da OAB, assinale a afirmativa correta.',
  '["Cabe-lhe editar o Código de Ética e Disciplina, com validade nacional","Cabe-lhe, entre outras atribuições, fiscalizar a profissão na respectiva base territorial, aplicar sanções disciplinares e criar as Subseções e a Caixa de Assistência dos Advogados","Não possui qualquer competência disciplinar, que é exclusiva do Conselho Federal","Cabe-lhe legislar sobre normas gerais de processo aplicáveis à advocacia"]'::jsonb,
  1,
  'O Conselho Seccional exerce, em sua base territorial, a fiscalização e a disciplina da advocacia, aplica as sanções previstas no Estatuto e cria Subseções e a Caixa de Assistência dos Advogados. A edição do Código de Ética é competência do Conselho Federal. Fundamento principal: Lei nº 8.906/1994, art. 58.',
  'Autoral | EAOAB, art. 58','medium','draft',142
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='orgaos-oab'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 043 — órgãos da OAB / Tribunal de Ética e Disciplina
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-043',d.id,t.id,
  'O Tribunal de Ética e Disciplina do Conselho Seccional é competente, entre outras atribuições, para:',
  '["aplicar diretamente a sanção de exclusão, independentemente de quórum qualificado","julgar os processos disciplinares e responder a consultas formuladas em tese sobre matéria ético-disciplinar","processar e julgar os crimes praticados por advogados no exercício da profissão","fixar o valor das anuidades devidas pelos inscritos"]'::jsonb,
  1,
  'Cabe ao Tribunal de Ética e Disciplina julgar os processos disciplinares e responder a consultas formuladas em tese. A exclusão depende de manifestação de dois terços dos membros do Conselho Seccional; crimes são julgados pela Justiça comum. Fundamento principal: Lei nº 8.906/1994, art. 70, § 1º, e Código de Ética e Disciplina.',
  'Autoral | EAOAB, art. 70, §1º','medium','draft',143
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='orgaos-oab'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 044 — órgãos da OAB / Caixa de Assistência dos Advogados
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-044',d.id,t.id,
  'Sobre as Caixas de Assistência dos Advogados, assinale a afirmativa correta.',
  '["São criadas automaticamente em toda Subseção instalada","Integram o Conselho Federal e têm sede em Brasília","São criadas pelos Conselhos Seccionais que contem com mais de 1.500 inscritos e destinam-se a prestar assistência aos advogados","Têm natureza empresarial e finalidade lucrativa"]'::jsonb,
  2,
  'As Caixas de Assistência dos Advogados são criadas pelos Conselhos Seccionais quando estes contarem com mais de mil e quinhentos inscritos, com a finalidade de prestar assistência aos advogados e, quando possível, aos seus familiares. Fundamento principal: Lei nº 8.906/1994, art. 45, § 4º, e art. 62.',
  'Autoral | EAOAB, art. 45, §4º','medium','draft',144
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='orgaos-oab'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 045 — órgãos da OAB / Subseções
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-045',d.id,t.id,
  'A respeito das Subseções da OAB, assinale a afirmativa correta.',
  '["São criadas pelo Conselho Federal, ouvida a Caixa de Assistência","Podem ser criadas pelo Conselho Seccional, que fixa sua área territorial e limites de competência, exigindo-se um número mínimo de advogados profissionalmente domiciliados na área","Possuem autonomia para editar o próprio código de ética","Substituem o Conselho Seccional em todas as suas competências"]'::jsonb,
  1,
  'A Subseção é criada pelo Conselho Seccional, que fixa sua área territorial e seus limites de competência e autonomia. A área deve contar com um número mínimo de advogados nela profissionalmente domiciliados. Fundamento principal: Lei nº 8.906/1994, art. 60 e § 1º.',
  'Autoral | EAOAB, art. 60','medium','draft',145
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='orgaos-oab'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 046 — mandato e renúncia / atuação sem procuração
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-046',d.id,t.id,
  'Afirmando urgência, o advogado atua sem procuração. Nos termos do Estatuto da Advocacia, ele se obriga a apresentá-la no prazo de:',
  '["5 dias, improrrogável","10 dias, prorrogável por mais 10","15 dias, prorrogável por igual período","30 dias, improrrogável"]'::jsonb,
  2,
  'O advogado, afirmando urgência, pode atuar sem procuração, obrigando-se a apresentá-la no prazo de quinze dias, prorrogável por igual período. Fundamento principal: Lei nº 8.906/1994, art. 5º, § 1º.',
  'Autoral | EAOAB, art. 5º, §1º','easy','draft',146
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='mandato-renuncia'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 047 — mandato e renúncia / substabelecimento
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-047',d.id,t.id,
  'Quanto ao substabelecimento do mandato judicial, assinale a afirmativa correta.',
  '["O substabelecimento com reserva de poderes dispensa qualquer comunicação ao cliente","O substabelecimento sem reserva de poderes exige o prévio e inequívoco conhecimento do cliente","O substabelecimento é vedado na advocacia","O substabelecido com reserva de poderes pode cobrar honorários diretamente do cliente, sem a intervenção de quem substabeleceu"]'::jsonb,
  1,
  'O substabelecimento com reserva de poderes é ato pessoal do advogado da causa e exige comunicação ao cliente; o substabelecimento sem reserva exige o prévio e inequívoco conhecimento do cliente. O substabelecido com reserva não pode cobrar honorários sem a intervenção de quem substabeleceu. Fundamentos: Código de Ética e Disciplina, art. 26; Lei nº 8.906/1994, art. 26.',
  'Autoral | CED, art. 26','medium','draft',147
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='mandato-renuncia'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 048 — mandato e renúncia / renúncia
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-048',d.id,t.id,
  'Sobre a renúncia ao mandato pelo advogado, assinale a afirmativa correta.',
  '["O advogado deve declarar expressamente, na notificação, o motivo da renúncia","A renúncia independe da menção do motivo que a determinou, e o advogado continua a representar o mandante nos 10 dias seguintes à notificação, salvo substituição anterior","A renúncia produz efeitos imediatos, cessando toda responsabilidade do advogado na data da notificação","A renúncia só é válida se homologada pelo juízo"]'::jsonb,
  1,
  'A renúncia ao patrocínio independe de menção do motivo. Feita a comunicação ao cliente, o advogado continua a representá-lo durante os dez dias seguintes, salvo se substituído antes do término desse prazo. Fundamentos: Lei nº 8.906/1994, art. 5º, § 3º; Código de Ética e Disciplina, art. 16.',
  'Autoral | EAOAB, art. 5º, §3º','medium','draft',148
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='mandato-renuncia'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 049 — atos privativos / estagiário
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-049',d.id,t.id,
  'O estagiário de advocacia regularmente inscrito na OAB pode:',
  '["exercer a advocacia de forma plena e autônoma","praticar isoladamente todos os atos privativos, desde que comunique o advogado responsável","praticar os atos de advocacia em conjunto com advogado e sob a responsabilidade deste e, isoladamente, alguns atos previstos no Regulamento Geral, como retirar e devolver autos em cartório e assinar petições de juntada","substituir o advogado em audiência de instrução e julgamento, sem acompanhamento"]'::jsonb,
  2,
  'O estagiário inscrito pratica os atos de advocacia em conjunto com advogado e sob a responsabilidade deste. O Regulamento Geral permite que pratique isoladamente atos como retirar e devolver autos mediante carga, obter certidões e assinar petições de juntada de documentos. Fundamentos: Lei nº 8.906/1994, art. 3º, § 2º; Regulamento Geral, art. 29.',
  'Autoral | EAOAB, art. 3º, §2º','medium','draft',149
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='atos-privativos'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 050 — atos privativos / nulidade
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-050',d.id,t.id,
  'Os atos privativos de advocacia praticados por pessoa não inscrita na OAB, ou por advogado impedido, suspenso, licenciado ou que passe a exercer atividade incompatível, são, em regra:',
  '["válidos, se não houver prejuízo à parte","meramente anuláveis, dependendo de ação própria","válidos após ratificação pela OAB","nulos"]'::jsonb,
  3,
  'São nulos os atos privativos de advogado praticados por pessoa não inscrita na OAB, bem como praticados por advogado impedido, no âmbito do impedimento, suspenso, licenciado ou que passar a exercer atividade incompatível com a advocacia. Fundamento principal: Lei nº 8.906/1994, art. 4º.',
  'Autoral | EAOAB, art. 4º','easy','draft',150
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='atos-privativos'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 051 — atos privativos / visto em atos constitutivos
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-051',d.id,t.id,
  'Segundo o Estatuto da Advocacia, os atos e contratos constitutivos de pessoas jurídicas só podem ser admitidos a registro nos órgãos competentes quando:',
  '["assinados por contador registrado no conselho de classe","visados por advogado, ressalvadas as sociedades enquadradas como microempresa e empresa de pequeno porte","previamente aprovados pelo Conselho Seccional da OAB","publicados em jornal de grande circulação"]'::jsonb,
  1,
  'Os atos e contratos constitutivos de pessoas jurídicas, sob pena de nulidade, só podem ser admitidos a registro quando visados por advogado. A exigência é dispensada para as microempresas e empresas de pequeno porte. Fundamento principal: Lei nº 8.906/1994, art. 1º, § 2º.',
  'Autoral | EAOAB, art. 1º, §2º','medium','draft',151
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='atos-privativos'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 052 — sociedade de advogados / responsabilidade
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-052',d.id,t.id,
  'A respeito da responsabilidade na sociedade de advogados, assinale a afirmativa correta.',
  '["Somente a sociedade responde pelos danos causados aos clientes","Além da sociedade, o sócio responde subsidiária e ilimitadamente pelos danos causados aos clientes por ação ou omissão no exercício da advocacia, sem prejuízo da responsabilidade disciplinar em que possa incorrer","O sócio responde solidariamente com a sociedade, mas de forma limitada ao valor do capital social","A responsabilidade do sócio é exclusivamente disciplinar, nunca patrimonial"]'::jsonb,
  1,
  'Além da sociedade, o sócio responde subsidiária e ilimitadamente pelos danos causados aos clientes por ação ou omissão no exercício da advocacia, sem prejuízo da responsabilidade disciplinar em que possa incorrer. Fundamento principal: Lei nº 8.906/1994, art. 17.',
  'Autoral | EAOAB, art. 17','medium','draft',152
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='sociedade-advogados'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 053 — sociedade de advogados / denominação
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-053',d.id,t.id,
  'Sobre a denominação da sociedade de advogados, assinale a afirmativa correta.',
  '["Pode adotar nome de fantasia, desde que registrado na OAB","A razão social deve conter, obrigatoriamente, o nome de pelo menos um advogado responsável, sendo vedada denominação de fantasia e a indicação de atividade estranha à advocacia","Pode indicar o ramo do direito de maior atuação, para orientar o público","É livre, bastando que não repita a de outra sociedade já registrada"]'::jsonb,
  1,
  'A razão social deve ter, obrigatoriamente, o nome de pelo menos um advogado responsável pela sociedade, podendo permanecer o de sócio falecido se previsto no ato constitutivo. A sociedade não pode apresentar forma ou características de sociedade empresária, adotar denominação de fantasia nem indicar atividade estranha à advocacia. Fundamento principal: Lei nº 8.906/1994, art. 16, caput e § 1º.',
  'Autoral | EAOAB, art. 16','medium','draft',153
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='sociedade-advogados'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 054 — sociedade de advogados / personalidade jurídica
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-054',d.id,t.id,
  'A sociedade de advogados adquire personalidade jurídica com:',
  '["o arquivamento dos atos constitutivos na Junta Comercial","o registro aprovado dos atos constitutivos no Conselho Seccional da OAB em cuja base territorial tiver sede","a inscrição no CNPJ perante a Receita Federal","a simples assinatura do contrato social pelos sócios"]'::jsonb,
  1,
  'A sociedade de advogados e a sociedade unipessoal de advocacia adquirem personalidade jurídica com o registro aprovado dos seus atos constitutivos no Conselho Seccional da OAB em cuja base territorial tiver sede. Fundamento principal: Lei nº 8.906/1994, art. 15, § 1º.',
  'Autoral | EAOAB, art. 15, §1º','medium','draft',154
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='sociedade-advogados'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 055 — inscrição na OAB / licenciamento
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-055',d.id,t.id,
  'Configura hipótese de licenciamento do advogado:',
  '["o falecimento do profissional","passar a exercer, em caráter temporário, atividade incompatível com a advocacia","a aplicação da penalidade de exclusão","a perda definitiva de requisito necessário para a inscrição"]'::jsonb,
  1,
  'Licencia-se o profissional que assim o requerer por motivo justificado, que passar a exercer atividade incompatível em caráter temporário ou que sofrer doença mental considerada curável. Falecimento, exclusão e perda definitiva de requisito são hipóteses de cancelamento. Fundamento principal: Lei nº 8.906/1994, art. 12.',
  'Autoral | EAOAB, art. 12','medium','draft',155
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='inscricao-oab'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 056 — inscrição na OAB / cancelamento
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-056',d.id,t.id,
  'Nos termos do Estatuto, cancela-se a inscrição do profissional que:',
  '["se licencia por motivo de doença considerada curável","passa a exercer, em caráter definitivo, atividade incompatível com a advocacia","muda de domicílio profissional dentro da mesma seccional","deixa de pagar uma única anuidade"]'::jsonb,
  1,
  'Cancela-se a inscrição de quem assim o requerer, sofrer penalidade de exclusão, falecer, passar a exercer em caráter definitivo atividade incompatível com a advocacia ou perder qualquer dos requisitos necessários para a inscrição. Fundamento principal: Lei nº 8.906/1994, art. 11.',
  'Autoral | EAOAB, art. 11','medium','draft',156
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='inscricao-oab'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 057 — inscrição na OAB / requisitos
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-057',d.id,t.id,
  'Entre os requisitos para inscrição como advogado no quadro da OAB, o Estatuto exige:',
  '["comprovação de residência há mais de um ano na base territorial da seccional","aprovação em concurso público específico para a advocacia","indicação por dois advogados inscritos há mais de cinco anos","capacidade civil, diploma ou certidão de graduação em Direito, título de eleitor e quitação do serviço militar, aprovação no Exame de Ordem, ausência de atividade incompatível, idoneidade moral e prestação de compromisso perante o Conselho"]'::jsonb,
  3,
  'O art. 8º da Lei nº 8.906/1994 lista os requisitos de inscrição: capacidade civil, diploma ou certidão de graduação em Direito, título de eleitor e quitação do serviço militar (se brasileiro), aprovação no Exame de Ordem, não exercer atividade incompatível, idoneidade moral e prestação de compromisso perante o Conselho.',
  'Autoral | EAOAB, art. 8º','medium','draft',157
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='inscricao-oab'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 058 — sigilo profissional / natureza
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-058',d.id,t.id,
  'A respeito do sigilo profissional do advogado, assinale a afirmativa correta.',
  '["É simples faculdade do advogado, que pode dele dispor livremente","É, ao mesmo tempo, direito e dever do advogado, presumindo-se confidenciais as comunicações e a correspondência trocadas com o cliente","Cessa integralmente com o encerramento da relação profissional","Só existe quando expressamente pactuado em contrato escrito"]'::jsonb,
  1,
  'O sigilo profissional é inerente à advocacia e constitui, a um só tempo, direito e dever do advogado. Presumem-se confidenciais as comunicações, de qualquer natureza, entre advogado e cliente. Fundamentos: Código de Ética e Disciplina, arts. 35 e 36.',
  'Autoral | CED, arts. 35-36','medium','draft',158
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='sigilo-profissional'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 059 — sigilo profissional / hipóteses de revelação
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-059',d.id,t.id,
  'O sigilo profissional cede, autorizando o advogado a revelar fatos protegidos,',
  '["sempre que houver requerimento da parte contrária","em caso de grave ameaça ao direito à vida e à honra, ou quando o advogado esteja a fazer a sua própria defesa","em qualquer entrevista jornalística sobre o caso","em nenhuma hipótese, ainda que para defender-se de acusação feita pelo próprio cliente"]'::jsonb,
  1,
  'O sigilo profissional cederá em face de circunstâncias excepcionais que configurem justa causa, como grave ameaça ao direito à vida e à honra ou defesa própria do advogado. Fundamento: Código de Ética e Disciplina, art. 37.',
  'Autoral | CED, art. 37','medium','draft',159
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='sigilo-profissional'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 060 — disposições gerais / art. 133 da Constituição
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-060',d.id,t.id,
  'Nos termos da Constituição Federal, o advogado é:',
  '["servidor público equiparado a agente político","indispensável à administração da Justiça, sendo inviolável por seus atos e manifestações no exercício da profissão, nos limites da lei","inviolável de forma absoluta, sem qualquer limite legal","auxiliar da Justiça hierarquicamente subordinado ao magistrado"]'::jsonb,
  1,
  'O advogado é indispensável à administração da Justiça, sendo inviolável por seus atos e manifestações no exercício da profissão, nos limites da lei. A inviolabilidade não é absoluta. Fundamentos: Constituição Federal, art. 133; Lei nº 8.906/1994, art. 2º, § 3º.',
  'Autoral | CF, art. 133','easy','draft',160
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='principios-fundamentais'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 061 — disposições gerais / imunidade profissional
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-061',d.id,t.id,
  'A respeito da imunidade profissional do advogado prevista no Estatuto da Advocacia, assinale a afirmativa correta.',
  '["Abrange o crime de calúnia praticado em juízo, desde que ligado à causa","Torna não puníveis, como injúria ou difamação, as manifestações do advogado no exercício da atividade, em juízo ou fora dele, sem prejuízo das sanções disciplinares pelos excessos","Impede a apuração de qualquer excesso pela OAB","Só se aplica a manifestações escritas apresentadas nos autos"]'::jsonb,
  1,
  'A imunidade profissional afasta a punição por injúria e difamação nas manifestações do advogado no exercício da atividade, em juízo ou fora dele, sem prejuízo das sanções disciplinares perante a OAB pelos excessos. A calúnia não está abrangida, e o STF, na ADI 1.127, afastou a expressão "desacato". Fundamento: Lei nº 8.906/1994, art. 7º, § 2º.',
  'Autoral | EAOAB, art. 7º, §2º','medium','draft',161
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='principios-fundamentais'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 062 — incompatibilidades / instituição financeira
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-062',d.id,t.id,
  'O ocupante de função de direção e gerência em instituição financeira, ainda que privada, em relação ao exercício da advocacia, encontra-se em situação de:',
  '["plena compatibilidade","mero impedimento parcial, limitado às causas da instituição","compatibilidade, desde que atue apenas na esfera consultiva","incompatibilidade, que importa proibição total do exercício da advocacia"]'::jsonb,
  3,
  'A advocacia é incompatível, ainda que em causa própria, com a ocupação de funções de direção e gerência em instituições financeiras, inclusive privadas. A incompatibilidade importa proibição total do exercício da advocacia. Fundamento principal: Lei nº 8.906/1994, art. 28, V.',
  'Autoral | EAOAB, art. 28, V','medium','draft',162
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='incompatibilidades-impedimentos'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 063 — impedimentos / membros do Poder Legislativo
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-063',d.id,t.id,
  'Os membros do Poder Legislativo, em seus diferentes níveis, estão impedidos de exercer a advocacia:',
  '["em qualquer causa, por se tratar de incompatibilidade total","contra ou a favor das pessoas jurídicas de direito público, empresas públicas, sociedades de economia mista, fundações públicas, entidades paraestatais e empresas concessionárias ou permissionárias de serviço público","apenas contra o ente federativo ao qual estejam vinculados","somente em matéria criminal"]'::jsonb,
  1,
  'Trata-se de impedimento, e não de incompatibilidade. Os membros do Poder Legislativo, em seus diferentes níveis, são impedidos de exercer a advocacia contra ou a favor das pessoas jurídicas de direito público, empresas públicas, sociedades de economia mista, fundações públicas, entidades paraestatais e empresas concessionárias ou permissionárias de serviço público. Fundamento principal: Lei nº 8.906/1994, art. 30, II.',
  'Autoral | EAOAB, art. 30, II','medium','draft',163
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='incompatibilidades-impedimentos'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 064 — prerrogativas / prisão em flagrante
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-064',d.id,t.id,
  'O advogado somente poderá ser preso em flagrante, por motivo ligado ao exercício da profissão,',
  '["em qualquer crime, desde que a família seja comunicada","em caso de crime inafiançável, e ainda assim com a presença de representante da OAB, sob pena de nulidade da prisão","mediante autorização prévia do Conselho Seccional","nunca, pois goza de imunidade total à prisão"]'::jsonb,
  1,
  'O advogado somente poderá ser preso em flagrante, por motivo de exercício da profissão, em caso de crime inafiançável, assegurada a presença de representante da OAB para lavratura do auto respectivo, sob pena de nulidade. Fundamento principal: Lei nº 8.906/1994, art. 7º, § 3º, e inciso IV.',
  'Autoral | EAOAB, art. 7º, §3º','medium','draft',164
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='direitos-prerrogativas'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 065 — prerrogativas / exame de autos
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-065',d.id,t.id,
  'A respeito do direito do advogado de examinar autos, assinale a afirmativa correta.',
  '["Só pode examinar autos de processos em que atue com procuração nos autos","Pode examinar, em qualquer órgão dos Poderes Judiciário e Legislativo, ou da Administração Pública, autos de processos findos ou em andamento, mesmo sem procuração, quando não estiverem sujeitos a sigilo, assegurada a obtenção de cópias","Pode retirar de cartório, sem anuência da parte contrária, autos com prazo em curso comum às partes","Tem acesso irrestrito a autos sob sigilo, independentemente de procuração"]'::jsonb,
  1,
  'É direito do advogado examinar, mesmo sem procuração, autos de processos findos ou em andamento não sujeitos a sigilo, em qualquer repartição, e obter cópias. Nos autos sujeitos a sigilo, o acesso é assegurado ao advogado com procuração. A retirada de autos com prazo comum depende de anuência ou previsão específica. Fundamento principal: Lei nº 8.906/1994, art. 7º, XIII a XVI e §1º.',
  'Autoral | EAOAB, art. 7º, XIII-XVI','hard','draft',165
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='direitos-prerrogativas'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 066 — honorários / falecimento do advogado
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-066',d.id,t.id,
  'Falecendo o advogado no curso do processo, os honorários de sucumbência já cabíveis:',
  '["extinguem-se, por serem verba personalíssima","são recebidos pelos seus sucessores ou representantes legais, na proporção do trabalho realizado","revertem integralmente ao cliente vencedor","passam ao advogado que assumir a causa, ainda que este nada acrescente"]'::jsonb,
  1,
  'Na hipótese de falecimento ou incapacidade civil do advogado, os honorários de sucumbência, proporcionais ao trabalho realizado, são recebidos por seus sucessores ou representantes legais. Fundamento principal: Lei nº 8.906/1994, art. 24, § 2º.',
  'Autoral | EAOAB, art. 24, §2º','medium','draft',166
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='honorarios-advocaticios'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 067 — sanções / suspensão
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-067',d.id,t.id,
  'A respeito da sanção disciplinar de suspensão, assinale a afirmativa correta.',
  '["Tem prazo fixo de 60 dias em qualquer hipótese","Acarreta a interdição do exercício profissional em todo o território nacional, pelo prazo de 30 dias a 12 meses, e aplica-se também em caso de reincidência em infração disciplinar","Produz efeitos apenas na seccional em que foi aplicada","É automaticamente convertida em censura quando houver circunstâncias atenuantes"]'::jsonb,
  1,
  'A suspensão acarreta a interdição do exercício profissional, em todo o território nacional, pelo prazo de trinta dias a doze meses, conforme a infração e as circunstâncias, e é aplicável, entre outras hipóteses, em caso de reincidência em infração disciplinar. Fundamento principal: Lei nº 8.906/1994, art. 37 e § 1º.',
  'Autoral | EAOAB, art. 37','medium','draft',167
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='infracoes-sancoes'
where d.slug='etica-profissional'
on conflict(code) do nothing;

-- 068 — sanções / prescrição
insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position)
select 'ETICA-L4-068',d.id,t.id,
  'A pretensão à punibilidade das infrações disciplinares prescreve em:',
  '["2 anos, contados da data do fato","3 anos, contados do trânsito em julgado de eventual ação penal","5 anos, contados da constatação oficial do fato, aplicando-se ainda a prescrição ao processo disciplinar paralisado por mais de 3 anos, pendente de despacho ou julgamento","10 anos, contados da instauração do processo disciplinar"]'::jsonb,
  2,
  'A pretensão à punibilidade das infrações disciplinares prescreve em cinco anos, contados da data da constatação oficial do fato. Aplica-se a prescrição a todo processo disciplinar paralisado por mais de três anos, pendente de despacho ou julgamento. Fundamento principal: Lei nº 8.906/1994, art. 43 e § 1º.',
  'Autoral | EAOAB, art. 43','medium','draft',168
from public.disciplines d join public.question_topics t on t.discipline_id=d.id and t.slug='infracoes-sancoes'
where d.slug='etica-profissional'
on conflict(code) do nothing;
