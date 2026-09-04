import { Brand } from "@/components/app-header";
import { AdminQuestions } from "@/components/admin-questions";
import { adminCan, adminRoleLabel, requireAdminPermission } from "@/lib/admin-access";
import { ArrowLeft,BookOpenCheck,Flag,LogOut,Users } from "lucide-react";
import Link from "next/link";

export const dynamic="force-dynamic";

export default async function AdminQuestionsPage(){
 const user=await requireAdminPermission("content:view","/admin/questoes");
 const canEdit=adminCan(user.role,"content:edit");
 const canPublish=adminCan(user.role,"legal:review");
 return <main className="admin-surface"><header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/api/auth/logout"><LogOut size={15}/>Sair</a></div></header><div className="admin-shell"><aside className="admin-sidebar"><nav aria-label="Navegação administrativa"><Link href="/admin"><ArrowLeft/>Visão geral</Link>{adminCan(user.role,"users:view")&&<Link href="/admin/usuarios"><Users/>Usuários</Link>}<Link className="active" href="/admin/questoes"><BookOpenCheck/>Questões</Link><Link href="/admin/reportes"><Flag/>Reportes</Link></nav><div className="admin-account"><span>{(user.fullName??user.email).slice(0,2).toUpperCase()}</span><div><b>{user.fullName??user.email}</b><small>{adminRoleLabel(user.role)}</small></div></div></aside><section className="admin-content"><div className="admin-title"><div><span className="eyebrow"><span/> Gestão de conteúdo</span><h1>Questões</h1><p>{canEdit?"Cadastre, edite e encaminhe questões para revisão.":canPublish?"Revise o banco e publique apenas as questões juridicamente aprovadas.":"Consulte o banco de questões."}</p></div></div><AdminQuestions canEdit={canEdit} canPublish={canPublish}/></section></div></main>;
}
