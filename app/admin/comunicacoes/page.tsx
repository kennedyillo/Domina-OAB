import { Brand } from "@/components/app-header";
import { AdminCommunications } from "@/components/admin-communications";
import { adminRoleLabel, requireAdminPermission } from "@/lib/admin-access";
import { ArrowLeft, LogOut, Mail } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCommunicationsPage(){
  const user=await requireAdminPermission("support:manage","/admin/comunicacoes");
  return <main className="admin-surface">
    <header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/api/auth/logout"><LogOut size={15}/>Sair</a></div></header>
    <div className="admin-shell">
      <aside className="admin-sidebar"><nav aria-label="Navegação administrativa"><Link href="/admin"><ArrowLeft/>Visão geral</Link><Link className="active" href="/admin/comunicacoes"><Mail/>Comunicações</Link></nav><div className="admin-account"><span>{(user.fullName??user.email).slice(0,2).toUpperCase()}</span><div><b>{user.fullName??user.email}</b><small>{adminRoleLabel(user.role)}</small></div></div></aside>
      <section className="admin-content"><div className="admin-title"><div><span className="eyebrow"><span/> Consentimento e relacionamento</span><h1>Comunicações</h1><p>Gerencie opt-ins, lembretes de estudo e o histórico de mensagens enviadas.</p></div></div><AdminCommunications/></section>
    </div>
  </main>;
}
