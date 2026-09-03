import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";
import { AdminFinancialAdjustmentForm } from "@/components/admin-financial-adjustment-form";

type Issue={kind:string;payment_id:string|null;external_id:string|null;payment_status:string|null;event_status:string|null};
type Reconciliation={totalPayments:number;totalEvents:number;issues:Issue[]};

export const dynamic="force-dynamic";

export default async function FinancialAdjustmentsPage(){
  await requireAdminUser("/admin/financeiro/ajustes");
  const data=await supabaseAdminRpc<Reconciliation>("admin_financial_reconciliation");
  const issues=data.issues??[];
  return <main className="admin-surface"><section className="admin-content" style={{maxWidth:1100,margin:"0 auto",padding:"32px 20px"}}>
    <div className="admin-title"><div><span className="eyebrow"><span/> Financeiro</span><h1>Conciliação e ajustes</h1><p>Compare registros internos com eventos do provedor e registre operações manuais com trilha de auditoria.</p></div><Link className="button button-small" href="/admin/financeiro">Voltar ao financeiro</Link></div>
    <div className="admin-kpis"><article><div><small>PAGAMENTOS COM ID EXTERNO</small><strong>{data.totalPayments??0}</strong><p>Registros internos conciliáveis</p></div></article><article><div><small>EVENTOS DO PROVEDOR</small><strong>{data.totalEvents??0}</strong><p>Recursos externos recebidos</p></div></article><article><div><small>DIVERGÊNCIAS</small><strong>{issues.length}</strong><p>{issues.length?"Requerem revisão":"Conciliação interna sem divergências"}</p></div></article></div>
    <article className="admin-panel" style={{marginTop:24}}><header><div><span>CONCILIAÇÃO</span><h2>Divergências encontradas</h2></div><small>INTERNO × EVENTOS</small></header>{issues.length?<div className="admin-table"><div className="admin-table-head"><span>Tipo</span><span>ID externo</span><span>Status</span></div>{issues.map((item,index)=><div className="admin-table-row" key={`${item.kind}-${index}`}><b>{item.kind}</b><span>{item.external_id??"-"}</span><small>{item.payment_status??item.event_status??"-"}</small></div>)}</div>:<p>Nenhuma divergência encontrada.</p>}</article>
    <AdminFinancialAdjustmentForm/>
  </section></main>;
}
