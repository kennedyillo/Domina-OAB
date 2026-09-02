import { Brand } from "@/components/app-header";
import { AdminReports } from "@/components/admin-reports";
import { requireAdminUser } from "@/lib/admin-access";
import { ArrowLeft,BookOpenCheck,Flag,LogOut,Users } from "lucide-react";
import Link from "next/link";

export const dynamic="force-dynamic";

export default async function AdminReportsPage(){
 const user=await requireAdminUser("/admin/reportes");
 return <main className="admin-surface"><header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/api/auth/logout"><LogOut size={15}/>Sair</a></div></header><div className="admin-shell"><aside className="admin-sidebar"><nav aria-label="Navegação administrativa"><Link href="/admin"><ArrowLeft/>Visão geral</Link><Link href="/admin/usuarios"><Users/>Usuários</Link><Link href="/admin/questoes"><BookOpenCheck/>Questões</Link><Link className="active" href="/admin/reportes"><Flag/>Reportes</Link></nav><div className="admin-account"><span>KP</span><div><b>{user.fullName??"Kennedy Pereira"}</b><small>PROPRIETÁRIO</small></div></div></aside><section className="admin-content"><div className="admin-title"><div><span className="eyebrow"><span/> Controle de qualidade</span><h1>Reportes</h1><p>Revise problemas apontados pelos usuários e acompanhe a resolução de cada questão.</p></div></div><AdminReports/></section></div></main>;
}
