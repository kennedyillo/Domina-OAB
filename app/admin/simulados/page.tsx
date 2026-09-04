import { Brand } from "@/components/app-header";
import { AdminSimulations } from "@/components/admin-simulations";
import { adminRoleLabel, requireAdminPermission } from "@/lib/admin-access";
import { ArrowLeft, BarChart3, LogOut } from "lucide-react";
import Link from "next/link";

export const dynamic="force-dynamic";

export default async function AdminSimulationsPage(){
  const user=await requireAdminPermission("content:edit","/admin/simulados");
  return <main className="admin-surface">
    <header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/api/auth/logout"><LogOut size={15}/>Sair</a></div></header>
    <div className="admin-shell">
      <aside className="admin-sidebar"><nav aria-label="Navegação administrativa"><Link href="/admin"><ArrowLeft/>Visão geral</Link><Link className="active" href="/admin/simulados"><BarChart3/>Simulados</Link></nav><div className="admin-account"><span>{(user.fullName??user.email).slice(0,2).toUpperCase()}</span><div><b>{user.fullName??user.email}</b><small>{adminRoleLabel(user.role)}</small></div></div></aside>
      <section className="admin-content"><div className="admin-title"><div><span className="eyebrow"><span/> Desempenho agregado</span><h1>Simulados</h1><p>Configure simulados e acompanhe tentativas, conclusão, média e questões com maior taxa de erro.</p></div></div><AdminSimulations/></section>
    </div>
  </main>;
}
