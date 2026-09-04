"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, ShieldCheck, UserPlus } from "lucide-react";

type Role = "owner" | "administrator" | "editor" | "legal_reviewer" | "support";
type Member = { user_id:string; role:Role; active:boolean; created_at:string; updated_at:string };
type User = { user_id:string; full_name:string|null; email:string };

const labels:Record<Role,string> = {
  owner:"Proprietário",
  administrator:"Administrador",
  editor:"Editor",
  legal_reviewer:"Revisor jurídico",
  support:"Atendimento",
};
const roles = Object.keys(labels) as Role[];

export function AdminRoleManager(){
  const [members,setMembers]=useState<Member[]>([]);
  const [users,setUsers]=useState<User[]>([]);
  const [selectedUser,setSelectedUser]=useState("");
  const [selectedRole,setSelectedRole]=useState<Role>("support");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  async function load(){
    setError("");
    try{
      const [mr,ur]=await Promise.all([
        fetch("/api/admin/members",{cache:"no-store"}),
        fetch("/api/admin/users",{cache:"no-store"}),
      ]);
      const mj=await mr.json() as {members?:Member[];error?:string};
      const uj=await ur.json() as {users?:User[];error?:string};
      if(!mr.ok) throw new Error(mj.error||"Falha ao carregar papéis administrativos.");
      if(!ur.ok) throw new Error(uj.error||"Falha ao carregar usuários.");
      setMembers(mj.members||[]);
      setUsers(uj.users||[]);
    }catch(e){setError(e instanceof Error?e.message:"Falha ao carregar papéis administrativos.");}
  }
  useEffect(()=>{void load();},[]);

  const memberByUser=useMemo(()=>new Map(members.map(m=>[m.user_id,m])),[members]);
  const candidates=users.filter(u=>!memberByUser.has(u.user_id));

  async function createMember(e:React.FormEvent){
    e.preventDefault();
    if(!selectedUser) return;
    setBusy(true);setError("");
    try{
      const r=await fetch("/api/admin/members",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({user_id:selectedUser,role:selectedRole})});
      const j=await r.json() as {error?:string};
      if(!r.ok) throw new Error(j.error||"Não foi possível criar o membro administrativo.");
      setSelectedUser("");
      await load();
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível criar o membro administrativo.");}
    finally{setBusy(false);}
  }

  async function updateMember(member:Member,role:Role,active:boolean){
    setBusy(true);setError("");
    try{
      const r=await fetch("/api/admin/members",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({user_id:member.user_id,role,active})});
      const j=await r.json() as {error?:string};
      if(!r.ok) throw new Error(j.error||"Não foi possível atualizar o membro administrativo.");
      await load();
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível atualizar o membro administrativo.");}
    finally{setBusy(false);}
  }

  return <section className="admin-panel" style={{marginTop:24}}>
    <header><div><span><ShieldCheck/> RBAC</span><h2>Equipe administrativa</h2></div><small>SOMENTE PROPRIETÁRIO</small></header>
    <p style={{fontSize:13,margin:"0 0 18px",color:"#596273"}}>Conceda acesso apenas a contas já cadastradas. Cada papel recebe somente as permissões previstas na matriz do servidor.</p>
    <form onSubmit={createMember} style={{display:"grid",gridTemplateColumns:"1fr 220px auto",gap:10,marginBottom:20}}>
      <select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)} required>
        <option value="">Selecionar usuário</option>
        {candidates.map(u=><option key={u.user_id} value={u.user_id}>{u.full_name||u.email} · {u.email}</option>)}
      </select>
      <select value={selectedRole} onChange={e=>setSelectedRole(e.target.value as Role)}>{roles.map(r=><option key={r} value={r}>{labels[r]}</option>)}</select>
      <button className="button" disabled={busy||!selectedUser}>{busy?<LoaderCircle className="spin" size={16}/>:<UserPlus size={16}/>}Conceder acesso</button>
    </form>
    {error&&<p className="form-error">{error}</p>}
    <div style={{display:"grid",gap:10}}>{members.map(member=>{
      const user=users.find(u=>u.user_id===member.user_id);
      return <article key={member.user_id} style={{display:"grid",gridTemplateColumns:"1.4fr 220px 130px",gap:12,alignItems:"center",padding:14,border:"1px solid #e2ddd3",background:"#fff"}}>
        <div><b>{user?.full_name||user?.email||member.user_id}</b><small style={{display:"block"}}>{user?.email||member.user_id}</small></div>
        <select value={member.role} disabled={busy} onChange={e=>void updateMember(member,e.target.value as Role,member.active)}>{roles.map(r=><option key={r} value={r}>{labels[r]}</option>)}</select>
        <label style={{display:"flex",alignItems:"center",gap:7}}><input type="checkbox" checked={member.active} disabled={busy} onChange={e=>void updateMember(member,member.role,e.target.checked)}/>Ativo</label>
      </article>;
    })}</div>
  </section>;
}
