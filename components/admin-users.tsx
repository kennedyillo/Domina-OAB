"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, CalendarPlus, CheckCircle2, History, KeyRound, LoaderCircle, Search, ShieldCheck, UserRoundCheck, WalletCards, XCircle } from "lucide-react";

type Plan={id:string;name:string;duration_days:number};
type UserRow = {
  user_id: string;
  full_name: string | null;
  cpf_masked: string | null;
  email: string;
  phone: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  cpf_verified: boolean;
  account_status: "active" | "blocked" | "cancelled";
  created_at: string;
  founder_status: "reserved" | "active" | "expired" | "cancelled" | "none";
  founder_activated_at: string | null;
  founder_expires_at: string | null;
  active_plan: string | null;
  access_ends_at: string | null;
  days_remaining: number | null;
};

export function AdminUsers() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [plans,setPlans]=useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load(q = query) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      const data = await response.json() as { users?: UserRow[];plans?:Plan[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar os usuários.");
      setUsers(data.users || []);setPlans(data.plans||[]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Erro ao carregar usuários.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(""); }, []);

  async function act(userId: string, action: string, extra?:{days?:number;plan_id?:string}) {
    setBusy(`${userId}:${action}`);setError("");
    try {
      const response = await fetch("/api/admin/users", {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({user_id:userId,action,...extra})});
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível concluir a ação.");
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Erro na ação administrativa."); }
    finally { setBusy(null); }
  }

  const totals = useMemo(() => ({total:users.length,active:users.filter(u=>u.account_status==="active").length,founders:users.filter(u=>u.founder_status==="active").length,blocked:users.filter(u=>u.account_status==="blocked").length}), [users]);

  return <>
    <div className="admin-kpis"><article><span><UserRoundCheck/></span><div><small>USUÁRIOS</small><strong>{totals.total}</strong><p>na consulta atual</p></div></article><article><span><CheckCircle2/></span><div><small>ATIVOS</small><strong>{totals.active}</strong><p>contas liberadas</p></div></article><article><span><ShieldCheck/></span><div><small>FUNDADORES ATIVOS</small><strong>{totals.founders}</strong><p>benefício ativado</p></div></article><article><span><Ban/></span><div><small>BLOQUEADOS</small><strong>{totals.blocked}</strong><p>acesso suspenso</p></div></article></div>

    <section className="admin-panel" style={{marginTop:24}}>
      <header><div><span><Search/> IDENTIDADE</span><h2>Usuários e acessos</h2></div><a href="/admin/planos"><WalletCards size={15}/> Gerenciar planos</a></header>
      <form onSubmit={(e)=>{e.preventDefault(); void load();}} style={{display:"flex",gap:10,marginBottom:20}}><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar por nome, CPF, e-mail ou telefone" style={{flex:1,padding:"12px 14px",border:"1px solid #ddd8ce",background:"#fff"}}/><button className="button" disabled={loading}>{loading?<LoaderCircle className="spin" size={17}/>:<Search size={17}/>}Buscar</button></form>
      {error && <p className="form-error">{error}</p>}
      {loading ? <div className="admin-empty"><p>Carregando usuários...</p></div> : users.length===0 ? <div className="admin-empty"><p>Nenhum usuário encontrado.</p></div> : <div style={{display:"grid",gap:12}}>
        {users.map((user)=><article key={user.user_id} style={{border:"1px solid #e2ddd3",padding:18,background:"#fff"}}>
          <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr auto",gap:18,alignItems:"start"}}>
            <div><small>USUÁRIO</small><h3 style={{margin:"5px 0"}}>{user.full_name || "Sem nome cadastrado"}</h3><p style={{margin:0,fontSize:12}}>{user.email}</p><p style={{margin:"4px 0 0",fontSize:12}}>{user.phone || "Telefone não cadastrado"}</p></div>
            <div><small>IDENTIDADE</small><p style={{margin:"6px 0",fontSize:12}}>CPF {user.cpf_masked || "não cadastrado"}</p><p style={{margin:0,fontSize:11}}>{user.cpf_verified?"CPF validado":"CPF pendente"} · {user.email_verified?"e-mail validado":"e-mail pendente"} · {user.phone_verified?"telefone validado":"telefone pendente"}</p></div>
            <div><small>ACESSO</small><p style={{margin:"6px 0",fontSize:12}}>{user.active_plan || "Sem plano ativo"}</p><p style={{margin:0,fontSize:11}}>{user.access_ends_at?`Expira em ${new Intl.DateTimeFormat("pt-BR").format(new Date(user.access_ends_at))} · ${user.days_remaining ?? 0} dias restantes`:"Sem validade ativa"}</p><p style={{margin:"5px 0 0",fontSize:11}}>Fundador: {founderLabel(user.founder_status)}</p></div>
            <div><span className={`payment-status ${user.account_status}`}>{accountLabel(user.account_status)}</span></div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16,paddingTop:14,borderTop:"1px solid #eee8df"}}>
            <a className="button button-small" href={`/admin/usuarios/${user.user_id}`}><History size={15}/>Histórico e evolução</a>
            {user.account_status==="blocked" ? <button className="button button-small" disabled={Boolean(busy)} onClick={()=>void act(user.user_id,"unblock")}><CheckCircle2 size={15}/>Desbloquear</button> : <button className="button button-small" disabled={Boolean(busy)} onClick={()=>void act(user.user_id,"block")}><Ban size={15}/>Bloquear</button>}
            {user.active_plan ? <><button className="button button-small" disabled={Boolean(busy)} onClick={()=>{const days=Number(window.prompt("Quantos dias deseja acrescentar?","30"));if(Number.isInteger(days)&&days>0)void act(user.user_id,"extend_access",{days});}}><CalendarPlus size={15}/>Estender acesso</button><button className="button button-small" disabled={Boolean(busy)} onClick={()=>{if(window.confirm("Cancelar o acesso ativo deste usuário?"))void act(user.user_id,"cancel_access");}}><XCircle size={15}/>Suspender acesso</button></> : <button className="button button-small" disabled={Boolean(busy)} onClick={()=>{const text=plans.map((p,i)=>`${i+1}. ${p.name} (${p.duration_days} dias)`).join("\n");const choice=Number(window.prompt(`Selecione o plano:\n${text}`,"1"));const plan=plans[choice-1];if(plan)void act(user.user_id,"grant_access",{plan_id:plan.id});}}><KeyRound size={15}/>Ativar acesso</button>}
            {user.account_status!=="cancelled" && <button className="button button-small" disabled={Boolean(busy)} onClick={()=>{if(window.confirm("Cancelar a conta deste usuário?")) void act(user.user_id,"cancel_account");}}><XCircle size={15}/>Cancelar conta</button>}
          </div>
        </article>)}
      </div>}
    </section>
  </>;
}
function founderLabel(status: UserRow["founder_status"]) { return ({reserved:"Reservado",active:"Ativado",expired:"Expirado",cancelled:"Cancelado",none:"Não fundador"} as const)[status]; }
function accountLabel(status: UserRow["account_status"]) { return ({active:"Ativo",blocked:"Bloqueado",cancelled:"Cancelado"} as const)[status]; }
