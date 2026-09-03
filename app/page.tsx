import { Brand } from "@/components/app-header";
import { PilotCampaign } from "@/components/pilot-campaign";
import { ArrowRight, BookOpenCheck, Check, ChevronRight, CircleCheck, LockKeyhole, Menu, Radar, Target } from "lucide-react";

const themes = [
  {label:"Princípios fundamentais",value:82,tone:"good"},
  {label:"Honorários advocatícios",value:64,tone:"medium"},
  {label:"Infrações e sanções",value:41,tone:"critical"},
];

const steps = [
  {icon:Radar,number:"01",title:"Diagnostique",copy:"Responda questões e descubra seu domínio por disciplina, tema e subtema."},
  {icon:Target,number:"02",title:"Priorize",copy:"Veja quais pontos têm maior potencial para aprofundar seu domínio e consolidar resultados."},
  {icon:BookOpenCheck,number:"03",title:"Corrija",copy:"Estude a explicação certa, pratique novamente e acompanhe a evolução real."},
];

const subjectGroups = [
  {label:"Maior peso",items:["Ética Profissional · 8","Direito Constitucional · 6","Direito Civil · 6","Processo Civil · 6"]},
  {label:"Peso estratégico",items:["Direito Penal · 6","Processo Penal · 6","Direito Administrativo · 5","Direito Tributário · 5"]},
  {label:"Cobertura completa",items:["Trabalho e Processo do Trabalho · 10","Empresarial · 4","Demais disciplinas · 18"]},
];

const planFeatures = ["Desempenho salvo automaticamente","Diagnóstico completo por tema","Histórico e evolução entre simulados","Plano de estudo personalizado","Caderno automático de erros"];

export default function Home(){return <main>
  <header className="site-header">
    <Brand/>
    <nav aria-label="Navegação principal"><a href="#metodo">Método</a><a href="#diagnostico">Diagnóstico</a><a href="#disciplinas">1ª fase</a><a href="#planos">Planos</a></nav>
    <div className="header-actions"><a href="/entrar">Entrar</a><a className="button button-small" href="/simulado">Começar diagnóstico</a></div>
    <button className="menu-button" aria-label="Abrir menu"><Menu/></button>
  </header>

  <section className="hero" id="inicio">
    <div className="hero-copy">
      <span className="eyebrow"><span/> Inteligência de desempenho para a OAB</span>
      <h1>Descubra exatamente o quanto você já <em>domina</em> da prova.</h1>
      <p className="hero-lead">O Domina transforma suas respostas em um diagnóstico preciso e mostra onde estudar, o que corrigir e qual ação tem maior potencial para fortalecer seu desempenho.</p>
      <div className="hero-actions"><a className="button" href="/simulado">Fazer diagnóstico gratuito <ArrowRight size={18}/></a><a className="text-link" href="#metodo">Conhecer o método <ChevronRight size={17}/></a></div>
      <div className="hero-proof"><span><CircleCheck size={17}/> Simulados gratuitos</span><span><CircleCheck size={17}/> Resultado imediato</span><span><CircleCheck size={17}/> Sem cartão</span></div>
    </div>
    <div className="hero-intelligence" aria-label="Exemplo do diagnóstico Domina OAB">
      <div className="intelligence-top"><div><small>DOMÍNIO ATUAL DA PROVA</small><strong>34<span>/80 acertos projetados</span></strong></div><span className="cutline"><i/>42% de domínio<br/><small>leitura consolidada</small></span></div>
      <div className="score-track"><span/><i/></div>
      <p className="score-distance"><b>Próximo foco:</b> consolidar os temas com maior potencial de evolução.</p>
      <div className="intelligence-divider"/>
      <div className="intelligence-heading"><div><small>DOMÍNIO POR TEMA</small><b>Ética Profissional</b></div><a href="/plataforma">Ver diagnóstico <ChevronRight size={15}/></a></div>
      <div className="intelligence-list">{themes.map(item=><div key={item.label}><div><span>{item.label}</span><b>{item.value}%</b></div><div className="data-bar"><span className={item.tone} style={{width:`${item.value}%`}}/></div></div>)}</div>
      <div className="next-action"><span><Target size={19}/></span><div><small>MAIOR POTENCIAL DE EVOLUÇÃO</small><b>Revisar infrações e sanções</b></div><ArrowRight size={18}/></div>
    </div>
  </section>

  <section className="trust-strip"><p>Não é sobre estudar tudo novamente. É sobre transformar evidência em <strong>domínio.</strong></p><div><span>80<small>questões na prova</small></span><i/><span>20<small>disciplinas</small></span><i/><span>40<small>acertos na regra da prova</small></span></div></section>

  <PilotCampaign/>

  <section className="method-section" id="metodo">
    <div className="section-heading"><div><span className="eyebrow"><span/> Método Domina</span><h2>Da resposta ao<br/><strong>próximo passo.</strong></h2></div><p>Enquanto outros cursos entregam mais conteúdo, o Domina organiza a sua preparação a partir de evidências: desempenho, incidência na prova e potencial real de evolução.</p></div>
    <div className="feature-grid">{steps.map(({icon:Icon,number,title,copy})=><article className="feature-card" key={number}><span className="feature-number">{number}</span><span className="feature-icon"><Icon size={24}/></span><h3>{title}</h3><p>{copy}</p><span className="feature-line"/></article>)}</div>
    <div className="journey"><span className="active">Diagnóstico</span><i/><span>Entenda</span><i/><span>Corrija</span><i/><span>Simule</span><i/><span>Domine</span></div>
  </section>

  <section className="product-section" id="diagnostico">
    <div className="product-copy"><span className="eyebrow light"><span/> Sua preparação, mensurável</span><h2>Um painel que explica o que seus erros significam.</h2><p>Você não recebe apenas uma porcentagem. Cada sessão atualiza sua projeção, identifica padrões e reorganiza a prioridade dos temas.</p><ul><li><Check size={17}/> Projeção de domínio e evolução</li><li><Check size={17}/> Domínio por disciplina, tema e subtema</li><li><Check size={17}/> Plano de ação recomendado</li><li><Check size={17}/> Evolução entre simulados</li></ul><a className="button button-light" href="/plataforma">Explorar o painel <ArrowRight size={18}/></a></div>
    <div className="product-console"><div className="console-head"><span><i/> DIAGNÓSTICO ATUALIZADO</span><small>47º EXAME · 1ª FASE</small></div><div className="console-score"><strong>34</strong><span>acertos projetados<br/><b>de 80 questões</b></span></div><div className="console-gain"><small>MAIOR POTENCIAL DE EVOLUÇÃO</small><b>Ética Profissional</b><span>Prioridade recomendada agora</span></div><div className="console-chart"><span style={{height:"32%"}}/><span style={{height:"44%"}}/><span style={{height:"55%"}}/><span style={{height:"68%"}}/><span style={{height:"74%"}}/><span style={{height:"85%"}}/></div></div>
  </section>

  <section className="subjects-section" id="disciplinas">
    <div className="subjects-heading"><div><span className="eyebrow"><span/> Arquitetura completa da prova</span><h2>Uma plataforma preparada para <strong>toda a 1ª fase.</strong></h2></div><p>O MVP começa por Ética Profissional. A estrutura, o diagnóstico e a navegação já foram concebidos para receber as 20 disciplinas sem transformar a experiência em um catálogo confuso.</p></div>
    <div className="subject-groups">{subjectGroups.map((group,index)=><article key={group.label} className={index===0?"subject-group featured":"subject-group"}><div><span>{String(index+1).padStart(2,"0")}</span><h3>{group.label}</h3>{index===0&&<small>PRIMEIRO CICLO</small>}</div><ul>{group.items.map(item=><li key={item}>{item}<ChevronRight size={15}/></li>)}</ul></article>)}</div>
    <a className="subjects-link" href="/disciplinas">Explorar as 20 disciplinas <ArrowRight size={17}/></a>
  </section>

  <section className="resources-section" id="recursos"><div className="resources-intro"><span className="eyebrow"><span/> Ecossistema de preparação</span><h2>Diagnóstico, prática e evolução no mesmo lugar.</h2></div><div className="resources-grid"><article><small>01</small><h3>Simulado diagnóstico</h3><p>Questões no padrão da 1ª fase para medir sua base antes de definir o plano.</p></article><article><small>02</small><h3>Questões comentadas</h3><p>Fundamentação objetiva e explicação das alternativas para transformar erro em domínio.</p></article><article><small>03</small><h3>Plano adaptativo</h3><p>Prioridades recalculadas conforme desempenho, peso da matéria e evolução.</p></article></div></section>

  <section className="plans-section" id="planos">
    <div className="plans-heading"><div><span className="eyebrow"><span/> Acesso e assinatura</span><h2>Os simulados são livres.<br/><strong>A inteligência é personalizada.</strong></h2></div><p>Faça provas gratuitamente sempre que quiser. O Plano Domina salva cada tentativa e transforma seu desempenho em diagnóstico, prioridades e evolução mensurável.</p></div>
    <div className="access-rule"><div><span className="access-icon"><BookOpenCheck/></span><div><small>MODO VISITANTE</small><h3>Simulados sem limite</h3><p>Resultado básico exibido ao final. A tentativa não é salva e o diagnóstico detalhado permanece protegido.</p></div></div><div><span className="access-icon premium"><Radar/></span><div><small>PLANO DOMINA</small><h3>Histórico e diagnóstico completo</h3><p>Cada resposta alimenta seu mapa de domínio e reorganiza o próximo passo da preparação.</p></div></div></div>
    <div className="pricing-grid">
      <article><span className="plan-label">MENSAL</span><h3>Plano Domina</h3><div className="price"><small>R$</small><strong>49</strong><sup>90</sup><span>/mês</span></div><p>Liberdade para cancelar quando quiser.</p><a href="#piloto" className="plan-button">Quero participar <ArrowRight size={16}/></a></article>
      <article className="recommended"><span className="recommendation">MAIS ESCOLHIDO</span><span className="plan-label">CICLO DE 90 DIAS</span><h3>Plano Domina</h3><div className="price"><small>R$</small><strong>129</strong><sup>90</sup></div><p>Ou 3 parcelas de R$ 43,30.</p><a href="#piloto" className="plan-button">Quero participar <ArrowRight size={16}/></a></article>
      <article><span className="plan-label">ANUAL</span><h3>Plano Domina</h3><div className="price"><small>12x R$</small><strong>30</strong><sup>00</sup></div><p>R$ 360 por 12 meses de acesso.</p><a href="#piloto" className="plan-button">Quero participar <ArrowRight size={16}/></a></article>
    </div>
    <div className="plan-features"><div><LockKeyhole size={19}/><span><b>O que a assinatura desbloqueia</b><small>Sem limitar o acesso aos simulados gratuitos.</small></span></div><ul>{planFeatures.map(item=><li key={item}><Check size={16}/>{item}</li>)}</ul></div>
    <p className="plans-note">Os preços serão cobrados somente após o lançamento comercial. Os 25 usuários fundadores não cadastram cartão e não terão renovação automática ao fim do acesso gratuito.</p>
  </section>

  <section className="final-cta"><span className="eyebrow light"><span/> Sua preparação começa com evidência</span><h2>Transforme cada simulado em mais domínio da prova.</h2><p>Faça o simulado gratuitamente. Se quiser transformar as respostas em histórico, diagnóstico e direção, conheça o Plano Domina.</p><div className="final-actions"><a className="button button-light" href="/simulado">Fazer simulado gratuito <ArrowRight size={18}/></a><a className="final-text-link" href="#planos">Conhecer o Plano Domina</a></div></section>
  <footer><Brand compact/><p>Inteligência de desempenho para o domínio da OAB.</p><span>© 2026 Domina OAB</span></footer>
</main>}
