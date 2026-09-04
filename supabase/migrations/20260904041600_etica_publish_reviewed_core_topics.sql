do $$
declare r record;
begin
  for r in
    select id from public.questions
    where code in (
      'ETICA-L1-011','ETICA-L1-012','ETICA-L3-032','ETICA-L3-033','ETICA-L3-034',
      'ETICA-L3-035','ETICA-L3-036','ETICA-L3-037','ETICA-L2-020','ETICA-L2-021',
      'ETICA-L2-022','ETICA-L4-041','ETICA-L4-042','ETICA-L4-043','ETICA-L4-044',
      'ETICA-L4-045','ETICA-L4-067','ETICA-L4-068'
    )
  loop
    perform public.snapshot_question_version(r.id,'legal_review_2026_09_04','system@dominaoab.com.br');
  end loop;
end $$;

update public.questions
set source_label='Autoral | EAOAB, art. 34, XXII',
    explanation='Reter abusivamente ou extraviar autos recebidos com vista ou em confiança constitui infração disciplinar. Fundamento: Lei nº 8.906/1994, art. 34, XXII.',
    updated_at=now()
where code='ETICA-L3-034';

update public.questions
set source_label='Autoral | Provimento CFOAB 205/2021, arts. 1º, 3º e 4º + Anexo Único',
    explanation='O marketing jurídico e a publicidade de conteúdo jurídico são admitidos desde que tenham caráter informativo, discreto e sóbrio, sem captação indevida ou mercantilização. O Anexo Único admite patrocínio e impulsionamento em redes sociais desde que não haja oferta de serviços jurídicos.',
    updated_at=now()
where code='ETICA-L1-012';

update public.questions
set source_label='Autoral | Provimento CFOAB 205/2021, art. 3º, I',
    explanation='É vedada a referência direta ou indireta a valores de honorários, formas de pagamento, gratuidade, descontos ou redução de preços como forma de captação de clientes. Fundamento: Provimento CFOAB nº 205/2021, art. 3º, I.',
    updated_at=now()
where code='ETICA-L3-035';

update public.questions
set source_label='Autoral | Provimento CFOAB 205/2021, arts. 1º e 4º',
    explanation='O marketing jurídico e a produção de conteúdo jurídico informativo são admitidos, inclusive em meios digitais, desde que respeitados os limites de discrição, sobriedade, ausência de captação indevida e de mercantilização. Fundamento: Provimento CFOAB nº 205/2021, arts. 1º e 4º.',
    updated_at=now()
where code='ETICA-L3-036';

update public.questions
set source_label='Autoral | Provimento CFOAB 205/2021, arts. 3º, IV, e 6º',
    explanation='A publicidade não pode empregar expressões persuasivas de autoengrandecimento nem prometer resultados. Também é vedada a utilização de casos concretos para oferta de atuação profissional. Fundamento: Provimento CFOAB nº 205/2021, arts. 3º, IV, e 6º.',
    updated_at=now()
where code='ETICA-L3-037';

update public.questions
set source_label='Autoral | EAOAB, art. 34, IV | Provimento CFOAB 205/2021, arts. 2º, VIII, e 3º',
    explanation='Angariar ou captar causas, com ou sem intervenção de terceiros, constitui infração disciplinar. O Provimento nº 205/2021 também veda mecanismos de marketing destinados a induzir contratação de serviços ou estimular litígio. Fundamentos: Lei nº 8.906/1994, art. 34, IV, e Provimento CFOAB nº 205/2021, arts. 2º, VIII, e 3º.',
    updated_at=now()
where code='ETICA-L2-020';

update public.questions
set statement='Advogada considera pagar uma taxa a uma publicação privada para viabilizar sua aparição em ranking que a destacaria como uma das melhores profissionais da área. À luz do Provimento nº 205/2021, essa prática:',
    options='["é permitida sempre que a publicação informe a metodologia do ranking","é vedada quando houver pagamento, patrocínio ou outra despesa para viabilizar a aparição em ranking, prêmio ou honraria destinada a destacar o profissional","é permitida se constar o número de inscrição na OAB","é permitida quando não houver oferta direta de serviços jurídicos"]'::jsonb,
    correct_index=1,
    explanation='É vedado pagar, patrocinar ou realizar despesa para viabilizar aparição em rankings, prêmios ou honrarias que visem destacar ou eleger profissionais. Fundamento: Provimento CFOAB nº 205/2021, art. 5º, § 1º.',
    source_label='Autoral | Provimento CFOAB 205/2021, art. 5º, §1º',
    subtopic='Rankings, prêmios e honrarias',
    updated_at=now()
where code='ETICA-L2-021';

update public.questions
set statement='Escritório mantém grupo de WhatsApp formado por clientes e contatos determinados que aceitaram participar. Pretende divulgar conteúdo jurídico informativo, sem oferta direta de serviços nem estímulo ao litígio. Segundo o Provimento nº 205/2021 e seu Anexo Único, a conduta:',
    options='["é sempre proibida porque mensagens por aplicativo configuram captação","pode ser admitida, desde que o grupo seja de pessoas determinadas das relações do advogado ou escritório e o conteúdo respeite as normas éticas","é permitida apenas se não houver identificação do escritório","é livre de limitações por se tratar de grupo fechado"]'::jsonb,
    correct_index=1,
    explanation='O Anexo Único do Provimento nº 205/2021 admite divulgação em grupos de WhatsApp quando se trate de grupo de pessoas determinadas das relações do advogado ou escritório, desde que o conteúdo respeite o Código de Ética e o próprio Provimento.',
    source_label='Autoral | Provimento CFOAB 205/2021, Anexo Único',
    subtopic='Grupos de WhatsApp e público determinado',
    updated_at=now()
where code='ETICA-L2-022';

update public.questions
set source_label='Autoral | EAOAB, art. 54, V e IX',
    explanation='Compete ao Conselho Federal editar e alterar o Regulamento Geral, o Código de Ética e Disciplina e os Provimentos, além de julgar, em grau de recurso, as questões decididas pelos Conselhos Seccionais nos casos previstos no Estatuto e no Regulamento Geral. Fundamento: Lei nº 8.906/1994, art. 54, V e IX.',
    updated_at=now()
where code='ETICA-L4-041';

update public.questions
set options='["Cabe-lhe editar o Código de Ética e Disciplina, com validade nacional","Cabe-lhe, entre outras atribuições, criar Subseções e a Caixa de Assistência, realizar o Exame de Ordem, decidir pedidos de inscrição e fixar a tabela de honorários válida no território estadual","Não possui qualquer competência disciplinar, que é exclusiva do Conselho Federal","Cabe-lhe legislar sobre normas gerais de processo aplicáveis à advocacia"]'::jsonb,
    correct_index=1,
    explanation='Entre as competências privativas do Conselho Seccional estão criar Subseções e a Caixa de Assistência, fixar a tabela de honorários, realizar o Exame de Ordem e decidir pedidos de inscrição. Fundamento: Lei nº 8.906/1994, art. 58, II, V, VI e VII.',
    source_label='Autoral | EAOAB, art. 58, II, V, VI e VII',
    updated_at=now()
where code='ETICA-L4-042';

update public.questions
set explanation='O Tribunal de Ética e Disciplina julga os processos disciplinares no âmbito de sua competência e também responde a consultas formuladas em tese sobre matéria ético-disciplinar. Fundamentos: Lei nº 8.906/1994, art. 70, § 1º, e Código de Ética e Disciplina, art. 71, I e II.',
    source_label='Autoral | EAOAB, art. 70, §1º | CED, art. 71, I-II',
    updated_at=now()
where code='ETICA-L4-043';

update public.questions
set options='["São criadas automaticamente em toda Subseção instalada","Integram o Conselho Federal e têm sede em Brasília","São criadas pelos Conselhos Seccionais que contem com mais de 1.500 inscritos e destinam-se a prestar assistência aos inscritos no Conselho Seccional a que se vinculam","Têm natureza empresarial e finalidade lucrativa"]'::jsonb,
    correct_index=2,
    explanation='As Caixas de Assistência dos Advogados são criadas pelos Conselhos Seccionais quando estes contarem com mais de 1.500 inscritos e destinam-se a prestar assistência aos inscritos no Conselho Seccional a que se vinculam. Fundamentos: Lei nº 8.906/1994, art. 45, § 4º, e art. 62.',
    source_label='Autoral | EAOAB, arts. 45, §4º, e 62',
    updated_at=now()
where code='ETICA-L4-044';

update public.questions
set options='["São criadas pelo Conselho Federal, ouvida a Caixa de Assistência","Podem ser criadas pelo Conselho Seccional, que fixa sua área territorial e limites de competência e autonomia, devendo a área contar com no mínimo 15 advogados profissionalmente domiciliados","Possuem autonomia para editar o próprio Código de Ética","Substituem o Conselho Seccional em todas as suas competências"]'::jsonb,
    correct_index=1,
    explanation='A Subseção pode ser criada pelo Conselho Seccional, que fixa sua área territorial e limites de competência e autonomia. A área territorial deve contar com no mínimo 15 advogados nela profissionalmente domiciliados, quantitativo que pode ser ampliado pelo regimento interno da Seccional. Fundamento: Lei nº 8.906/1994, art. 60, caput, §§ 1º e 4º.',
    source_label='Autoral | EAOAB, art. 60, caput, §§1º e 4º',
    updated_at=now()
where code='ETICA-L4-045';

update public.questions
set options='["Tem prazo fixo de 60 dias em qualquer hipótese","Em regra, acarreta interdição do exercício profissional em todo o território nacional por 30 dias a 12 meses e também se aplica em caso de reincidência disciplinar, sem prejuízo das hipóteses legais em que sua duração se vincula ao cumprimento de condição","Produz efeitos apenas na Seccional em que foi aplicada","É automaticamente convertida em censura quando houver circunstâncias atenuantes"]'::jsonb,
    correct_index=1,
    explanation='A suspensão aplica-se às hipóteses previstas no art. 37, inclusive à reincidência em infração disciplinar. Em regra, interdita o exercício profissional em todo o território nacional por 30 dias a 12 meses; em hipóteses específicas, a lei vincula sua duração à satisfação de obrigação ou à prestação de novas provas de habilitação. Fundamento: Lei nº 8.906/1994, art. 37, caput e §§ 1º a 3º.',
    source_label='Autoral | EAOAB, art. 37, caput e §§1º-3º',
    updated_at=now()
where code='ETICA-L4-067';

update public.questions
set status='published', updated_at=now()
where code in (
  'ETICA-L1-011','ETICA-L1-012','ETICA-L3-032','ETICA-L3-033','ETICA-L3-034',
  'ETICA-L3-035','ETICA-L3-036','ETICA-L3-037','ETICA-L2-020','ETICA-L2-021',
  'ETICA-L2-022','ETICA-L4-041','ETICA-L4-042','ETICA-L4-043','ETICA-L4-044',
  'ETICA-L4-045','ETICA-L4-067','ETICA-L4-068'
);
