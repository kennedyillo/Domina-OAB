do $$
declare r record;
begin
  for r in
    select id from public.questions
    where code in (
      'ETICA-L4-049','ETICA-L4-050','ETICA-L4-051',
      'ETICA-L3-038','ETICA-L4-055','ETICA-L4-056','ETICA-L4-057',
      'ETICA-L4-046','ETICA-L4-047','ETICA-L4-048',
      'ETICA-L4-060','ETICA-L4-061',
      'ETICA-L3-040','ETICA-L4-058','ETICA-L4-059',
      'ETICA-L3-039','ETICA-L4-052','ETICA-L4-053','ETICA-L4-054'
    )
  loop
    perform public.snapshot_question_version(r.id,'legal_review_remaining_2026_09_04','system@dominaoab.com.br');
  end loop;
end $$;

-- ATOS PRIVATIVOS
update public.questions
set explanation='O estagiário regularmente inscrito pode praticar atos de advocacia em conjunto com advogado e sob a responsabilidade deste. O Regulamento Geral admite a prática isolada de atos específicos, e o Provimento nº 217/2023 remete expressamente aos atos descritos no art. 29 do Regulamento Geral.',
    source_label='Autoral | EAOAB, art. 3º, §2º | Regulamento Geral, art. 29 | Prov. CFOAB 217/2023, art. 2º, §6º',
    updated_at=now()
where code='ETICA-L4-049';

update public.questions
set explanation='São nulos os atos privativos de advogado praticados por pessoa não inscrita na OAB. Também são nulos os atos praticados por advogado impedido, no âmbito do impedimento, suspenso, licenciado ou que passe a exercer atividade incompatível. Fundamento: Lei nº 8.906/1994, art. 4º e parágrafo único.',
    source_label='Autoral | EAOAB, art. 4º e parágrafo único',
    updated_at=now()
where code='ETICA-L4-050';

update public.questions
set explanation='Em regra, atos e contratos constitutivos de pessoas jurídicas só são admitidos a registro quando visados por advogado. O tratamento favorecido das microempresas e empresas de pequeno porte dispensa esse visto. Fundamentos: Lei nº 8.906/1994, art. 1º, §2º, e Lei Complementar nº 123/2006, art. 9º, §2º.',
    source_label='Autoral | EAOAB, art. 1º, §2º | LC 123/2006, art. 9º, §2º',
    updated_at=now()
where code='ETICA-L4-051';

-- INSCRIÇÃO
update public.questions
set statement='Pessoa graduada em Direito no exterior pretende inscrever-se como advogada na OAB brasileira. Além dos demais requisitos legais, deverá:',
    options='["apenas apresentar tradução simples do diploma estrangeiro","fazer prova do título de graduação obtido no exterior devidamente revalidado, além de atender aos demais requisitos do art. 8º","realizar novo curso de Direito integralmente no Brasil em qualquer hipótese","comprovar cinco anos de prática jurídica no país de origem"]'::jsonb,
    correct_index=1,
    explanation='O estrangeiro ou brasileiro não graduado em Direito no Brasil deve comprovar o título de graduação obtido em instituição estrangeira devidamente revalidado, além de preencher os demais requisitos de inscrição. Fundamento: Lei nº 8.906/1994, art. 8º, §2º.',
    source_label='Autoral | EAOAB, art. 8º, §2º',
    subtopic='Diploma estrangeiro e revalidação',
    updated_at=now()
where code='ETICA-L3-038';

update public.questions
set explanation='Licencia-se o profissional que o requer por motivo justificado, que passa a exercer temporariamente atividade incompatível com a advocacia ou que sofre doença mental considerada curável. Fundamento: Lei nº 8.906/1994, art. 12, I a III.',
    source_label='Autoral | EAOAB, art. 12, I-III',
    updated_at=now()
where code='ETICA-L4-055';

update public.questions
set explanation='Cancela-se a inscrição, entre outras hipóteses, quando o profissional passa a exercer em caráter definitivo atividade incompatível com a advocacia. Fundamento: Lei nº 8.906/1994, art. 11, IV.',
    source_label='Autoral | EAOAB, art. 11, IV',
    updated_at=now()
where code='ETICA-L4-056';

update public.questions
set explanation='O Estatuto exige capacidade civil; diploma ou certidão de graduação em Direito; título de eleitor e quitação do serviço militar, se brasileiro; aprovação no Exame de Ordem; não exercer atividade incompatível; idoneidade moral; e compromisso perante o Conselho. Fundamento: Lei nº 8.906/1994, art. 8º, I a VII.',
    source_label='Autoral | EAOAB, art. 8º, I-VII',
    updated_at=now()
where code='ETICA-L4-057';

-- MANDATO
update public.questions
set explanation='Em situação de urgência, o advogado pode atuar sem procuração, devendo apresentá-la em quinze dias, prazo prorrogável por igual período. Fundamento: Lei nº 8.906/1994, art. 5º, §1º.',
    source_label='Autoral | EAOAB, art. 5º, §1º',
    updated_at=now()
where code='ETICA-L4-046';

update public.questions
set statement='Quanto ao substabelecimento do mandato, segundo o Código de Ética e Disciplina, assinale a afirmativa correta.',
    options='["o substabelecimento com reserva de poderes exige sempre prévio e inequívoco conhecimento do cliente","o substabelecimento sem reserva de poderes exige o prévio e inequívoco conhecimento do cliente","todo substabelecimento depende de autorização judicial","o substabelecido com reserva de poderes pode fixar unilateralmente seus honorários, sem qualquer ajuste com o substabelecente"]'::jsonb,
    correct_index=1,
    explanation='O substabelecimento com reserva de poderes é ato pessoal do advogado da causa. O substabelecimento sem reserva exige prévio e inequívoco conhecimento do cliente, e o substabelecido com reserva deve ajustar antecipadamente seus honorários com o substabelecente. Fundamento: Código de Ética e Disciplina da OAB, art. 26, caput e §§1º-2º.',
    source_label='Autoral | CED OAB, art. 26, caput e §§1º-2º',
    subtopic='Substabelecimento com e sem reserva de poderes',
    updated_at=now()
where code='ETICA-L4-047';

update public.questions
set statement='O cliente revoga o mandato judicial antes do encerramento do serviço, sem imputar culpa ao advogado. Segundo o Código de Ética e Disciplina, essa revogação:',
    options='["extingue automaticamente todos os honorários contratados e sucumbenciais","não desobriga o cliente do pagamento das verbas honorárias contratadas e não retira o direito do advogado à sucumbência proporcional ao serviço efetivamente prestado","só produz efeitos se homologada pela OAB","obriga o advogado a devolver honorários já vencidos em qualquer hipótese"]'::jsonb,
    correct_index=1,
    explanation='A revogação do mandato por vontade do cliente não o desobriga do pagamento das verbas honorárias contratadas, nem retira o direito do advogado à verba de sucumbência calculada proporcionalmente ao serviço efetivamente prestado. Fundamento: Código de Ética e Disciplina da OAB, art. 17.',
    source_label='Autoral | CED OAB, art. 17',
    subtopic='Revogação do mandato e efeitos sobre honorários',
    updated_at=now()
where code='ETICA-L4-048';

-- PRINCÍPIOS FUNDAMENTAIS
update public.questions
set explanation='A Constituição estabelece que o advogado é indispensável à administração da Justiça e inviolável por seus atos e manifestações no exercício da profissão, nos limites da lei. O Estatuto repete a inviolabilidade funcional. Fundamentos: Constituição Federal, art. 133, e Lei nº 8.906/1994, art. 2º, §3º.',
    source_label='Autoral | CF, art. 133 | EAOAB, art. 2º, §3º',
    updated_at=now()
where code='ETICA-L4-060';

update public.questions
set explanation='O §2º do art. 7º assegura imunidade profissional quanto a injúria e difamação nas manifestações ligadas ao exercício da advocacia, sem afastar sanções disciplinares por excessos. O STF excluiu o desacato do alcance da norma na ADI 1.127. A revogação formal do §2º pela Lei nº 14.365/2022 foi declarada inconstitucional pelo STF na ADI 7.231, restabelecendo sua vigência em 2025.',
    source_label='Autoral | EAOAB, art. 7º, §2º | STF, ADI 1.127 e ADI 7.231',
    updated_at=now()
where code='ETICA-L4-061';

-- SIGILO
update public.questions
set explanation='O advogado não é obrigado a depor, em processo ou procedimento judicial, administrativo ou arbitral, sobre fatos a cujo respeito deva guardar sigilo profissional. Fundamento: Código de Ética e Disciplina da OAB, art. 38.',
    source_label='Autoral | CED OAB, art. 38',
    updated_at=now()
where code='ETICA-L3-040';

update public.questions
set explanation='O advogado tem o dever de guardar sigilo dos fatos conhecidos no exercício da profissão. O sigilo é de ordem pública, independe de pedido do cliente e as comunicações entre advogado e cliente presumem-se confidenciais. Fundamentos: Código de Ética e Disciplina da OAB, arts. 35 e 36.',
    source_label='Autoral | CED OAB, arts. 35-36',
    updated_at=now()
where code='ETICA-L4-058';

update public.questions
set explanation='O sigilo profissional cede diante de circunstâncias excepcionais que configurem justa causa, como grave ameaça ao direito à vida e à honra ou quando envolvam defesa própria do advogado. Fundamento: Código de Ética e Disciplina da OAB, art. 37.',
    source_label='Autoral | CED OAB, art. 37',
    updated_at=now()
where code='ETICA-L4-059';

-- SOCIEDADE DE ADVOGADOS
update public.questions
set statement='Advogado já integra uma sociedade de advogados com sede em determinada Seccional da OAB e pretende, na mesma área territorial, constituir também sociedade unipessoal de advocacia. Segundo o Estatuto:',
    options='["a cumulação é livre se os nomes empresariais forem diferentes","é vedado integrar simultaneamente sociedade de advogados e sociedade unipessoal de advocacia com sede ou filial na mesma área territorial do respectivo Conselho Seccional","a vedação só existe quando as sociedades atuam na mesma especialidade jurídica","a cumulação depende apenas da autorização dos demais sócios"]'::jsonb,
    correct_index=1,
    explanation='Nenhum advogado pode integrar mais de uma sociedade de advogados, constituir mais de uma sociedade unipessoal, ou integrar simultaneamente uma sociedade de advogados e uma sociedade unipessoal com sede ou filial na mesma área territorial do respectivo Conselho Seccional. Fundamento: Lei nº 8.906/1994, art. 15, §4º.',
    source_label='Autoral | EAOAB, art. 15, §4º',
    subtopic='Limites à participação societária na mesma Seccional',
    updated_at=now()
where code='ETICA-L3-039';

update public.questions
set explanation='Além da sociedade, o sócio e o titular da sociedade individual de advocacia respondem subsidiária e ilimitadamente pelos danos causados aos clientes por ação ou omissão no exercício da advocacia, sem prejuízo da responsabilidade disciplinar. Fundamento: Lei nº 8.906/1994, art. 17.',
    source_label='Autoral | EAOAB, art. 17',
    updated_at=now()
where code='ETICA-L4-052';

update public.questions
set explanation='Não podem funcionar sociedades de advogados com forma ou características empresárias, denominação de fantasia, atividades estranhas à advocacia ou participação de pessoa não inscrita ou totalmente proibida de advogar. A razão social deve conter o nome de pelo menos um advogado responsável. Fundamento: Lei nº 8.906/1994, art. 16, caput e §1º.',
    source_label='Autoral | EAOAB, art. 16, caput e §1º',
    updated_at=now()
where code='ETICA-L4-053';

update public.questions
set explanation='A sociedade de advogados e a sociedade unipessoal de advocacia adquirem personalidade jurídica com o registro aprovado dos atos constitutivos no Conselho Seccional da OAB em cuja base territorial tiverem sede. Fundamento: Lei nº 8.906/1994, art. 15, §1º.',
    source_label='Autoral | EAOAB, art. 15, §1º',
    updated_at=now()
where code='ETICA-L4-054';

update public.questions
set status='published', updated_at=now()
where code in (
  'ETICA-L4-049','ETICA-L4-050','ETICA-L4-051',
  'ETICA-L3-038','ETICA-L4-055','ETICA-L4-056','ETICA-L4-057',
  'ETICA-L4-046','ETICA-L4-047','ETICA-L4-048',
  'ETICA-L4-060','ETICA-L4-061',
  'ETICA-L3-040','ETICA-L4-058','ETICA-L4-059',
  'ETICA-L3-039','ETICA-L4-052','ETICA-L4-053','ETICA-L4-054'
);
