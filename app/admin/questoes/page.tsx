import { Brand } from "@/components/app-header";
import { AdminQuestions } from "@/components/admin-questions";
import { requireAdminUser } from "@/lib/admin-access";
import { ArrowLeft,BookOpenCheck,Flag,LogOut,Users } from "lucide-react";
import Link from "next/link";

export const dynamic="force-dynamic";

export default async function AdminQuestionsPage(){
 const user=await requireAdminUser("/admin/questoes");
 return <main className="admin-surface"><header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/api/auth/logout"><LogOut size={15}/>Sair</a></div></header><div className="admin-shell"><aside className="admin-sidebar"><nav aria-label="Navegação administrativa"><Link href="/admin"><ArrowLeft/>Visão geral</Link><Link href="/admin/usuarios"><Users/>Usuários</Link><Link className="active" href="/admin/questoes"><BookOpenCheck/>Questões</Link><Link href="/admin/reportes"><Flag/>Reportes</Link></nav><div className="admin-account"><span>KP</span><div><b>{user.fullName??"Kennedy Pereira"}</b><small>PROPRIETÁRIO</small></div></div></aside><section className="admin-content"><div className="admin-title"><div><span className="eyebrow"><span/> Gestão de conteúdo</span><h1>Questões</h1><p>Cadastre, revise, publique e arquive questões do banco Domina OAB.</p></div></div><AdminQuestions/></section></div></main>;
}
