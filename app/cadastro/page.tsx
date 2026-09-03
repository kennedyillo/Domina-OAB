import { AuthShell } from "@/components/auth-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CadastroPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const params=await searchParams;
  return <AuthShell
    eyebrow="NOVA CONTA"
    title="Criar conta"
    description="Crie seu acesso para transformar cada sessão em histórico, diagnóstico e evolução mensurável."
    footer={<>Já tem conta? <Link href="/entrar">Entrar</Link></>}
  >
    {params.error&&<p className="auth-alert">Não foi possível criar a conta. Verifique o e-mail e use uma senha com pelo menos 6 caracteres.</p>}
    <form method="post" action="/api/auth/signup" className="auth-form">
      <label className="auth-field">Nome completo<input className="auth-input" name="full_name" required autoComplete="name"/></label>
      <label className="auth-field">E-mail<input className="auth-input" name="email" type="email" required autoComplete="email"/></label>
      <label className="auth-field">Senha<input className="auth-input" name="password" type="password" minLength={6} required autoComplete="new-password"/></label>
      <button className="auth-submit" type="submit">Criar conta</button>
    </form>
    <p className="auth-helper"><strong>Identidade única:</strong> CPF e telefone serão vinculados na etapa de ativação e não poderão pertencer a outra conta.</p>
  </AuthShell>;
}
