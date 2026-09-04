import { Brand } from "@/components/app-header";
import { AdminRoleManager } from "@/components/admin-role-manager";
import { AdminUsers } from "@/components/admin-users";
import { adminCan, adminRoleLabel, requireAdminPermission } from "@/lib/admin-access";
import { ArrowLeft, LogOut, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await requireAdminPermission("users:view","/admin/usuarios");
  const canManageUsers=adminCan(user.role,"users:manage");
  const canManageRoles=adminCan(user.role,"roles:manage");

  return <main className="admin-surface">
    <header className="admin-header">
      <Brand compact/>
      <div>
        <span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span>
        <a href="/api/auth/logout"><LogOut size={15}/>Sair</a>
      </div>
    </header>

    <div className="admin-shell">
      <aside className="admin-sidebar">
        <nav aria-label="Navegação administrativa">
          <Link href="/admin"><ArrowLeft/>Visão geral</Link>
          <Link className="active" href="/admin/usuarios"><Users/>Usuários</Link>
        </nav>
        <div className="admin-account"><span>{(user.fullName??user.email).slice(0,2).toUpperCase()}</span><div><b>{user.fullName??user.email}</b><small>{adminRoleLabel(user.role)}</small></div></div>
      </aside>

      <section className="admin-content">
        <div className="admin-title">
          <div>
            <span className="eyebrow"><span/> Gestão de identidade e acesso</span>
            <h1>Usuários</h1>
            <p>{canManageUsers?"Consulte identidades e gerencie situação da conta, benefício fundador e validade de acesso.":"Consulte identidades, situação da conta, benefício fundador e validade de acesso."}</p>
          </div>
        </div>
        <AdminUsers canManage={canManageUsers}/>
        {canManageRoles&&<AdminRoleManager/>}
      </section>
    </div>
  </main>;
}
