import { requireAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";
import { ArrowLeft, Download, ReceiptText, TrendingDown, WalletCards } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type StatusRow={count:number;amount:number};
type RevenuePlan={planId:string;planName:string;gross:number;net:number;payments:number};
type Receivable={date:string;amount:number;count:number};
type FinancialReport={days:number;statuses:Record<string,StatusRow>;revenueByPlan:RevenuePlan[];mrr:number;averageTicket:number;churnRate:number;delinquentCount:number;delinquentAmount:number;receivables:Receivable[]};

function money(cents:number){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format((Number(cents)||0)/100);}

export default async function FinanceiroPage({searchParams}:{searchParams:Promise<{days?:string}>}){
  await requireAdminUser("/admin/financeiro");
  const params=await searchParams;
  const days=Math.max(1,Math.min(365,Number(params.days)||30));
  const data=await supabaseAdminRpc<FinancialReport>("admin_financial_reporting",{p_days:days});
  const statuses=Object.entries(data.statuses??{});
  return <main className="admin-surface"><div className="admin-content" style={{maxWidth:1200,margin:"0 auto"}}>
    <div className="admin-title"><div><span className="eyebrow"><span/> FINANCEIRO</span><h1>Relatório financeiro</h1><p>Visão consolidada de cobranças, receita, assinaturas e recebíveis.</p></div><Link href="/admin"><ArrowLeft size={16}/>Voltar ao admin</Link></div>
    <form style={{display:"flex",gap:10,alignItems:"end",marginBottom:22}}><label><small>PERÍODO</small><select name="days" defaultValue={String(days)} style={{display:"block",padding:10,marginTop:6}}><option value="7">7 dias</option><option value="30">30 dias</option><option value="90">90 dias</option><option value="365">365 dias</option></select></label><button className="button button-small" type="submit">Aplicar</button><a className="button button-small" href={`/admin/financeiro.csv?days=${days}`}><Download size={15}/>Exportar CSV</a></form>
    <div className="finance-kpis"><article><small>MRR</small><strong>{money(data.mrr)}</strong><p>Receita recorrente mensal ativa</p></article><article><small>TICKET MÉDIO</small><strong>{money(data.averageTicket)}</strong><p>Pagamentos aprovados no período</p></article><article><small>CHURN</small><strong>{Number(data.churnRate||0)}%</strong><p>Cancelamentos sobre base inicial</p></article><article><small>INADIMPLÊNCIA</small><strong>{money(data.delinquentAmount)}</strong><p>{data.delinquentCount||0} cobrança(s) pendente(s) &gt; 72h</p></article></div>
    <div className="admin-primary-grid" style={{marginTop:24}}><article className="admin-panel"><header><div><span><ReceiptText/> STATUS</span><h2>Cobranças por situação</h2></div><small>{days} DIAS</small></header>{statuses.length?<div className="payment-list">{statuses.map(([status,row])=><div key={status}><b>{status}</b><span>{row.count} transação(ões)</span><strong>{money(row.amount)}</strong></div>)}</div>:<p>Nenhuma cobrança registrada no período.</p>}</article><article className="admin-panel"><header><div><span><WalletCards/> RECEITA</span><h2>Receita por plano</h2></div></header>{data.revenueByPlan?.length?<div className="payment-list">{data.revenueByPlan.map(row=><div key={row.planId}><b>{row.planName}</b><span>{row.payments} pagamento(s)</span><strong>{money(row.net)} líquido</strong></div>)}</div>:<p>Nenhuma receita aprovada no período.</p>}</article></div>
    <article className="admin-panel" style={{marginTop:24}}><header><div><span><TrendingDown/> RECEBÍVEIS</span><h2>Agenda futura</h2></div></header>{data.receivables?.length?<div className="payment-list">{data.receivables.map(row=><div key={row.date}><b>{new Intl.DateTimeFormat("pt-BR").format(new Date(`${row.date}T12:00:00Z`))}</b><span>{row.count} crédito(s)</span><strong>{money(row.amount)}</strong></div>)}</div>:<p>Nenhum recebível futuro registrado.</p>}</article>
  </div></main>;
}
