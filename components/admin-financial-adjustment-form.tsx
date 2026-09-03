"use client";

import { useState } from "react";

export function AdminFinancialAdjustmentForm(){
  const [type,setType]=useState("refund");
  const [paymentId,setPaymentId]=useState("");
  const [amount,setAmount]=useState("");
  const [reason,setReason]=useState("");
  const [state,setState]=useState<"idle"|"saving"|"success"|"error">("idle");
  const [message,setMessage]=useState("");

  async function submit(event:React.FormEvent){
    event.preventDefault();
    setState("saving");setMessage("");
    const cents=Math.round(Number(amount.replace(",","."))*100);
    try{
      const response=await fetch("/api/admin/finance-adjustments",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({payment_id:paymentId?Number(paymentId):null,adjustment_type:type,amount_cents:cents,reason})
      });
      const data=await response.json() as {error?:string;id?:number};
      if(!response.ok) throw new Error(data.error||"Falha ao registrar ajuste.");
      setState("success");setMessage(`Ajuste #${data.id} registrado e auditado.`);setPaymentId("");setAmount("");setReason("");
    }catch(e){setState("error");setMessage(e instanceof Error?e.message:"Falha ao registrar ajuste.");}
  }

  return <form onSubmit={submit} className="admin-panel" style={{marginTop:24}}>
    <header><div><span>OPERAÇÃO MANUAL</span><h2>Registrar ajuste financeiro</h2></div><small>AUDITADO</small></header>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
      <label>Tipo<select value={type} onChange={e=>setType(e.target.value)}><option value="refund">Reembolso</option><option value="reversal">Estorno</option><option value="chargeback">Chargeback</option><option value="manual_adjustment">Ajuste manual</option></select></label>
      <label>ID do pagamento (opcional)<input inputMode="numeric" value={paymentId} onChange={e=>setPaymentId(e.target.value)} /></label>
      <label>Valor (R$)<input inputMode="decimal" required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0,00" /></label>
    </div>
    <label style={{display:"grid",gap:6,marginTop:12}}>Motivo<textarea required minLength={3} rows={3} value={reason} onChange={e=>setReason(e.target.value)} /></label>
    <div style={{display:"flex",alignItems:"center",gap:12,marginTop:14}}><button className="button button-small" disabled={state==="saving"}>{state==="saving"?"Registrando...":"Registrar ajuste"}</button>{message&&<small role="status">{message}</small>}</div>
  </form>;
}
