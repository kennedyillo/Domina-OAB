import { requireAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";

type StatusRow={count:number;amount:number};
type RevenuePlan={planId:string;planName:string;gross:number;net:number;payments:number};
type Receivable={date:string;amount:number;count:number};
type FinancialReport={days:number;statuses:Record<string,StatusRow>;revenueByPlan:RevenuePlan[];mrr:number;averageTicket:number;churnRate:number;delinquentCount:number;delinquentAmount:number;receivables:Receivable[]};

function cell(value:unknown){const s=String(value??"");return `"${s.replaceAll('"','""')}"`;}
function brl(cents:number){return ((Number(cents)||0)/100).toFixed(2).replace('.',',');}

export async function GET(request:Request){
 await requireAdminUser("/admin/financeiro.csv");
 const url=new URL(request.url);
 const days=Math.max(1,Math.min(365,Number(url.searchParams.get("days"))||30));
 const data=await supabaseAdminRpc<FinancialReport>("admin_financial_reporting",{p_days:days});
 const rows:string[][]=[
  ["Resumo","Período (dias)",String(data.days)],
  ["Resumo","MRR",brl(data.mrr)],
  ["Resumo","Ticket médio",brl(data.averageTicket)],
  ["Resumo","Churn (%)",String(data.churnRate)],
  ["Resumo","Inadimplência (quantidade)",String(data.delinquentCount)],
  ["Resumo","Inadimplência (valor)",brl(data.delinquentAmount)],
 ];
 for(const [status,row] of Object.entries(data.statuses??{})) rows.push(["Status",status,String(row.count),brl(row.amount)]);
 for(const row of data.revenueByPlan??[]) rows.push(["Plano",row.planName,String(row.payments),brl(row.gross),brl(row.net)]);
 for(const row of data.receivables??[]) rows.push(["Recebível",row.date,String(row.count),brl(row.amount)]);
 const csv="\ufeff"+rows.map(row=>row.map(cell).join(";")).join("\n");
 return new Response(csv,{headers:{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename="domina-oab-financeiro-${days}d.csv"`,`cache-control":"no-store"}});
}
