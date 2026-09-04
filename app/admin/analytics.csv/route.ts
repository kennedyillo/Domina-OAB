import { adminCan, getAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";

type Row={section:string;metric:string;dimension:string;value:string|number};
type QuestionRow={code:string;discipline:string;exam_edition:string|null;wrong_rate?:number;answers?:number;reports?:number;open_reports?:number;average_response_time_ms?:number;timed_answers?:number};
type Payload={
 periodDays:number;
 traffic:{pageViews:number;sessions:number;sources:{source:string;total:number}[]};
 financial:{approved:number;gross:number;net:number;pending:number;reversed:number};
 learning:{answers:number;correct:number;wrong:number;accuracy:number};
 questions:{mostWrong:QuestionRow[];mostReported:QuestionRow[];slowest:QuestionRow[]};
};

export async function GET(request:Request){
 const admin=await getAdminUser();
 if(!admin||!adminCan(admin.role,"analytics:view")) return Response.json({error:"Acesso negado."},{status:403});
 const url=new URL(request.url);
 const days=normalizeDays(url.searchParams.get("days"));
 const plan=clean(url.searchParams.get("plan"));
 const discipline=numberOrNull(url.searchParams.get("discipline"));
 const source=clean(url.searchParams.get("source"));
 const edition=clean(url.searchParams.get("edition"));
 const data=await supabaseAdminRpc<Payload>("admin_filtered_analytics",{p_days:days,p_plan_id:plan,p_discipline_id:discipline,p_source:source,p_exam_edition:edition});
 const rows:Row[]=[
  {section:"filtros",metric:"periodo_dias",dimension:"",value:days},
  {section:"filtros",metric:"plano",dimension:"",value:plan??"todos"},
  {section:"filtros",metric:"disciplina_id",dimension:"",value:discipline??"todas"},
  {section:"filtros",metric:"origem",dimension:"",value:source??"todas"},
  {section:"filtros",metric:"edicao_oab",dimension:"",value:edition??"todas"},
  {section:"trafego",metric:"visualizacoes",dimension:"",value:data.traffic.pageViews},
  {section:"trafego",metric:"sessoes",dimension:"",value:data.traffic.sessions},
  ...data.traffic.sources.map(item=>({section:"trafego",metric:"origem",dimension:item.source,value:item.total})),
  {section:"financeiro",metric:"pagamentos_aprovados",dimension:"",value:data.financial.approved},
  {section:"financeiro",metric:"receita_bruta_centavos",dimension:"",value:data.financial.gross},
  {section:"financeiro",metric:"receita_liquida_centavos",dimension:"",value:data.financial.net},
  {section:"financeiro",metric:"pendente_centavos",dimension:"",value:data.financial.pending},
  {section:"financeiro",metric:"revertidos",dimension:"",value:data.financial.reversed},
  {section:"aprendizagem",metric:"respostas",dimension:"",value:data.learning.answers},
  {section:"aprendizagem",metric:"corretas",dimension:"",value:data.learning.correct},
  {section:"aprendizagem",metric:"incorretas",dimension:"",value:data.learning.wrong},
  {section:"aprendizagem",metric:"acuracia_percentual",dimension:"",value:data.learning.accuracy},
  ...data.questions.mostWrong.map(item=>({section:"questoes",metric:"mais_erradas",dimension:questionDimension(item),value:`${item.wrong_rate??0}% (${item.answers??0} respostas)`})),
  ...data.questions.mostReported.map(item=>({section:"questoes",metric:"mais_reportadas",dimension:questionDimension(item),value:`${item.reports??0} reportes (${item.open_reports??0} abertos)`})),
  ...data.questions.slowest.map(item=>({section:"questoes",metric:"mais_demoradas",dimension:questionDimension(item),value:`${item.average_response_time_ms??0} ms (${item.timed_answers??0} respostas)`})),
 ];
 const lines=["secao,metrica,dimensao,valor",...rows.map(row=>[csv(row.section),csv(row.metric),csv(row.dimension),csv(row.value)].join(","))];
 return new Response(`\uFEFF${lines.join("\n")}`,{headers:{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename=domina-oab-analytics-${days}d.csv`,"cache-control":"no-store"}});
}

function questionDimension(item:QuestionRow){return [item.code,item.discipline,item.exam_edition].filter(Boolean).join(" · ")}
function csv(value:unknown){return `"${String(value??"").replaceAll('"','""')}"`}
function clean(v:string|null){const x=v?.trim();return x?x:null}
function numberOrNull(v:string|null){const n=Number(v);return Number.isInteger(n)&&n>0?n:null}
function normalizeDays(v:string|null){const n=Number(v);return [7,30,90,365].includes(n)?n:30}
