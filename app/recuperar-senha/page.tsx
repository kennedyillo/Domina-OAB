import { AuthShell } from "@/components/auth-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RecuperarSenhaPage({searchParams}:{searchParams:Promise<{sent?:string;error?:string}>}) {
  const params=await searchParams;
  const errorMessage=params.error==="link"
    ? "Este link de recuperação é inválido ou expirou. Solicite um novo link."
    : params.error
      ? "Não foi possível iniciar a recuperação agora. Confira o e-mail e tente novamente."
      : null;
  return <AuthShell
    eyebrow="RECUPERAÇÃO DE ACESSO"
    title="Recuperar senha"
    description="Informe o e-mail da sua conta. Enviaremos um link seguro para definir uma nova senha."
    footer={<>Lembrou a senha? <Link href="/entrar">Voltar para entrar</Link></>}
  >
    {params.sent==="1"&&<p className="auth-alert auth-alert-success">Se existir uma conta com esse e-mail, o link de redefinição foi enviado. Confira também a pasta de spam.</p>}
    {errorMessage&&<p className="auth-alert">{errorMessage}</p>}
    <form method="post" action="/api/auth/password-reset" className="auth-form">
      <label className="auth-field">E-mail<input className="auth-input" name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com"/></label>
      <button className="auth-submit" type="submit">Enviar link de recuperação</button>
    </form>
    <p className="auth-helper">Por segurança, a mensagem de confirmação é a mesma independentemente de o e-mail estar cadastrado.</p>
  </AuthShell>;
}
