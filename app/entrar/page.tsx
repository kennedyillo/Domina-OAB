import { Brand } from "@/components/app-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string;return_to?:string}>}) {
  const params=await searchParams;
  const returnTo=params.return_to?.startsWith("/")?params.return_to:"/plataforma";
  return <main className="admin-surface" style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}>
    <section style={{width:"min(460px,100%)",background:"#fff",padding:32,boxShadow:"0 24px 80px #07172d20"}}>
      <Brand compact/>
      <div style={{marginTop:28}}><small style={{fontWeight:800,letterSpacing:".08em",color:"#8d2038"}}>CONTA DOMINA</small><h1 style={{margin:"8px 0 10px",fontSize:30}}>Entrar</h1><p style={{color:"#5d6e7e",marginBottom:24}}>Use seu CPF, e-mail ou telefone e a mesma senha da sua conta.</p></div>
      {params.error&&<p style={{background:"#fff2f2",padding:"10px 12px",color:"#9c2d2d"}}>Dados de acesso inválidos.</p>}
      <form method="post" action="/api/auth/user-login" style={{display:"grid",gap:14}}>
        <input type="hidden" name="return_to" value={returnTo}/>
        <label style={{display:"grid",gap:6,fontWeight:700}}>CPF, e-mail ou telefone<input name="identifier" required autoComplete="username" style={{padding:"12px 14px",border:"1px solid #d9e1e5"}}/></label>
        <label style={{display:"grid",gap:6,fontWeight:700}}>Senha<input name="password" type="password" required autoComplete="current-password" style={{padding:"12px 14px",border:"1px solid #d9e1e5"}}/></label>
        <button className="button" type="submit">Entrar</button>
      </form>
      <p style={{marginTop:18,fontSize:13}}>Ainda não tem conta? <Link href="/cadastro" style={{color:"#8d2038",fontWeight:700}}>Criar conta</Link></p>
    </section>
  </main>;
}
