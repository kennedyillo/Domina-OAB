"use client";

import { useEffect,useState } from "react";
import { Activity,CheckCircle2,Gauge,LoaderCircle,Target,TrendingUp } from "lucide-react";

type Topic={discipline:string;topic:string|null;answers:number;correct:number;accuracy:number};
type Recent={id:number;name:string;started_at:string;completed_at:string|null;total_questions:number;correct_answers:number;score:number};
type Payload={summary:{completed:number;averageScore:number;bestScore:number;latestScore:number;previousScore:number;totalAnswers:number;totalCorrect:number};topics:Topic[];priorities:Topic[];strengths:Topic[];recent:Recent[]};

export function StudentDiagnostics(){
 const [data,setData]=useState<Payload|null>(null),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/account/diagnostics",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Erro ao carregar diagnóstico.");setData(d);}).catch(e=>setError(e instanceof Error?e.message:"Erro ao carregar diagnóstico."));},[]);
 if(error) return <p className="form-error">{error}</p>;
 if(!data) return <div className="admin-empty"><LoaderCircle className="spin"/><p>Calculando seu diagnóstico...</p></div>;
 const s=data.summary; const delta=s.completed>=2?s.latestScore-s.previousScore:0;
 return <div style={{display:"grid",gap:24}}>
  <div className="admin-kpis">
   <article><span><Gauge/></span><div><small>MÉDIA GERAL</small><strong>{s.averageScore}%</strong><p>{s.completed} simulados concluídos</p></div></article>
   <article><span><Target/></span><div><small>MELHOR RESULTADO</small><strong>{s.bestScore}%</strong><p>seu maior desempenho</p></div></article>
   <article><span><TrendingUp/></span><div><small>ÚLTIMO RESULTADO</small><strong>{s.latestScore}%</strong><p>{s.completed>=2?`${delta>=0?"+":""}${delta} p.p. vs anterior`:"primeira medição"}</p></div></article>
   <article><span><CheckCircle2/></span><div><small>ACERTOS</small><strong>{s.totalCorrect}</strong><p>de {s.totalAnswers} respostas</p></div></article>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
   <section className="admin-panel"><header><div><span><Target/> PRIORIDADES</span><h2>Onde concentrar estudo</h2></div></header>{data.priorities.length?data.priorities.map(t=><div key={`${t.discipline}-${t.topic}`} style={{padding:"12px 0",borderBottom:"1px solid #eee8df"}}><b>{t.topic||t.discipline}</b><small style={{display:"block"}}>{t.discipline} · {t.accuracy}% de acerto em {t.answers} respostas</small></div>):<div className="admin-empty"><p>Conclua mais simulados para gerar prioridades confiáveis.</p></div>}</section>
   <section className="admin-panel"><header><div><span><Activity/> PONTOS FORTES</span><h2>Temas mais dominados</h2></div></header>{data.strengths.length?data.strengths.map(t=><div key={`${t.discipline}-${t.topic}`} style={{padding:"12px 0",borderBottom:"1px solid #eee8df"}}><b>{t.topic||t.discipline}</b><small style={{display:"block"}}>{t.discipline} · {t.accuracy}% de acerto em {t.answers} respostas</small></div>):<div className="admin-empty"><p>Ainda não há dados suficientes.</p></div>}</section>
  </div>
  <section className="admin-panel"><header><div><span><Gauge/> POR TEMA</span><h2>Domínio detalhado</h2></div></header><div style={{display:"grid",gap:10}}>{data.topics.length?data.topics.map(t=><div key={`${t.discipline}-${t.topic}`}><div style={{display:"flex",justifyContent:"space-between",gap:16,fontSize:12}}><b>{t.topic||t.discipline}</b><span>{t.accuracy}% · {t.correct}/{t.answers}</span></div><div style={{height:8,background:"#eee8df",marginTop:6}}><div style={{height:"100%",width:`${Math.max(0,Math.min(100,t.accuracy))}%`,background:"currentColor"}}/></div></div>):<div className="admin-empty"><p>Seu desempenho por tema aparecerá após as primeiras tentativas salvas.</p></div>}</div></section>
  <section className="admin-panel"><header><div><span><Activity/> EVOLUÇÃO</span><h2>Histórico recente</h2></div></header><div style={{display:"grid",gap:8}}>{data.recent.length?data.recent.map(r=><div key={r.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:14,padding:"11px 0",borderBottom:"1px solid #eee8df",fontSize:12}}><span><b>{r.name}</b><small style={{display:"block"}}>{r.completed_at?new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(r.completed_at)):""}</small></span><span>{r.correct_answers}/{r.total_questions}</span><strong>{r.score}%</strong></div>):<div className="admin-empty"><p>Nenhum simulado concluído ainda.</p></div>}</div></section>
 </div>;
}
