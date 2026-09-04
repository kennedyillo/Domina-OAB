import { Brand } from "@/components/app-header";
import { adminCan, adminRoleLabel, requireAdminPermission } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";
import { Activity, ArrowDownToLine, BarChart3, BookOpenCheck, CircleDollarSign, ClipboardCheck, CreditCard, Flag, Gauge, LayoutDashboard, LogOut, Mail, MousePointerClick, ReceiptText, ShieldCheck, TicketCheck, TrendingUp, Users, WalletCards } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Lead = { id:number; email:string; status:"founder"; created_at:string };
type Source = { source:string; total:number };
type PageRow = { path:string; total:number };
type PaymentRow = { id:number; email:string; plan_name:string; status:string; payment_method:string|null; installments:number; gross_amount_cents:number; created_at:string };
type PlanRow = { id:string; name:string; billing_type:string; duration_days:number|null; price_cents:number; max_installments:number; active:boolean };

const configuredPlans:PlanRow[] = [
  {id:"domina-monthly",name:"Domina 30 dias",billing_type:"one_time",duration_days:30,price_cents:4990,max_installments:1,active:true},
  {id:"domina-90",name:"Domina 90 dias",billing_type:"one_time",duration_days:90,price_cents:12990,max_installments:3,active:true},
  {id:"domina-annual",name:"Domina Anual",billing_type:"one_time",duration_days:365,price_cents:36000,max_installments:12,active:true},
  {id:"founder-annual",name:"Acesso Fundador",billing_type:"promotional",duration_days:365,price_cents:0,max_installments:1,active:true},
];

type AdminDashboard = {
  founders:number; leads:number; pageViews:number; sessions:number; started:number; completed:number; completionRate:number;
  recent:Lead[]; sources:Source[]; pages:PageRow[];
  financial:{gross:number;fees:number;net:number;approved:number;pending:number;activeSubscriptions:number};
  recentPayments:PaymentRow[]; plans:PlanRow[];
};

async function adminData(): Promise<AdminDashboard> {
  const data = await supabaseAdminRpc<AdminDashboard>("admin_dashboard");
  return {
    ...data,
    recent:data.recent ?? [],
    sources:data.sources ?? [],
    pages:data.pages ?? [],
    recentPayments:data.recentPayments ?? [],
    plans:data.plans?.length ? data.plans : configuredPlans,
  };
}

export default async function AdminPage() {
  const user = await requireAdminPermission("dashboard:view","/admin");
  const data = await adminData();
  const canAnalytics=adminCan(user.role,"analytics:view");
  const canFinance=adminCan(user.role,"finance:view");
  const canFounders=adminCan(user.role,"founders:export");
  const canContent=adminCan(user.role,"content:view");
  const canEditContent=adminCan(user.role,"content:edit");
  const canUsers=adminCan(user.role,"users:view");
  const canReports=adminCan(user.role,"reports:view");
  const canCommunications=adminCan(user.role,"support:manage");
  const remaining = Math.max(0,25-data.founders);
  const maxSource = Math.max(1,...data.sources.map(item=>Number(item.total)));
  const maxPage = Math.max(1,...data.pages.map(item=>Number(item.total)));

  return <main className="admin-surface">
    <header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/api/auth/logout"><LogOut size={15}/>Sair</a></div></header>
    <div className="admin-shell">
      <aside className="admin-sidebar"><nav aria-label="Navegação administrativa"><a className="active" href="#visao"><LayoutDashboard/>Visão geral</a>{canAnalytics&&<a href="#analytics"><BarChart3/>Analytics</a>}{canFinance&&<a href="#financeiro"><WalletCards/>Financeiro</a>}{canFounders&&<a href="#fundadores"><TicketCheck/>Fundadores <b>{data.founders}</b></a>}{canContent&&<Link href="/admin/questoes"><BookOpenCheck/>Questões</Link>}{canUsers&&<Link href="/admin/usuarios"><Users/>Usuários</Link>}{canReports&&<Link href="/admin/reportes"><Flag/>Reportes</Link>}{canEditContent&&<Link href="/admin/simulados"><BarChart3/>Simulados</Link>}{canCommunications&&<Link href="/admin/comunicacoes"><Mail/>Comunicações</Link>}</nav><div className="admin-account"><span>{(user.fullName??user.email).slice(0,2).toUpperCase()}</span><div><b>{user.fullName??user.email}</b><small>{adminRoleLabel(user.role)}</small></div></div></aside>

      <section className="admin-content" id="visao"><div className="admin-title"><div><span className="eyebrow"><span/> Operação em tempo real</span><h1>Visão geral</h1><p>O painel mostra somente os módulos autorizados para o seu papel.</p></div><span className="admin-updated"><Activity/>Atualizado agora</span></div>

        {canAnalytics&&<><div className="admin-kpis"><article><span><MousePointerClick/></span><div><small>VISUALIZAÇÕES</small><strong>{data.pageViews}</strong><p>{data.sessions} sessões identificadas</p></div></article><article><span><ClipboardCheck/></span><div><small>SIMULADOS INICIADOS</small><strong>{data.started}</strong><p>{data.completed} concluídos</p></div></article><article><span><Gauge/></span><div><small>TAXA DE CONCLUSÃO</small><strong>{data.completionRate}%</strong><p>Início até resultado final</p></div></article><article><span><Mail/></span><div><small>CADASTROS</small><strong>{data.leads}</strong><p>{data.founders} acessos fundadores</p></div></article></div>

        <div className="admin-primary-grid" id="analytics"><article className="admin-panel traffic-panel"><header><div><span><TrendingUp/> AQUISIÇÃO</span><h2>Origem do tráfego</h2></div><small>ÚLTIMOS 30 DIAS</small></header><div className="admin-bars">{data.sources.length?data.sources.map(item=><div key={item.source}><div><b>{item.source}</b><span>{item.total}</span></div><i><em style={{width:`${(Number(item.total)/maxSource)*100}%`}}/></i></div>):<Empty text="Os dados aparecerão após os primeiros acessos."/>}</div></article><article className="admin-panel pages-panel"><header><div><span><BarChart3/> CONTEÚDO</span><h2>Páginas mais acessadas</h2></div><small>VISUALIZAÇÕES</small></header><div className="admin-bars">{data.pages.length?data.pages.map(item=><div key={item.path}><div><b>{item.path}</b><span>{item.total}</span></div><i><em style={{width:`${(Number(item.total)/maxPage)*100}%`}}/></i></div>):<Empty text="Nenhuma visualização registrada ainda."/>}</div></article></div></>}

        {canFounders&&<section className="founder-admin" id="fundadores"><div className="founder-summary"><div><span className="panel-kicker"><ShieldCheck/> CAMPANHA FUNDADORA</span><h2>{remaining>0?`${remaining} acessos anuais disponíveis`:"Vagas gratuitas preenchidas"}</h2><p>{remaining>0?"Os próximos cadastros válidos ainda recebem 12 meses gratuitos.":"As vagas gratuitas foram preenchidas."}</p><div className="founder-progress"><i><em style={{width:`${(data.founders/25)*100}%`}}/></i><span><b>{data.founders}</b> de 25 ocupados</span></div></div><div className="founder-actions"><a href="/admin/fundadores.csv"><ArrowDownToLine/>Exportar CSV</a><Link href="/#piloto">Ver campanha</Link></div></div>
          <div className="admin-table"><div className="admin-table-head"><span>E-mail</span><span>Situação</span><span>Cadastro</span></div>{data.recent.length?data.recent.map(lead=><div className="admin-table-row" key={lead.id}><b>{lead.email}</b><span className="founder">Fundador</span><small>{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(new Date(lead.created_at))}</small></div>):<Empty text="Nenhum cadastro recebido ainda."/>}</div>
        </section>}

        {canFinance&&<section className="finance-admin" id="financeiro">
          <div className="finance-heading"><div><span className="panel-kicker"><WalletCards/> GESTÃO FINANCEIRA</span><h2>Receita e cobranças</h2><p>Visão financeira restrita a papéis autorizados.</p></div><span className="finance-mode"><i/> ACESSO RESTRITO</span></div>
          <div className="finance-kpis">
            <article><small>RECEITA BRUTA · 30 DIAS</small><strong>{money(data.financial.gross)}</strong><p>{data.financial.approved} pagamentos aprovados</p></article>
            <article><small>TAXAS DE PAGAMENTO</small><strong>{money(data.financial.fees)}</strong><p>Calculadas após a conciliação</p></article>
            <article><small>RECEITA LÍQUIDA</small><strong>{money(data.financial.net)}</strong><p>Bruto menos taxas e estornos</p></article>
            <article><small>PENDENTE</small><strong>{money(data.financial.pending)}</strong><p>{data.financial.activeSubscriptions} acessos ativos</p></article>
          </div>
          <div className="finance-grid">
            <article className="finance-panel"><header><div><ReceiptText/><span><small>TRANSAÇÕES</small><h3>Pagamentos recentes</h3></span></div></header>{data.recentPayments.length?<div className="payment-list">{data.recentPayments.map(payment=><div key={payment.id}><span><b>{payment.email}</b><small>{payment.plan_name} · {payment.payment_method??"Método pendente"}</small></span><span><b>{money(payment.gross_amount_cents)}</b><small>{payment.installments>1?`${payment.installments} parcelas`:"À vista"}</small></span><em className={`payment-status ${payment.status}`}>{paymentLabel(payment.status)}</em></div>)}</div>:<Empty text="Nenhuma transação registrada."/>}</article>
            <article className="finance-panel"><header><div><CreditCard/><span><small>CATÁLOGO</small><h3>Planos configurados</h3></span></div><b>{data.plans.length} planos</b></header><div className="plan-list">{data.plans.map(plan=><div key={plan.id}><span><b>{plan.name}</b><small>{plan.billing_type==="promotional"?"Acesso promocional":`${plan.duration_days} dias de acesso`}</small></span><span><strong>{plan.price_cents?money(plan.price_cents):"Gratuito"}</strong><small>{plan.max_installments>1?`até ${plan.max_installments}×`:"pagamento único"}</small></span></div>)}</div></article>
          </div>
        </section>}

        <section className="admin-next"><div><CircleDollarSign/><span><small>ACESSOS DO PAPEL</small><h2>{adminRoleLabel(user.role)}</h2><p>Atalhos disponíveis conforme a matriz de permissões do servidor.</p></span></div><div>{canUsers&&<Link href="/admin/usuarios">Usuários</Link>}{canContent&&<Link href="/admin/questoes">Questões</Link>}{canReports&&<Link href="/admin/reportes">Reportes</Link>}{canEditContent&&<Link href="/admin/simulados">Simulados</Link>}{canCommunications&&<Link href="/admin/comunicacoes">Comunicações</Link>}</div></section>
      </section>
    </div>
  </main>;
}

function Empty({text}:{text:string}) { return <div className="admin-empty"><p>{text}</p></div>; }

function money(cents:number) {
  return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(cents/100);
}

function paymentLabel(status:string) {
  return ({pending:"Pendente",approved:"Aprovado",rejected:"Recusado",cancelled:"Cancelado",refunded:"Reembolsado",charged_back:"Contestado"} as Record<string,string>)[status]??status;
}
