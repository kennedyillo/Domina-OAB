import { AuthShell } from "@/components/auth-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, string> = {
  "30d": "30 dias por R$ 49,90",
  "90d": "90 dias por R$ 129,90",
  annual: "365 dias por R$ 360,00",
};

export default async function CadastroPage({searchParams}:{searchParams:Promise<{error?:string;plan?:string}>}) {
  const params=await searchParams;
  const plan=params.plan&&PLAN_LABELS[params.plan]?params.plan:"";
  const loginHref=plan?`/entrar?return_to=${encodeURIComponent(`/api/mercadopago/checkout?plan=${plan}`)}`:"/entrar";

  return <AuthShell
    eyebrow={plan?"ASSINAR PLANO DOMINA":"NOVA CONTA"}
    title="Criar conta"
    description={plan?`Crie sua conta para continuar com o acesso de ${PLAN_LABELS[plan]}.`:"Crie seu acesso para transformar cada sessão em histórico, diagnóstico e evolução mensurável."}
    footer={<>Já tem conta? <Link href={loginHref}>Entrar</Link></>}
  >
    {params.error&&<p className="auth-alert">Não foi possível criar a conta. Verifique o e-mail e use uma senha com pelo menos 6 caracteres.</p>}
    <form method="post" action="/api/auth/signup" className="auth-form">
      {plan&&<input type="hidden" name="plan" value={plan}/>} 
      <label className="auth-field">Nome completo<input className="auth-input" name="full_name" required autoComplete="name"/></label>
      <label className="auth-field">E-mail<input className="auth-input" name="email" type="email" required autoComplete="email"/></label>
      <label className="auth-field">Senha<input className="auth-input" name="password" type="password" minLength={6} required autoComplete="new-password"/></label>
      <button className="auth-submit" type="submit">{plan?"Criar conta e continuar":"Criar conta"}</button>
    </form>
    {plan&&<p className="auth-helper"><strong>Plano selecionado:</strong> {PLAN_LABELS[plan]}. O pagamento será feito no ambiente seguro do Mercado Pago após a criação da conta.</p>}
    <p className="auth-helper"><strong>Identidade única:</strong> CPF e telefone serão vinculados na etapa de ativação e não poderão pertencer a outra conta.</p>
  </AuthShell>;
}
