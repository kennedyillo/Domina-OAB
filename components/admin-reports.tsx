"use client";

import { useEffect,useState } from "react";
import { CheckCircle2,Eye,Flag,History,LoaderCircle,UserCheck,XCircle } from "lucide-react";

type HistoryRow={action:string;from_status:string|null;to_status:string|null;priority:string|null;assigned_to_email:string|null;note:string|null;actor_email:string|null;created_at:string};
type Report={id:number;question_id:number;code:string;statement:string;discipline:string;topic:string|null;reason:string;message:string|null;status:"open"|"reviewing"|"resolved"|"dismissed";priority:"low"|"normal"|"high"|"critical";assigned_to_email:string|null;resolution_note:string|null;created_at:string;reviewed_at:string|null;resolved_at:string|null;reporter_email:string|null;history:HistoryRow[]};

export function AdminReports(){
 const [items,setItems]=useState<Report[]>([]),[status,setStatus]=useState("open"),[loading,setLoading]=useState(true),[busy,setBusy]=useState<number|null>(null),[error,setError]=useState("");
 async function load(next=status){setLoading(true);setError("");try{const r=await fetch(`/api/admin/reports?status=${encodeURIComponent(next)}`,{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error);setItems(d.reports||[]);}catch(e){setError(e instanceof Error?e.message:"Erro ao carregar reportes.");}finally{setLoading(false);}}
 useEffect(()=>{void load("open");},[]);
 async function patch(id:number,body:Record<string,unknown>){setBusy(id);setError("");try{const r=await fetch("/api/admin/reports",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,...body})});const d=await r.json();if(!r.ok)throw new Error(d.error);await load();}catch(e){setError(e instanceof Error?e.message:"Erro ao atualizar reporte.");}finally{setBusy(null);}}
 async function act(id:number,next:"reviewing"|"resolved"|"dismissed"){const note=next==="reviewing"?"":window.prompt(next==="resolved"?"Descreva a correção realizada:":"Motivo para descartar o reporte:","")||"";await patch(id,{status:next,note});}
 return <section className="admin-panel"><header><div><span><Flag/> QUALIDADE</span><h2>Reportes de questões</h2></div><small>{items.length} RESULTADOS</small></header>
  <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>{[["open","Abertos"],["reviewing","Em revisão"],["resolved","Resolvidos"],["dismissed","Descartados"]].map(([value,label])=><button key={value} className={status===value?"button button-small":""} onClick={()=>{setStatus(value);void load(value);}}>{label}</button>)}</div>
  {error&&<p className="form-error">{error}</p>}{loading?<div className="admin-empty"><p>Carregando reportes...</p></div>:items.length===0?<div className="admin-empty"><p>Nenhum reporte nesta situação.</p></div>:<div style={{display:"grid",gap:12}}>{items.map(r=><article key={r.id} style={{border:"1px solid #e2ddd3",padding:18}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:18}}><div><small>{r.code} · {r.discipline} · {r.topic||"Sem tema"}</small><h3 style={{margin:"6px 0"}}>{r.statement}</h3><p style={{margin:"8px 0",fontSize:12}}><b>Motivo:</b> {reasonLabel(r.reason)}{r.message?` · ${r.message}`:""}</p><p style={{margin:"0 0 5px",fontSize:11}}>Enviado em {new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(r.created_at))}{r.reporter_email?` · ${r.reporter_email}`:" · visitante"}</p><p style={{margin:0,fontSize:11}}><b>Prioridade:</b> {priorityLabel(r.priority)} · <b>Responsável:</b> {r.assigned_to_email||"não atribuído"}</p>{r.resolution_note&&<p style={{margin:"8px 0 0",fontSize:12}}><b>Resolução:</b> {r.resolution_note}</p>}</div><span className={`payment-status ${r.status}`}>{statusLabel(r.status)}</span></div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14,paddingTop:12,borderTop:"1px solid #eee8df"}}>
      {r.status==="open"&&<button disabled={busy===r.id} onClick={()=>void act(r.id,"reviewing")}><Eye size={15}/> Revisar</button>}
      {r.status!=="resolved"&&r.status!=="dismissed"&&<><button disabled={busy===r.id} onClick={()=>void act(r.id,"resolved")}><CheckCircle2 size={15}/> Resolver</button><button disabled={busy===r.id} onClick={()=>void act(r.id,"dismissed")}><XCircle size={15}/> Descartar</button></>}
      <select value={r.priority} disabled={busy===r.id} onChange={e=>void patch(r.id,{priority:e.target.value})}><option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option><option value="critical">Crítica</option></select>
      <button disabled={busy===r.id} onClick={()=>{const email=window.prompt("E-mail do responsável pelo reporte:",r.assigned_to_email||"portaldominaoab@gmail.com");if(email!==null)void patch(r.id,{assigned_to_email:email});}}><UserCheck size={15}/> Atribuir</button>
      {busy===r.id&&<LoaderCircle className="spin" size={16}/>} 
    </div>
    {r.history?.length>0&&<details style={{marginTop:12}}><summary style={{cursor:"pointer",fontSize:12,fontWeight:700}}><History size={14} style={{verticalAlign:"middle",marginRight:6}}/>Histórico ({r.history.length})</summary><div style={{display:"grid",gap:6,marginTop:8}}>{r.history.map((h,index)=><p key={`${r.id}-${index}`} style={{margin:0,fontSize:11,color:"#5d6570"}}>{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(h.created_at))} · {historyLabel(h.action)}{h.actor_email?` · ${h.actor_email}`:""}{h.note?` · ${h.note}`:""}</p>)}</div></details>}
  </article>)}</div>}
 </section>;
}
function reasonLabel(v:string){return ({gabarito:"Gabarito possivelmente incorreto",enunciado:"Problema no enunciado",explicacao:"Problema na explicação",desatualizada:"Conteúdo desatualizado",duplicada:"Questão duplicada",outro:"Outro"} as Record<string,string>)[v]||v;}
function statusLabel(v:string){return ({open:"Aberto",reviewing:"Em revisão",resolved:"Resolvido",dismissed:"Descartado"} as Record<string,string>)[v]||v;}
function priorityLabel(v:string){return ({low:"Baixa",normal:"Normal",high:"Alta",critical:"Crítica"} as Record<string,string>)[v]||v;}
function historyLabel(v:string){return ({status_changed:"Status alterado",priority_changed:"Prioridade alterada",assignment_changed:"Responsável alterado",note_updated:"Observação atualizada"} as Record<string,string>)[v]||v;}
