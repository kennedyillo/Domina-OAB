import { Brand } from "@/components/app-header";

export const dynamic = "force-dynamic";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; retry?: string; return_to?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.return_to?.startsWith("/") ? params.return_to : "/admin";
  const rateLimited = params.error === "rate";
  const retrySeconds = Math.max(60, Math.min(1800, Number(params.retry) || 300));
  const retryMinutes = Math.max(1, Math.ceil(retrySeconds / 60));

  return <main className="admin-surface" style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:"24px"}}>
    <section style={{width:"min(440px,100%)",background:"#fff",borderRadius:18,padding:32,boxShadow:"0 24px 80px #07172d20"}}>
      <Brand compact/>
      <div style={{marginTop:28}}>
        <small style={{fontWeight:800,letterSpacing:".08em",color:"#176bdf"}}>ÁREA RESTRITA</small>
        <h1 style={{margin:"8px 0 10px",fontSize:30}}>Painel Domina OAB</h1>
        <p style={{color:"#5d6e7e",marginBottom:24}}>Entre com uma conta administrativa autorizada.</p>
      </div>

      {params.error && <p style={{background:"#fff2f2",padding:"10px 12px",borderRadius:8,color:"#9c2d2d"}}>
        {rateLimited
          ? `Muitas tentativas de acesso. Tente novamente em aproximadamente ${retryMinutes} min.`
          : "Não foi possível autenticar com essas credenciais."}
      </p>}

      <form method="post" action="/api/auth/login" style={{display:"grid",gap:14}}>
        <input type="hidden" name="return_to" value={returnTo}/>
        <label style={{display:"grid",gap:6,fontWeight:700}}>
          E-mail
          <input name="email" type="email" required autoComplete="email" disabled={rateLimited} style={{padding:"12px 14px",border:"1px solid #d9e1e5",borderRadius:8}}/>
        </label>
        <label style={{display:"grid",gap:6,fontWeight:700}}>
          Senha
          <input name="password" type="password" required autoComplete="current-password" disabled={rateLimited} style={{padding:"12px 14px",border:"1px solid #d9e1e5",borderRadius:8}}/>
        </label>
        <button type="submit" disabled={rateLimited} style={{marginTop:4,padding:"13px 16px",border:0,borderRadius:8,background:rateLimited?"#8190a0":"#092b52",color:"#fff",fontWeight:800,cursor:rateLimited?"not-allowed":"pointer"}}>{rateLimited?"Acesso temporariamente bloqueado":"Entrar no painel"}</button>
      </form>
    </section>
  </main>;
}
