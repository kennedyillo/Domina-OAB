import { AppHeader } from "@/components/app-header";
import { ArrowRight, BookOpenCheck, ChevronRight, CircleCheck, LockKeyhole, Target } from "lucide-react";

const subjects=[
  ["Ética Profissional",8,"10 temas","available",72],
  ["Direito Constitucional",6,"12 temas","priority",58],
  ["Direito Civil",6,"16 temas","planned",42],
  ["Processo Civil",6,"14 temas","planned",0],
  ["Direito Penal",6,"13 temas","planned",38],
  ["Processo Penal",6,"12 temas","planned",0],
  ["Direito Administrativo",5,"11 temas","planned",45],
  ["Direito Tributário",5,"10 temas","planned",28],
  ["Direito do Trabalho",5,"12 temas","planned",0],
  ["Processo do Trabalho",5,"10 temas","planned",0],
  ["Direito Empresarial",4,"10 temas","planned",26],
  ["Direitos Humanos",2,"7 temas","planned",0],
  ["Direito Internacional",2,"7 temas","planned",0],
  ["Direito Ambiental",2,"7 temas","planned",0],
  ["Direito do Consumidor",2,"6 temas","planned",0],
  ["ECA",2,"6 temas","planned",0],
  ["Filosofia do Direito",2,"6 temas","planned",0],
  ["Direito Previdenciário",2,"7 temas","planned",0],
  ["Direito Financeiro",2,"6 temas","planned",0],
  ["Direito Eleitoral",2,"6 temas","planned",0],
] as const;

const groups=[
  {title:"Alta incidência",caption:"Disciplinas que concentram maior número de questões",range:[0,6]},
  {title:"Peso estratégico",caption:"Matérias de cinco e quatro questões",range:[6,11]},
  {title:"Cobertura complementar",caption:"Disciplinas menores que podem decidir a aprovação",range:[11,20]},
];

export default function Disciplinas(){return <main className="app-surface"><AppHeader active="disciplinas"/><div className="app-container">
  <section className="catalog-intro"><div><span className="eyebrow"><span/> 47º exame · 1ª fase</span><h1>Mapa das disciplinas</h1><p>Veja o peso de cada matéria e onde seu estudo pode produzir mais pontos.</p></div><div className="catalog-kpis"><div><strong>20</strong><span>disciplinas</span></div><div><strong>80</strong><span>questões</span></div><div><strong>40</strong><span>para passar</span></div></div></section>

  <section className="priority-banner"><div><span><Target size={18}/></span><div><small>PRIORIDADE RECOMENDADA AGORA</small><h2>Ética Profissional</h2><p>Maior peso da prova e potencial estimado de +6 a 8 pontos.</p></div></div><a className="button" href="/simulado">Continuar diagnóstico <ArrowRight size={17}/></a></section>

  <div className="discipline-groups">{groups.map(group=><section className="discipline-group" key={group.title}><header><div><h2>{group.title}</h2><p>{group.caption}</p></div><span>{group.range[1]-group.range[0]} disciplinas</span></header><div className="discipline-list">{subjects.slice(group.range[0],group.range[1]).map(([name,count,themes,status,progress],index)=><article className={`discipline-row ${status}`} style={{background:"var(--do-panel)"}} key={name}><span className="discipline-number">{String(group.range[0]+index+1).padStart(2,"0")}</span><div className="discipline-name"><h3>{name}</h3><small>{themes}</small></div><div className="discipline-weight"><strong>{count}</strong><span>questões</span></div><div className="discipline-progress">{progress>0?<><div><span>Seu domínio</span><b>{progress}%</b></div><i><em style={{width:`${progress}%`}}/></i></>:<span className="not-measured">Ainda não diagnosticado</span>}</div><div className="discipline-state">{status==="available"?<><CircleCheck size={16}/><span>Disponível</span></>:status==="priority"?<><BookOpenCheck size={16}/><span>Próxima prioridade</span></>:<><LockKeyhole size={15}/><span>Planejada</span></>}</div>{status==="available"?<a href="/simulado" aria-label={`Abrir ${name}`}><ChevronRight size={19}/></a>:<span className="row-end"><ChevronRight size={19}/></span>}</article>)}</div></section>)}</div>
</div></main>}
