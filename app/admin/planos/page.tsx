import { Brand } from "@/components/app-header";
import { AdminPlans } from "@/components/admin-plans";
import { requireAdminUser } from "@/lib/admin-access";
import { ArrowLeft,LogOut,Users,WalletCards } from "lucide-react";
import Link from "next/link";

export const dynamic="force-dynamic";

export default async function AdminPlansPage(){
 const user=await requireAdminUser("/admin/planos");
 return <main className="admin-surface"><header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/api/auth/logout"><LogOut size={15}/>Sair</a></div></header><div className="admin-shell"><aside className="admin-sidebar"><nav aria-label="Navegação administrativa"><Link href="/admin"><ArrowLeft/>Visão geral</Link><Link href="/admin/usuarios"><Users/>Usuários</Link><Link className="active" href="/admin/planos"><WalletCards/>Planos</Link></nav><div className="admin-account"><span>KP</span><div><b>{user.fullName??"Kennedy Pereira"}</b><small>PROPRIETÁRIO</small></div></div></aside><section className="admin-content"><div className="admin-title"><div><span className="eyebrow"><span/> Modelo comercial</span><h1>Planos</h1><p>Preços, parcelamento e disponibilidade dos planos do Domina OAB.</p></div></div><AdminPlans/></section></div></main>;
}
