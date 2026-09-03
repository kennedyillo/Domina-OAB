import { Brand } from "@/components/app-header";
import { requireAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";
import { ArrowLeft, BarChart3, Clock3, Flag, LogOut, XCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type WrongQuestion = { id:number; code:string; statement:string; answers:number; wrong_answers:number; wrong_rate:number };
type ReportedQuestion = { id:number; code:string; statement:string; reports:number; open_reports:number };
type TimedQuestion = { id:number; code:string; statement:string; timed_answers:number; average_response_time_ms:number };
type QualityPayload = { mostWrong:WrongQuestion[]; mostReported:ReportedQuestion[] };
type TimingPayload = { slowest:TimedQuestion[] };

export default async function QuestionAnalyticsPage(){
  await requireAdminUser("/admin/analytics/questoes");
  const [quality,timing] = await Promise.all([
    supabaseAdminRpc<QualityPayload>("admin_question_quality_metrics"),
    supabaseAdminRpc<TimingPayload>("admin_question_timing_metrics"),
  ]);
  const wrong=quality.mostWrong??[];
  const reported=quality.mostReported??[];
  const slowest=timing.slowest??[];

  return <main className="admin-surface">
    <header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/api/auth/logout"><LogOut size={15}/>Sair</a></div></header>
    <div className="admin-shell">
      <aside className="admin-sidebar"><nav aria-label="Navegação administrativa"><Link href="/admin/questoes"><ArrowLeft/>Questões</Link><Link className="active" href="/admin/analytics/questoes"><BarChart3/>Qualidade</Link></nav></aside>
      <section className="admin-content">
        <div className="admin-title"><div><span className="eyebrow"><span/> Qualidade do banco</span><h1>Analytics de questões</h1><p>Erros, tempo de resposta e reportes para priorizar revisão editorial.</p></div></div>

        <div className="admin-primary-grid">
          <QuestionPanel icon={<XCircle/>} kicker="DESEMPENHO" title="Questões mais erradas" empty="Ainda não há respostas salvas para formar o ranking.">
            {wrong.map(item=><div key={item.id} style={{padding:"14px 0",borderBottom:"1px solid #e6e0d7"}}><div style={{display:"flex",justifyContent:"space-between",gap:16}}><b>{item.code}</b><strong>{item.wrong_rate}% de erro</strong></div><p style={{margin:"7px 0",fontSize:13}}>{item.statement}</p><small>{item.wrong_answers} erros em {item.answers} respostas</small></div>)}
          </QuestionPanel>
          <QuestionPanel icon={<Flag/>} kicker="REVISÃO" title="Questões mais reportadas" empty="Nenhum reporte registrado ainda.">
            {reported.map(item=><div key={item.id} style={{padding:"14px 0",borderBottom:"1px solid #e6e0d7"}}><div style={{display:"flex",justifyContent:"space-between",gap:16}}><b>{item.code}</b><strong>{item.reports} reporte(s)</strong></div><p style={{margin:"7px 0",fontSize:13}}>{item.statement}</p><small>{item.open_reports} ainda aberto(s)</small></div>)}
          </QuestionPanel>
        </div>

        <article className="admin-panel" style={{marginTop:24}}><header><div><span><Clock3/> TEMPO DE RESPOSTA</span><h2>Questões mais demoradas</h2></div><small>MÉDIA POR RESPOSTA SALVA</small></header>{slowest.length?<div>{slowest.map(item=><div key={item.id} style={{padding:"14px 0",borderBottom:"1px solid #e6e0d7"}}><div style={{display:"flex",justifyContent:"space-between",gap:16}}><b>{item.code}</b><strong>{formatDuration(item.average_response_time_ms)}</strong></div><p style={{margin:"7px 0",fontSize:13}}>{item.statement}</p><small>{item.timed_answers} resposta(s) cronometrada(s)</small></div>)}</div>:<div className="admin-empty"><p>O cronômetro por questão está ativo para novas tentativas. O ranking aparecerá assim que houver respostas cronometradas.</p></div>}</article>
      </section>
    </div>
  </main>;
}

function QuestionPanel({icon,kicker,title,empty,children}:{icon:React.ReactNode;kicker:string;title:string;empty:string;children:React.ReactNode}){
  const hasChildren=Array.isArray(children)?children.length>0:Boolean(children);
  return <article className="admin-panel"><header><div><span>{icon} {kicker}</span><h2>{title}</h2></div><small>TOP 10</small></header>{hasChildren?children:<div className="admin-empty"><p>{empty}</p></div>}</article>;
}

function formatDuration(ms:number){
  const seconds=Math.round(ms/1000);
  if(seconds<60) return `${seconds}s`;
  return `${Math.floor(seconds/60)}m ${seconds%60}s`;
}
