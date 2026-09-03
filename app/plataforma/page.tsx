import { AppHeader } from "@/components/app-header";
import { AlertTriangle, ArrowRight, BarChart3, BookOpenCheck, BrainCircuit, CalendarDays, CheckCircle2, Clock3, Eye, Lightbulb, Radar, ShieldCheck, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

const disciplines = [
  {name:"Ética Profissional",score:72,correct:"6/8",tone:"good",gain:"+2"},
  {name:"Direito Constitucional",score:67,correct:"4/6",tone:"good",gain:"+1"},
  {name:"Direito Civil",score:50,correct:"3/6",tone:"medium",gain:"+2"},
  {name:"Processo Civil",score:33,correct:"2/6",tone:"critical",gain:"+3"},
  {name:"Direito Penal",score:50,correct:"3/6",tone:"medium",gain:"+2"},
  {name:"Processo Penal",score:33,correct:"2/6",tone:"critical",gain:"+3"},
  {name:"Direito Administrativo",score:40,correct:"2/5",tone:"critical",gain:"+2"},
  {name:"Direito Tributário",score:60,correct:"3/5",tone:"medium",gain:"+1"},
];

const themes = [
  {name:"Princípios fundamentais",value:82,state:"Consolidado",tone:"good"},
  {name:"Direitos do advogado",value:70,state:"Bom domínio",tone:"good"},
  {name:"Honorários advocatícios",value:58,state:"Em evolução",tone:"medium"},
  {name:"Publicidade profissional",value:46,state:"Atenção",tone:"critical"},
  {name:"Infrações e sanções",value:35,state:"Prioridade",tone:"critical"},
];

const errorPatterns = [
  {label:"Lacuna de conteúdo",value:44,copy:"Você não reconheceu a regra jurídica necessária."},
  {label:"Interpretação",value:31,copy:"A regra era conhecida, mas o caso foi interpretado incorretamente."},
  {label:"Atenção",value:19,copy:"Termos como “exceto” e “incorreta” alteraram a resposta."},
  {label:"Gestão de tempo",value:6,copy:"Resposta acelerada nos minutos finais do simulado."},
];

const plan = [
  {day:"Hoje",title:"Infrações e sanções",meta:"12 questões · 24 min",type:"Prioridade máxima"},
  {day:"Amanhã",title:"Processo Civil: recursos",meta:"10 questões · 22 min",type:"Recuperar pontos"},
  {day:"Quarta",title:"Revisão do caderno de erros",meta:"8 questões · 18 min",type:"Consolidação"},
  {day:"Sexta",title:"Simulado dirigido",meta:"20 questões · 48 min",type:"Validar evolução"},
];

export default function Plataforma(){return <main className="app-surface"><AppHeader active="inicio"/><div className="app-container diagnosis-demo">
  <section className="demo-disclaimer"><div><Eye size={18}/><span><b>Demonstração fictícia</b> Os dados abaixo exemplificam o diagnóstico entregue aos assinantes. Eles não representam o seu desempenho.</span></div><Link href="/simulado">Fazer um simulado gratuito <ArrowRight size={15}/></Link></section>

  <section className="workspace-intro diagnosis-title"><div><span className="eyebrow"><span/> 47º exame · 1ª fase</span><h1>Diagnóstico de desempenho</h1><p>Perfil demonstrativo · Simulado completo de 80 questões · 31 de agosto de 2026</p></div><div className="report-status"><ShieldCheck/><div><strong>Análise concluída</strong><span>80 respostas processadas</span></div></div></section>

  <section className="diagnosis-overview">
    <article className="main-score-card"><div className="score-context"><small>RESULTADO DO SIMULADO</small><div><strong>34</strong><span>/80</span></div><p>42,5% de aproveitamento</p></div><div className="approval-distance"><div><span>34 acertos</span><b>42,5%</b><small>aproveitamento</small></div><i><em/><b/></i><p>O próximo ciclo deve se concentrar nos temas com <strong>maior potencial de evolução</strong>.</p></div></article>
    <article className="readiness-card"><small>ÍNDICE DE PRONTIDÃO</small><div className="readiness-ring"><strong style={{color:"var(--do-panel)"}}>63</strong><span>/100</span></div><h2>Preparação intermediária</h2><p>O desempenho já indica uma base aproveitável, mas ainda há oscilações em disciplinas estratégicas.</p></article>
    <article className="evolution-card"><div><TrendingUp/><span><small>EVOLUÇÃO</small><strong>+5 pontos</strong></span></div><div className="mini-evolution"><i style={{height:"26%"}}/><i style={{height:"39%"}}/><i style={{height:"48%"}}/><i style={{height:"62%"}}/><i style={{height:"78%"}}/></div><p>Comparado aos últimos três simulados.</p></article>
    <article className="time-card"><div><Clock3/><span><small>TEMPO TOTAL</small><strong>3h 42min</strong></span></div><div><span><b>2m 46s</b><small>por questão</small></span><span><b>7</b><small>alteradas</small></span><span><b>3</b><small>em branco</small></span></div><p>Ritmo adequado, com perda de precisão nos 25 minutos finais.</p></article>
  </section>

  <section className="diagnosis-grid">
    <article className="diagnosis-panel discipline-panel"><header><div><span className="panel-kicker"><BarChart3/> DESEMPENHO POR DISCIPLINA</span><h2>Onde os pontos foram ganhos e perdidos</h2></div><span>8 de 20 disciplinas exibidas</span></header><div className="diagnosis-table"><div className="table-head"><span>Disciplina</span><span>Domínio</span><span>Acertos</span><span>Potencial</span></div>{disciplines.map(item=><div className="table-row" key={item.name}><b>{item.name}</b><div><i><em className={item.tone} style={{width:`${item.score}%`}}/></i><span>{item.score}%</span></div><small>{item.correct}</small><strong>{item.gain} pts</strong></div>)}</div><footer><AlertTriangle size={16}/><p><b>Maior risco:</b> Processo Civil e Processo Penal concentram 6 pontos recuperáveis.</p></footer></article>

    <aside className="diagnosis-sidebar"><article className="opportunity-card"><span><Target/></span><small>MAIOR POTENCIAL DE GANHO</small><h2>Processo Civil</h2><strong>até +3 pontos</strong><p>Baixo domínio atual, peso relevante e erros concentrados em dois temas corrigíveis.</p><Link href="/simulado">Praticar tema recomendado <ArrowRight size={15}/></Link></article><article className="strength-card"><span className="panel-kicker"><CheckCircle2/> PONTO FORTE</span><h2>Ética Profissional</h2><div><strong>72%</strong><span>6 de 8 acertos</span></div><p>Bom desempenho geral. A revisão deve se concentrar em infrações e sanções.</p></article><article className="risk-card"><span className="panel-kicker"><AlertTriangle/> ALERTA DE CONSISTÊNCIA</span><h2>Queda no fim da prova</h2><p>A taxa de acerto caiu de 48% para 29% nas últimas 20 questões. O padrão sugere fadiga e aceleração.</p></article></aside>
  </section>

  <section className="diagnosis-row">
    <article className="diagnosis-panel theme-panel"><header><div><span className="panel-kicker"><Radar/> DIAGNÓSTICO POR TEMA</span><h2>Ética Profissional em profundidade</h2></div><span>Exemplo de uma disciplina</span></header><div className="theme-list">{themes.map(item=><div key={item.name}><div><b>{item.name}</b><span className={item.tone}>{item.state}</span></div><i><em className={item.tone} style={{width:`${item.value}%`}}/></i><strong>{item.value}%</strong></div>)}</div><footer><Lightbulb/><p><b>Leitura do diagnóstico:</b> o resultado geral é bom, mas a concentração de erros em infrações e sanções pode custar duas questões na prova.</p></footer></article>
    <article className="diagnosis-panel pattern-panel"><header><div><span className="panel-kicker"><BrainCircuit/> PADRÕES DE ERRO</span><h2>Por que as respostas foram perdidas</h2></div></header><div>{errorPatterns.map(item=><div className="pattern-row" key={item.label}><strong>{item.value}%</strong><span><b>{item.label}</b><small>{item.copy}</small></span></div>)}</div></article>
  </section>

  <section className="diagnosis-row lower">
    <article className="diagnosis-panel action-plan"><header><div><span className="panel-kicker"><CalendarDays/> PLANO RECOMENDADO</span><h2>Próximas ações com maior impacto</h2></div><span>7 dias</span></header><div>{plan.map((item,index)=><div className="plan-row" key={item.day}><span>{String(index+1).padStart(2,"0")}</span><div><small>{item.day}</small><b>{item.title}</b></div><p>{item.meta}</p><em>{item.type}</em></div>)}</div></article>
    <article className="diagnosis-panel projection-panel"><header><div><span className="panel-kicker"><TrendingUp/> PROJEÇÃO</span><h2>Como a nota pode evoluir</h2></div></header><div className="projection-number"><span>34</span><ArrowRight/><strong>42–45</strong></div><p>Faixa estimada se o aluno recuperar os temas prioritários e mantiver o desempenho atual nos pontos fortes.</p><div className="projection-factors"><span><CheckCircle2/> +3 Processo Civil</span><span><CheckCircle2/> +2 Processo Penal</span><span><CheckCircle2/> +2 Ética</span><span><CheckCircle2/> +1 Gestão de prova</span></div><small>Projeção orientativa, não constitui garantia de resultado.</small></article>
  </section>

  <section className="diagnosis-coverage"><div><BookOpenCheck/><span><small>O DIAGNÓSTICO TAMBÉM INCLUI</small><b>Caderno de erros, histórico de tentativas, comparativo entre exames, questões recomendadas e atualização do plano a cada nova sessão.</b></span></div><Link className="button" href="/#planos">Conhecer o Plano Domina <ArrowRight size={17}/></Link></section>
</div></main>}
