"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, LoaderCircle, Mail, ShieldCheck, Users } from "lucide-react";

type Pref = { user_id:string; email:string; marketing_opt_in:boolean; study_reminders:boolean; transactional_enabled:boolean; opt_in_source:string|null; consent_version:string|null; unsubscribed_at:string|null; updated_at:string; full_name:string|null; phone:string|null };
type EventRow = { id:number; email:string; event_type:string; provider:string; campaign_key:string|null; created_at:string };
type Payload = { totals:{users:number;marketingOptIn:number;studyReminders:number;unsubscribed:number}; users:Pref[]; events:EventRow[] };

export function AdminCommunications(){
  const [data,setData]=useState<Payload|null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState<string|null>(null);
  const [error,setError]=useState("");

  async function load(){
    setLoading(true); setError("");
    try{
      const r=await fetch("/api/admin/communications",{cache:"no-store"});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Falha ao carregar comunicações."); setData(j);
    }catch(e){setError(e instanceof Error?e.message:"Falha ao carregar comunicações.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);

  async function save(row:Pref,field:"marketing_opt_in"|"study_reminders",value:boolean){
    setBusy(`${row.user_id}:${field}`); setError("");
    try{
      const r=await fetch("/api/admin/communications",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({user_id:row.user_id,marketing_opt_in:field==="marketing_opt_in"?value:row.marketing_opt_in,study_reminders:field==="study_reminders"?value:row.study_reminders})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Falha ao salvar preferência."); await load();
    }catch(e){setError(e instanceof Error?e.message:"Falha ao salvar preferência.");}
    finally{setBusy(null);}
  }

  if(loading&&!data) return <div className="admin-empty"><p>Carregando comunicações...</p></div>;
  if(!data) return <p className="form-error">{error||"Não foi possível carregar os dados."}</p>;

  return <>
    <div className="admin-kpis">
      <article><span><Users/></span><div><small>PREFERÊNCIAS</small><strong>{data.totals.users}</strong><p>usuários cadastrados</p></div></article>
      <article><span><Mail/></span><div><small>MARKETING</small><strong>{data.totals.marketingOptIn}</strong><p>opt-ins ativos</p></div></article>
      <article><span><BellRing/></span><div><small>LEMBRETES</small><strong>{data.totals.studyReminders}</strong><p>lembretes de estudo</p></div></article>
      <article><span><ShieldCheck/></span><div><small>DESCADASTRADOS</small><strong>{data.totals.unsubscribed}</strong><p>opt-out registrado</p></div></article>
    </div>
    {error&&<p className="form-error">{error}</p>}
    <section className="admin-panel" style={{marginTop:24}}>
      <header><div><span><Mail/> PREFERÊNCIAS</span><h2>Usuários e consentimentos</h2></div><small>BREVO · PREPARAÇÃO</small></header>
      <div style={{display:"grid",gap:10}}>{data.users.length?data.users.map(row=><article key={row.user_id} style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr",gap:20,padding:16,border:"1px solid #e2ddd3",background:"#fff"}}>
        <div><b>{row.full_name||"Sem nome"}</b><p style={{margin:"4px 0 0",fontSize:12}}>{row.email}</p><small>{row.phone||"Sem telefone"}</small></div>
        <label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={row.marketing_opt_in} disabled={Boolean(busy)} onChange={e=>void save(row,"marketing_opt_in",e.target.checked)}/>Marketing e novidades</label>
        <label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={row.study_reminders} disabled={Boolean(busy)} onChange={e=>void save(row,"study_reminders",e.target.checked)}/>{busy?.startsWith(row.user_id)?<LoaderCircle className="spin" size={15}/>:<CheckCircle2 size={15}/>}Lembretes de estudo</label>
      </article>):<div className="admin-empty"><p>Nenhuma preferência registrada ainda.</p></div>}</div>
    </section>
    <section className="admin-panel" style={{marginTop:24}}>
      <header><div><span><BellRing/> HISTÓRICO</span><h2>Eventos de comunicação</h2></div><small>ÚLTIMOS 50</small></header>
      <div style={{display:"grid",gap:8}}>{data.events.length?data.events.map(ev=><div key={ev.id} style={{display:"grid",gridTemplateColumns:"1.4fr .8fr .8fr 1fr",gap:12,padding:"10px 0",borderBottom:"1px solid #eee8df",fontSize:12}}><b>{ev.email}</b><span>{ev.event_type}</span><span>{ev.provider}</span><span>{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(ev.created_at))}</span></div>):<div className="admin-empty"><p>Nenhum envio registrado ainda.</p></div>}</div>
    </section>
  </>;
}
