import { Brand } from "@/components/app-header";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { isAdminUser } from "@/lib/admin-access";
import { Activity, ArrowDownToLine, BarChart3, BookOpenCheck, CircleDollarSign, ClipboardCheck, CreditCard, Flag, Gauge, LayoutDashboard, LogOut, Mail, MousePointerClick, ReceiptText, ShieldCheck, TicketCheck, TrendingUp, Users, WalletCards } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Lead = { id:number; email:string; status:"founder"; created_at:string };
type Source = { source:string; total:number };
type PageRow = { path:string; total:number };
type FinancialTotals = { gross:number|null; fees:number|null; net:number|null; approved:number };
type PaymentRow = { id:number; email:string; plan_name:string; status:string; payment_method:string|null; installments:number; gross_amount_cents:number; created_at:string };
type PlanRow = { id:string; name:string; billing_type:string; duration_days:number|null; price_cents:number; max_installments:number; active:number };

const configuredPlans:PlanRow[] = [
  {id:"domina-monthly",name:"Domina Mensal",billing_type:"recurring",duration_days:30,price_cents:4990,max_installments:1,active:1},
  {id:"domina-90",name:"Domina 90 dias",billing_type:"one_time",duration_days:90,price_cents:12990,max_installments:1,active:1},
  {id:"domina-annual",name:"Domina Anual",billing_type:"one_time",duration_days:365,price_cents:36000,max_installments:12,active:1},
  {id:"founder-annual",name:"Acesso Fundador",billing_type:"promotional",duration_days:365,price_cents:0,max_installments:1,active:1},
];

async function adminData() {
  const { env } = await import("cloudflare:workers");
  const [founders, leads, pageViews, sessions, starts, completions, recent, sources, pages, financial, pending, activeSubscriptions, recentPayments, planRows] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS total FROM pilot_leads WHERE status = 'founder'").first<{total:number}>(),
    env.DB.prepare("SELECT COUNT(*) AS total FROM pilot_leads").first<{total:number}>(),
    env.DB.prepare("SELECT COUNT(*) AS total FROM analytics_events WHERE event_type = 'page_view' AND created_at >= datetime('now','-30 days')").first<{total:number}>(),
    env.DB.prepare("SELECT COUNT(DISTINCT session_id) AS total FROM analytics_events WHERE created_at >= datetime('now','-30 days')").first<{total:number}>(),
    env.DB.prepare("SELECT COUNT(*) AS total FROM analytics_events WHERE event_type = 'simulado_started' AND created_at >= datetime('now','-30 days')").first<{total:number}>(),
    env.DB.prepare("SELECT COUNT(*) AS total FROM analytics_events WHERE event_type = 'simulado_completed' AND created_at >= datetime('now','-30 days')").first<{total:number}>(),
    env.DB.prepare("SELECT id,email,status,created_at FROM pilot_leads ORDER BY created_at DESC,id DESC LIMIT 12").all<Lead>(),
    env.DB.prepare("SELECT CASE WHEN utm_source = '' THEN 'Direto / sem UTM' ELSE utm_source END AS source, COUNT(*) AS total FROM analytics_events WHERE event_type = 'page_view' AND created_at >= datetime('now','-30 days') GROUP BY source ORDER BY total DESC LIMIT 5").all<Source>(),
    env.DB.prepare("SELECT path, COUNT(*) AS total FROM analytics_events WHERE event_type = 'page_view' AND created_at >= datetime('now','-30 days') GROUP BY path ORDER BY total DESC LIMIT 5").all<PageRow>(),
    env.DB.prepare("SELECT COALESCE(SUM(gross_amount_cents),0) AS gross, COALESCE(SUM(fee_amount_cents),0) AS fees, COALESCE(SUM(net_amount_cents),0) AS net, COUNT(*) AS approved FROM payments WHERE status = 'approved' AND created_at >= datetime('now','-30 days')").first<FinancialTotals>(),
    env.DB.prepare("SELECT COALESCE(SUM(gross_amount_cents),0) AS total FROM payments WHERE status = 'pending'").first<{total:number}>(),
    env.DB.prepare("SELECT COUNT(*) AS total FROM subscriptions WHERE status IN ('authorized','active')").first<{total:number}>(),
    env.DB.prepare("SELECT payments.id,payments.email,plans.name AS plan_name,payments.status,payments.payment_method,payments.installments,payments.gross_amount_cents,payments.created_at FROM payments JOIN plans ON plans.id = payments.plan_id ORDER BY payments.created_at DESC,payments.id DESC LIMIT 8").all<PaymentRow>(),
    env.DB.prepare("SELECT id,name,billing_type,duration_days,price_cents,max_installments,active FROM plans ORDER BY price_cents ASC").all<PlanRow>(),
  ]);

  const started = Number(starts?.total ?? 0);
  const completed = Number(completions?.total ?? 0);
  return {
    founders:Number(founders?.total ?? 0),
    leads:Number(leads?.total ?? 0),
    pageViews:Number(pageViews?.total ?? 0),
    sessions:Number(sessions?.total ?? 0),
    started,
    completed,
    completionRate:started ? Math.round((completed/started)*100) : 0,
    recent:recent.results,
    sources:sources.results,
    pages:pages.results,
    financial:{
      gross:Number(financial?.gross ?? 0),
      fees:Number(financial?.fees ?? 0),
      net:Number(financial?.net ?? 0),
      approved:Number(financial?.approved ?? 0),
      pending:Number(pending?.total ?? 0),
      activeSubscriptions:Number(activeSubscriptions?.total ?? 0),
    },
    recentPayments:recentPayments.results,
    plans:planRows.results.length ? planRows.results : configuredPlans,
  };
}

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (!isAdminUser(user)) notFound();
  const data = await adminData();
  const remaining = Math.max(0,25-data.founders);
  const maxSource = Math.max(1,...data.sources.map(item=>Number(item.total)));
  const maxPage = Math.max(1,...data.pages.map(item=>Number(item.total)));

  return <main className="admin-surface">
    <header className="admin-header"><Brand compact/><div><span className="admin-environment"><i/> PAINEL ADMINISTRATIVO</span><a href="/signout-with-chatgpt?return_to=/"><LogOut size={15}/>Sair</a></div></header>
    <div className="admin-shell">
      <aside className="admin-sidebar"><nav aria-label="Navegação administrativa"><a className="active" href="#visao"><LayoutDashboard/>Visão geral</a><a href="#analytics"><BarChart3/>Analytics</a><a href="#financeiro"><WalletCards/>Financeiro</a><a href="#fundadores"><TicketCheck/>Fundadores <b>{data.founders}</b></a><a href="#conteudo"><BookOpenCheck/>Questões</a><a href="#usuarios"><Users/>Usuários</a><a href="#reportes"><Flag/>Reportes</a></nav><div className="admin-account"><span>KP</span><div><b>{user.fullName??"Kennedy Pereira"}</b><small>PROPRIETÁRIO</small></div></div></aside>

      <section className="admin-content" id="visao"><div className="admin-title"><div><span className="eyebrow"><span/> Operação em tempo real</span><h1>Visão geral</h1><p>Dados dos últimos 30 dias e situação atual da campanha fundadora.</p></div><span className="admin-updated"><Activity/>Atualizado agora</span></div>

        <div className="admin-kpis"><article><span><MousePointerClick/></span><div><small>VISUALIZAÇÕES</small><strong>{data.pageViews}</strong><p>{data.sessions} sessões identificadas</p></div></article><article><span><ClipboardCheck/></span><div><small>SIMULADOS INICIADOS</small><strong>{data.started}</strong><p>{data.completed} concluídos</p></div></article><article><span><Gauge/></span><div><small>TAXA DE CONCLUSÃO</small><strong>{data.completionRate}%</strong><p>Início até resultado final</p></div></article><article><span><Mail/></span><div><small>CADASTROS</small><strong>{data.leads}</strong><p>{data.founders} acessos fundadores</p></div></article></div>

        <div className="admin-primary-grid" id="analytics"><article className="admin-panel traffic-panel"><header><div><span><TrendingUp/> AQUISIÇÃO</span><h2>Origem do tráfego</h2></div><small>ÚLTIMOS 30 DIAS</small></header><div className="admin-bars">{data.sources.length?data.sources.map(item=><div key={item.source}><div><b>{item.source}</b><span>{item.total}</span></div><i><em style={{width:`${(Number(item.total)/maxSource)*100}%`}}/></i></div>):<Empty text="Os dados aparecerão após os primeiros acessos."/>}</div></article><article className="admin-panel pages-panel"><header><div><span><BarChart3/> CONTEÚDO</span><h2>Páginas mais acessadas</h2></div><small>VISUALIZAÇÕES</small></header><div className="admin-bars">{data.pages.length?data.pages.map(item=><div key={item.path}><div><b>{item.path}</b><span>{item.total}</span></div><i><em style={{width:`${(Number(item.total)/maxPage)*100}%`}}/></i></div>):<Empty text="Nenhuma visualização registrada ainda."/>}</div></article></div>

        <section className="founder-admin" id="fundadores"><div className="founder-summary"><div><span className="panel-kicker"><ShieldCheck/> CAMPANHA FUNDADORA</span><h2>{remaining>0?`${remaining} acessos anuais disponíveis`:"Vagas gratuitas preenchidas"}</h2><p>{remaining>0?"Os próximos cadastros válidos ainda recebem 12 meses gratuitos.":"Novos interessados devem ser direcionados automaticamente aos planos pagos."}</p><div className="founder-progress"><i><em style={{width:`${(data.founders/25)*100}%`}}/></i><span><b>{data.founders}</b> de 25 ocupados</span></div></div><div className="founder-actions"><a href="/admin/fundadores.csv"><ArrowDownToLine/>Exportar CSV</a><Link href="/#piloto">Ver campanha</Link></div></div>
          <div className="admin-table"><div className="admin-table-head"><span>E-mail</span><span>Situação</span><span>Cadastro</span></div>{data.recent.length?data.recent.map(lead=><div className="admin-table-row" key={lead.id}><b>{lead.email}</b><span className="founder">Fundador</span><small>{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(new Date(`${lead.created_at}Z`))}</small></div>):<Empty text="Nenhum cadastro recebido ainda."/>}</div>
        </section>

        <section className="finance-admin" id="financeiro">
          <div className="finance-heading"><div><span className="panel-kicker"><WalletCards/> GESTÃO FINANCEIRA</span><h2>Receita e cobranças</h2><p>Estrutura preparada para conciliação com o Mercado Pago. Nenhuma cobrança está ativa.</p></div><span className="finance-mode"><i/> AMBIENTE DE PREPARAÇÃO</span></div>
          <div className="finance-kpis">
            <article><small>RECEITA BRUTA · 30 DIAS</small><strong>{money(data.financial.gross)}</strong><p>{data.financial.approved} pagamentos aprovados</p></article>
            <article><small>TAXAS DE PAGAMENTO</small><strong>{money(data.financial.fees)}</strong><p>Calculadas após a conciliação</p></article>
            <article><small>RECEITA LÍQUIDA</small><strong>{money(data.financial.net)}</strong><p>Bruto menos taxas e estornos</p></article>
            <article><small>PENDENTE</small><strong>{money(data.financial.pending)}</strong><p>{data.financial.activeSubscriptions} assinaturas ativas</p></article>
          </div>
          <div className="finance-grid">
            <article className="finance-panel"><header><div><ReceiptText/><span><small>TRANSAÇÕES</small><h3>Pagamentos recentes</h3></span></div><b>Mercado Pago</b></header>{data.recentPayments.length?<div className="payment-list">{data.recentPayments.map(payment=><div key={payment.id}><span><b>{payment.email}</b><small>{payment.plan_name} · {payment.payment_method??"Método pendente"}</small></span><span><b>{money(payment.gross_amount_cents)}</b><small>{payment.installments>1?`${payment.installments} parcelas`:"À vista"}</small></span><em className={`payment-status ${payment.status}`}>{paymentLabel(payment.status)}</em></div>)}</div>:<Empty text="As transações confirmadas pelo Mercado Pago aparecerão aqui."/>}</article>
            <article className="finance-panel"><header><div><CreditCard/><span><small>CATÁLOGO</small><h3>Planos configurados</h3></span></div><b>{data.plans.length} planos</b></header><div className="plan-list">{data.plans.map(plan=><div key={plan.id}><span><b>{plan.name}</b><small>{plan.billing_type==="recurring"?"Assinatura recorrente":plan.billing_type==="promotional"?"Acesso promocional":`${plan.duration_days} dias de acesso`}</small></span><span><strong>{plan.price_cents?money(plan.price_cents):"Gratuito"}</strong><small>{plan.max_installments>1?`até ${plan.max_installments}×`:"pagamento único"}</small></span></div>)}</div></article>
          </div>
          <div className="payment-foundation"><ShieldCheck/><div><small>FUNDAÇÃO MERCADO PAGO</small><h3>Credenciais ainda não configuradas</h3><p>O checkout, os Webhooks assinados e a liberação automática de acesso serão conectados depois, usando somente segredos do servidor.</p></div><span>SEM COBRANÇAS</span></div>
        </section>

        <section className="admin-next" id="conteudo"><div><CircleDollarSign/><span><small>PRÓXIMO BLOCO</small><h2>Checkout de teste e Webhooks</h2><p>Com a base financeira pronta, a próxima etapa conecta o Mercado Pago em ambiente de testes e valida a liberação de acesso.</p></span></div><div><span id="usuarios">Usuários</span><span id="reportes">Reportes</span><span>Questões</span><span>Simulados</span></div></section>
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
