import { Brand } from "@/components/app-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CadastroPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const params=await searchParams;
  return <main className="admin-surface" style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}>
    <section style={{width:"min(480px,100%)",background:"#fff",padding:32,boxShadow:"0 24px 80px #07172d20"}}>
      <Brand compact/>
      <div style={{marginTop:28}}><small style={{fontWeight:800,letterSpacing:".08em",color:"#8d2038"}}>NOVA CONTA</small><h1 style={{margin:"8px 0 10px",fontSize:30}}>Criar conta</h1><p style={{color:"#5d6e7e",marginBottom:24}}>O CPF e o telefone serão vinculados na etapa seguinte e não poderão pertencer a outra conta.</p></div>
      {params.error&&<p style={{background:"#fff2f2",padding:"10px 12px",color:"#9c2d2d"}}>Não foi possível criar a conta. Verifique o e-mail e use uma senha com pelo menos 6 caracteres.</p>}
      <form method="post" action="/api/auth/signup" style={{display:"grid",gap:14}}>
        <label style={{display:"grid",gap:6,fontWeight:700}}>Nome completo<input name="full_name" required autoComplete="name" style={{padding:"12px 14px",border:"1px solid #d9e1e5"}}/></label>
        <label style={{display:"grid",gap:6,fontWeight:700}}>E-mail<input name="email" type="email" required autoComplete="email" style={{padding:"12px 14px",border:"1px solid #d9e1e5"}}/></label>
        <label style={{display:"grid",gap:6,fontWeight:700}}>Senha<input name="password" type="password" minLength={6} required autoComplete="new-password" style={{padding:"12px 14px",border:"1px solid #d9e1e5"}}/></label>
        <button className="button" type="submit">Criar conta</button>
      </form>
      <p style={{marginTop:18,fontSize:13}}>Já tem conta? <Link href="/entrar" style={{color:"#8d2038",fontWeight:700}}>Entrar</Link></p>
    </section>
  </main>;
}
