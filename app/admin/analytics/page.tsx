import { Brand } from "@/components/app-header";
import { requireAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";
import { ArrowDownToLine, ArrowLeft, BarChart3, BookOpenCheck, Filter, GraduationCap, LogOut, MousePointerClick, WalletCards } from "lucide-react";
import Link from "next/link";

export const dynamic="force-dynamic";

type Option={id:string|number;name:string};
type SourceRow={source:string;total:number};
type QuestionRow={id:number;code:string;statement:string;discipline:string;exam_edition:string|null;answers?:number;wrong_answers?:number;wrong_rate?:number;reports?:number;open_reports?:number;timed_answers?:number;average_response_time_ms?:number};
type AnalyticsPayload={
 periodDays:number;
 traffic:{pageViews:number;sessions:number;sources:SourceRow[]};
 financial:{approved:number;gross:number;net:number;pending:number;reversed:number};
 learning:{answers:number;correct:number;wrong:number;accuracy:number};
 questions:{mostWrong:QuestionRow[];mostReported:QuestionRow[];slowest:QuestionRow[]};
 options:{plans:Option[];disciplines:Option[];sources:string[];editions:string[]};
};
type SearchParams=Promise<Record<string,string|string[]|undefined>>;

export default async function AdminAnalyticsPage({searchParams}:{searchParams:SearchParams}){
 const user=await requireAdminUser("/admin/analytics");
 const raw=await searchParams;
 const days=normalizeDays(value(raw.days));
 const plan=clean(value(raw.plan));
 const discipline=numberOrNull(value(raw.discipline));
 const source=clean(value(raw.source));
 const edition=clean(value(raw.edition));
 const data=await supabaseAdminRpc<AnalyticsPayload>("admin_filtered_analytics",{
   p_days:days,p_plan_id:plan,p_discipline_id:discipline,p_source:source,p_exam_edition:edition,
 });
 const exportQuery=queryString({days:String(days),plan:plan??"",discipline:discipline?String(discipline):"",source:source??"",edition:edition??""});

 return <main className="admin-surface">
  <header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/api/auth/logout"><LogOut size={15}/>Sair</a></div></header>
  <div className="admin-shell">
   <aside className="admin-sidebar"><nav aria-label="Navegação administrativa"><Link href="/admin"><ArrowLeft/>Visão geral</Link><Link className="active" href="/admin/analytics"><BarChart3/>Analytics</Link><Link href="/admin/analytics/questoes"><BookOpenCheck/>Qualidade das questões</Link></nav><div className="admin-account"><span>KP</span><div><b>{user.fullName??"Kennedy Pereira"}</b><small>PROPRIETÁRIO</small></div></div></aside>
   <section className="admin-content">
    <div className="admin-title"><div><span className="eyebrow"><span/> Inteligência operacional</span><h1>Analytics filtrável</h1><p>Tráfego, financeiro, aprendizagem e qualidade do banco com o mesmo recorte de análise.</p></div><a className="button button-small" href={`/admin/analytics.csv?${exportQuery}`}><ArrowDownToLine size={16}/>Exportar CSV</a></div>

    <form method="GET" className="admin-panel" style={{marginBottom:24}}>
     <header><div><span><Filter/> FILTROS</span><h2>Recorte da análise</h2></div><small>APLICAÇÃO NO SERVIDOR</small></header>
     <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12}}>
      <label><small>PERÍODO</small><select name="days" defaultValue={String(days)}><option value="7">7 dias</option><option value="30">30 dias</option><option value="90">90 dias</option><option value="365">12 meses</option></select></label>
      <label><small>PLANO</small><select name="plan" defaultValue={plan??""}><option value="">Todos os planos</option>{data.options.plans.map(item=><option key={item.id} value={String(item.id)}>{item.name}</option>)}</select></label>
      <label><small>DISCIPLINA</small><select name="discipline" defaultValue={discipline?String(discipline):""}><option value="">Todas as disciplinas</option>{data.options.disciplines.map(item=><option key={item.id} value={String(item.id)}>{item.name}</option>)}</select></label>
      <label><small>ORIGEM</small><select name="source" defaultValue={source??""}><option value="">Todas as origens</option>{data.options.sources.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
      <label><small>EDIÇÃO OAB</small><select name="edition" defaultValue={edition??""}><option value="">Todas as edições</option>{data.options.editions.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
     </div>
     <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}><button className="button button-small" type="submit"><Filter size={15}/>Aplicar filtros</button><Link href="/admin/analytics">Limpar filtros</Link></div>
     {data.options.editions.length===0&&<p style={{margin:"14px 0 0",fontSize:12}}>O filtro por edição já está habilitado. As opções aparecerão conforme as questões forem classificadas com a edição da OAB.</p>}
    </form>

    <div className="admin-kpis">
     <article><span><MousePointerClick/></span><div><small>VISUALIZAÇÕES</small><strong>{data.traffic.pageViews}</strong><p>{data.traffic.sessions} sessões no período</p></div></article>
     <article><span><WalletCards/></span><div><small>RECEITA BRUTA</small><strong>{money(data.financial.gross)}</strong><p>{data.financial.approved} pagamento(s) aprovado(s)</p></div></article>
     <article><span><WalletCards/></span><div><small>RECEITA LÍQUIDA</small><strong>{money(data.financial.net)}</strong><p>{money(data.financial.pending)} pendente</p></div></article>
     <article><span><GraduationCap/></span><div><small>ACURÁCIA</small><strong>{data.learning.accuracy}%</strong><p>{data.learning.answers} resposta(s) analisada(s)</p></div></article>
    </div>

    <div className="admin-primary-grid" style={{marginTop:24}}>
     <article className="admin-panel"><header><div><span><MousePointerClick/> AQUISIÇÃO</span><h2>Origem do tráfego</h2></div><small>{days} DIAS</small></header>{data.traffic.sources.length?<div className="admin-bars">{data.traffic.sources.map(item=><div key={item.source}><div><b>{item.source}</b><span>{item.total}</span></div><i><em style={{width:`${Math.min(100,(item.total/Math.max(1,data.traffic.pageViews))*100)}%`}}/></i></div>)}</div>:<Empty text="Nenhum acesso neste recorte."/>}</article>
     <article className="admin-panel"><header><div><span><GraduationCap/> APRENDIZAGEM</span><h2>Respostas no período</h2></div><small>DISCIPLINA / EDIÇÃO</small></header><div className="finance-kpis"><article><small>CORRETAS</small><strong>{data.learning.correct}</strong></article><article><small>INCORRETAS</small><strong>{data.learning.wrong}</strong></article></div></article>
    </div>

    <article className="admin-panel" style={{marginTop:24}}><header><div><span><BookOpenCheck/> QUALIDADE</span><h2>Questões mais erradas</h2></div><small>TOP 20</small></header>{data.questions.mostWrong.length?<QuestionList rows={data.questions.mostWrong} metric={item=>`${item.wrong_rate??0}% de erro · ${item.answers??0} respostas`}/>:<Empty text="Ainda não há respostas suficientes neste recorte."/>}</article>
    <div className="admin-primary-grid" style={{marginTop:24}}>
     <article className="admin-panel"><header><div><span><BookOpenCheck/> REPORTES</span><h2>Mais reportadas</h2></div><small>TOP 20</small></header>{data.questions.mostReported.length?<QuestionList rows={data.questions.mostReported} metric={item=>`${item.reports??0} reporte(s) · ${item.open_reports??0} aberto(s)`}/>:<Empty text="Nenhum reporte neste recorte."/>}</article>
     <article className="admin-panel"><header><div><span><BookOpenCheck/> TEMPO</span><h2>Mais demoradas</h2></div><small>TOP 20</small></header>{data.questions.slowest.length?<QuestionList rows={data.questions.slowest} metric={item=>`${duration(item.average_response_time_ms??0)} · ${item.timed_answers??0} resposta(s)`}/>:<Empty text="Ainda não há respostas cronometradas neste recorte."/>}</article>
    </div>
   </section>
  </div>
 </main>;
}

function QuestionList({rows,metric}:{rows:QuestionRow[];metric:(item:QuestionRow)=>string}){return <div>{rows.map(item=><div key={item.id} style={{padding:"13px 0",borderBottom:"1px solid #e6e0d7"}}><div style={{display:"flex",justifyContent:"space-between",gap:16}}><b>{item.code}</b><strong>{metric(item)}</strong></div><p style={{margin:"6px 0",fontSize:13}}>{item.statement}</p><small>{item.discipline}{item.exam_edition?` · ${item.exam_edition}`:""}</small></div>)}</div>}
function Empty({text}:{text:string}){return <div className="admin-empty"><p>{text}</p></div>}
function money(cents:number){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(cents||0)/100)}
function duration(ms:number){const s=Math.round(ms/1000);return s<60?`${s}s`:`${Math.floor(s/60)}m ${s%60}s`}
function value(v:string|string[]|undefined){return Array.isArray(v)?v[0]:v}
function clean(v:string|undefined){const x=v?.trim();return x?x:null}
function numberOrNull(v:string|undefined){const n=Number(v);return Number.isInteger(n)&&n>0?n:null}
function normalizeDays(v:string|undefined){const n=Number(v);return [7,30,90,365].includes(n)?n:30}
function queryString(values:Record<string,string>){const p=new URLSearchParams();for(const [k,v] of Object.entries(values))if(v)p.set(k,v);return p.toString()}
