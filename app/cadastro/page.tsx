import { AuthShell } from "@/components/auth-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, string> = {
  "30d": "30 dias por R$ 49,90",
  "90d": "90 dias por R$ 129,90",
  annual: "365 dias por R$ 360,00",
};

export default async function CadastroPage({searchParams}:{searchParams:Promise<{error?:string;plan?:string;founder?:string;email?:string;check_email?:string}>}) {
  const params=await searchParams;
  const plan=params.plan&&PLAN_LABELS[params.plan]?params.plan:"";
  const founder=params.founder==="1"&&!plan;
  const reservedEmail=founder&&params.email?params.email.trim().toLowerCase():"";
  const loginReturn=plan?`/api/mercadopago/checkout?plan=${plan}`:founder?"/ativar-fundador":"";
  const loginHref=loginReturn?`/entrar?return_to=${encodeURIComponent(loginReturn)}`:"/entrar";
  const needsEmailConfirmation=params.check_email==="1";
  const errorMessage=params.error==="rate"
    ?"Muitas tentativas de cadastro em pouco tempo. Aguarde alguns minutos e tente novamente."
    :params.error==="size"
      ?"Os dados enviados excederam o limite permitido."
      :params.error
        ?"Não foi possível criar a conta. Verifique o e-mail e use uma senha com pelo menos 6 caracteres."
        :null;

  return <AuthShell
    eyebrow={plan?"ASSINAR PLANO DOMINA":founder?"ACESSO FUNDADOR":"NOVA CONTA"}
    title={needsEmailConfirmation?"Confirme seu e-mail":"Criar conta"}
    description={needsEmailConfirmation
      ?"Sua conta foi criada, mas o provedor de autenticação exige confirmação do endereço antes de iniciar a sessão. Abra a mensagem recebida e, depois da confirmação, entre normalmente para continuar."
      :plan?`Crie sua conta para continuar com o acesso de ${PLAN_LABELS[plan]}.`:founder?"Sua vaga já foi reservada. Crie a conta com o mesmo e-mail para seguir direto à ativação dos 12 meses gratuitos.":"Crie seu acesso para transformar cada sessão em histórico, diagnóstico e evolução mensurável."}
    footer={<>Já tem conta? <Link href={loginHref}>Entrar</Link></>}
  >
    {errorMessage&&<p className="auth-alert">{errorMessage}</p>}
    {needsEmailConfirmation?<>
      <p className="auth-founder-banner"><b>Conta criada</b>Confirme o e-mail antes de entrar. Nenhum acesso fundador, plano pago ou consentimento de marketing é ativado apenas pela criação da conta.</p>
      <Link className="auth-submit" href={loginHref}>Ir para entrar</Link>
    </>:<form method="post" action="/api/auth/signup" className="auth-form">
      {plan&&<input type="hidden" name="plan" value={plan}/>} 
      {founder&&<input type="hidden" name="founder" value="1"/>}
      <label className="auth-field">Nome completo<input className="auth-input" name="full_name" maxLength={160} required autoComplete="name"/></label>
      <label className="auth-field">E-mail<input className="auth-input" name="email" type="email" maxLength={254} required autoComplete="email" defaultValue={reservedEmail} readOnly={Boolean(reservedEmail)}/></label>
      <label className="auth-field">Senha<input className="auth-input" name="password" type="password" minLength={6} maxLength={1024} required autoComplete="new-password"/></label>
      <button className="auth-submit" type="submit">{plan?"Criar conta e continuar":founder?"Criar conta e ativar vaga":"Criar conta"}</button>
    </form>}
    {plan&&!needsEmailConfirmation&&<p className="auth-helper"><strong>Plano selecionado:</strong> {PLAN_LABELS[plan]}. O pagamento será feito no ambiente seguro do Mercado Pago após a criação da conta.</p>}
    {founder&&!needsEmailConfirmation&&<p className="auth-helper"><strong>Vaga fundadora:</strong> depois da conta, você só precisa informar CPF e telefone para ativar os 12 meses. Newsletter continua opcional.</p>}
    {!needsEmailConfirmation&&<p className="auth-helper"><strong>Identidade única:</strong> CPF e telefone serão vinculados na etapa de ativação e não poderão pertencer a outra conta.</p>}
  </AuthShell>;
}
