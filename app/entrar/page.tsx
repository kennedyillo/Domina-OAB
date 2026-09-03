import { AuthShell } from "@/components/auth-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string;return_to?:string;reset?:string}>}) {
  const params=await searchParams;
  const returnTo=params.return_to?.startsWith("/")?params.return_to:"/plataforma";

  return <AuthShell
    eyebrow="CONTA DOMINA"
    title="Entrar"
    description="Acesse seu histórico, seus diagnósticos e a evolução construída a partir de cada sessão."
    footer={<>Ainda não tem conta? <Link href="/cadastro">Criar conta</Link></>}
  >
    {params.reset==="1"&&<p className="auth-alert auth-alert-success">Senha atualizada. Entre com a nova senha para continuar.</p>}
    {params.error&&<p className="auth-alert">Dados de acesso inválidos. Confira o identificador e a senha informados.</p>}
    <form method="post" action="/api/auth/user-login" className="auth-form">
      <input type="hidden" name="return_to" value={returnTo}/>
      <label className="auth-field">CPF, e-mail ou telefone<input className="auth-input" name="identifier" required autoComplete="username"/></label>
      <label className="auth-field">
        <span className="auth-label-row"><span>Senha</span><Link href="/recuperar-senha">Esqueci minha senha</Link></span>
        <input className="auth-input" name="password" type="password" required autoComplete="current-password"/>
      </label>
      <button className="auth-submit" type="submit">Entrar</button>
    </form>
  </AuthShell>;
}
