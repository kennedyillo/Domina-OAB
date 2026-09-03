"use client";

import { useEffect,useState } from "react";
import { CheckCircle2,LoaderCircle,WalletCards } from "lucide-react";

type Plan={id:string;slug:string;name:string;billing_type:string;duration_days:number;price_cents:number;max_installments:number;active:boolean};

export function AdminPlans(){
 const [plans,setPlans]=useState<Plan[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState("");
 async function load(){setLoading(true);setError("");try{const r=await fetch("/api/admin/plans",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error);setPlans(d.plans||[]);}catch(e){setError(e instanceof Error?e.message:"Erro ao carregar planos.");}finally{setLoading(false);}}
 useEffect(()=>{void load();},[]);
 function change(id:string,patch:Partial<Plan>){setPlans(items=>items.map(p=>p.id===id?{...p,...patch}:p));}
 async function save(plan:Plan){setBusy(plan.id);setError("");try{const r=await fetch("/api/admin/plans",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(plan)});const d=await r.json();if(!r.ok)throw new Error(d.error);await load();}catch(e){setError(e instanceof Error?e.message:"Erro ao atualizar plano.");}finally{setBusy(null);}}
 if(loading)return <div className="admin-empty"><LoaderCircle className="spin"/><p>Carregando planos...</p></div>;
 return <section className="admin-panel"><header><div><span><WalletCards/> PLANOS COMERCIAIS</span><h2>Mensal, 90 dias e anual</h2></div><small>REGRAS DE DURAÇÃO FIXAS</small></header>{error&&<p className="form-error">{error}</p>}<div style={{display:"grid",gap:12}}>{plans.map(plan=><article key={plan.id} style={{border:"1px solid #e2ddd3",padding:18,background:"#fff"}}><div style={{display:"grid",gridTemplateColumns:"1.2fr 160px 140px 120px auto",gap:12,alignItems:"end"}}><label><small>NOME</small><input value={plan.name} onChange={e=>change(plan.id,{name:e.target.value})}/></label><label><small>PREÇO (R$)</small><input type="number" min={0} step="0.01" value={(plan.price_cents/100).toFixed(2)} onChange={e=>change(plan.id,{price_cents:Math.round(Number(e.target.value)*100)})}/></label><label><small>PARCELAS</small><input type="number" min={1} max={12} disabled={plan.id==="domina-monthly"} value={plan.max_installments} onChange={e=>change(plan.id,{max_installments:Number(e.target.value)})}/></label><label><small>SITUAÇÃO</small><select value={plan.active?"active":"inactive"} onChange={e=>change(plan.id,{active:e.target.value==="active"})}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label><button className="button button-small" disabled={busy===plan.id} onClick={()=>void save(plan)}>{busy===plan.id?<LoaderCircle className="spin" size={15}/>:<CheckCircle2 size={15}/>}Salvar</button></div><p style={{margin:"10px 0 0",fontSize:11}}>{plan.billing_type==="recurring"?"Assinatura recorrente":"Pagamento único"} · {plan.duration_days} dias de acesso{plan.max_installments>1?` · até ${plan.max_installments}×`:""}</p></article>)}</div></section>;
}
