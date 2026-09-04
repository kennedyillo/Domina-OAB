import { Brand } from "@/components/app-header";
import { adminRoleLabel, requireAdminPermission } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";
import { ArrowLeft,BarChart3,History,LogOut } from "lucide-react";
import Link from "next/link";

export const dynamic="force-dynamic";
type Attempt={id:number;status:string;discipline:string;simulation:string|null;total_questions:number;answered_questions:number;correct_answers:number;score:number;started_at:string;completed_at:string|null};
type Evolution={discipline:string;completed_attempts:number;average_score:number;first_score:number;latest_score:number;evolution_points:number};
type Access={id:number;plan_id:string;plan_name:string|null;source_type:string;status:string;starts_at:string;ends_at:string;created_at:string};
type Detail={attempts:Attempt[];evolution:Evolution[];accessHistory:Access[]};

export default async function UserDetailPage({params}:{params:Promise<{id:string}>}){
 const user=await requireAdminPermission("users:view","/admin/usuarios");
 const {id}=await params;
 const data=await supabaseAdminRpc<Detail>("admin_user_detail",{p_user_id:id});
 return <main className="admin-surface"><header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/api/auth/logout"><LogOut size={15}/>Sair</a></div></header><div className="admin-shell"><aside className="admin-sidebar"><nav><Link href="/admin/usuarios"><ArrowLeft/>Usuários</Link></nav><div className="admin-account"><span>{(user.fullName??user.email).slice(0,2).toUpperCase()}</span><div><b>{user.fullName??user.email}</b><small>{adminRoleLabel(user.role)}</small></div></div></aside><section className="admin-content"><div className="admin-title"><div><span className="eyebrow"><span/> Histórico individual</span><h1>Desempenho do aluno</h1><p>Tentativas, evolução por disciplina e histórico de acesso.</p></div></div>
 <section className="admin-panel"><header><div><span><BarChart3/> EVOLUÇÃO</span><h2>Por disciplina</h2></div><small>{data.evolution?.length??0} DISCIPLINAS</small></header>{data.evolution?.length?<div className="admin-kpis">{data.evolution.map(row=><article key={row.discipline}><div><small>{row.discipline.toUpperCase()}</small><strong>{row.latest_score}%</strong><p>{row.first_score}% inicial · {row.evolution_points>0?"+":""}{row.evolution_points} p.p. · {row.completed_attempts} tentativa(s)</p></div></article>)}</div>:<Empty text="Ainda não há tentativas concluídas para calcular evolução."/>}</section>
 <section className="admin-panel" style={{marginTop:24}}><header><div><span><History/> SIMULADOS</span><h2>Histórico de tentativas</h2></div><small>ATÉ 100</small></header>{data.attempts?.length?<div>{data.attempts.map(a=><div key={a.id} style={{display:"grid",gridTemplateColumns:"1.2fr 1fr .6fr .7fr 1fr",gap:12,padding:"12px 0",borderBottom:"1px solid #eee8df",fontSize:12}}><span><b>{a.simulation||"Simulado"}</b><small style={{display:"block"}}>{a.discipline}</small></span><span>{a.status}</span><span>{a.correct_answers}/{a.total_questions}</span><strong>{a.score}%</strong><span>{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Fortaleza"}).format(new Date(a.started_at))}</span></div>)}</div>:<Empty text="Nenhum simulado salvo para este usuário."/>}</section>
 <section className="admin-panel" style={{marginTop:24}}><header><div><span><History/> ACESSOS</span><h2>Histórico de planos</h2></div><small>{data.accessHistory?.length??0} REGISTROS</small></header>{data.accessHistory?.length?<div>{data.accessHistory.map(a=><div key={a.id} style={{display:"grid",gridTemplateColumns:"1.2fr .8fr 1fr 1fr",gap:12,padding:"12px 0",borderBottom:"1px solid #eee8df",fontSize:12}}><b>{a.plan_name||a.plan_id}</b><span>{a.status}</span><span>{new Intl.DateTimeFormat("pt-BR").format(new Date(a.starts_at))}</span><span>{new Intl.DateTimeFormat("pt-BR").format(new Date(a.ends_at))}</span></div>)}</div>:<Empty text="Nenhum histórico de acesso encontrado."/>}</section>
 </section></div></main>;
}
function Empty({text}:{text:string}){return <div className="admin-empty"><p>{text}</p></div>}
