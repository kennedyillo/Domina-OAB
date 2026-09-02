import { Brand } from "@/components/app-header";
import { getSupabaseUser } from "@/lib/supabase";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AtivarFundadorPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const user=await getSupabaseUser();
  if(!user?.email) redirect("/entrar?return_to=/ativar-fundador");
  const params=await searchParams;
  const message=params.error==="cpf"?"Este CPF já está associado a outra conta.":params.error==="phone"?"Este telefone já está associado a outra conta.":params.error==="reservation"?"Não encontramos uma vaga fundadora reservada para este e-mail.":params.error?"Não foi possível concluir a ativação. Verifique os dados informados.":null;

  return <main className="admin-surface" style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}>
    <section style={{width:"min(520px,100%)",background:"#fff",padding:32,boxShadow:"0 24px 80px #07172d20"}}>
      <Brand compact/>
      <div style={{marginTop:28}}><small style={{fontWeight:800,letterSpacing:".08em",color:"#8d2038"}}>ATIVAÇÃO DO FUNDADOR</small><h1 style={{margin:"8px 0 10px",fontSize:30}}>Ative seus 12 meses</h1><p style={{color:"#5d6e7e",marginBottom:24}}>A vaga reservada será vinculada à sua identidade. Cada CPF, e-mail e telefone pode pertencer a apenas uma conta.</p></div>
      {message&&<p style={{background:"#fff2f2",padding:"10px 12px",color:"#9c2d2d"}}>{message}</p>}
      <form method="post" action="/api/account/activate-founder" style={{display:"grid",gap:14}}>
        <label style={{display:"grid",gap:6,fontWeight:700}}>Nome completo<input name="full_name" required autoComplete="name" style={{padding:"12px 14px",border:"1px solid #d9e1e5"}}/></label>
        <label style={{display:"grid",gap:6,fontWeight:700}}>E-mail<input value={user.email} readOnly style={{padding:"12px 14px",border:"1px solid #d9e1e5",background:"#f5f2eb"}}/></label>
        <label style={{display:"grid",gap:6,fontWeight:700}}>CPF<input name="cpf" inputMode="numeric" placeholder="000.000.000-00" required style={{padding:"12px 14px",border:"1px solid #d9e1e5"}}/></label>
        <label style={{display:"grid",gap:6,fontWeight:700}}>Telefone<input name="phone" inputMode="tel" placeholder="(83) 99999-9999" required autoComplete="tel" style={{padding:"12px 14px",border:"1px solid #d9e1e5"}}/></label>
        <button className="button" type="submit">Ativar acesso fundador</button>
      </form>
      <p style={{marginTop:18,fontSize:12,color:"#68717c"}}>O CPF é usado para impedir múltiplos benefícios por pessoa. Alterações posteriores exigirão atendimento administrativo.</p>
    </section>
  </main>;
}
