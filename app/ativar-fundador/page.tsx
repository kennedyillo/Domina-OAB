import { AuthShell } from "@/components/auth-shell";
import { getSupabaseUser } from "@/lib/supabase";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AtivarFundadorPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const user=await getSupabaseUser();
  if(!user?.email) redirect("/entrar?return_to=/ativar-fundador");
  const params=await searchParams;
  const message=params.error==="cpf"?"Este CPF já está associado a outra conta.":params.error==="phone"?"Este telefone já está associado a outra conta.":params.error==="full"?"As 25 vagas de acesso fundador já foram preenchidas. Você ainda pode escolher um dos planos Domina.":params.error?"Não foi possível concluir a ativação. Verifique os dados informados.":null;

  return <AuthShell
    eyebrow="ACESSO FUNDADOR"
    title="Ative seus 12 meses"
    description="Se ainda houver vaga disponível, conclua sua identificação para ativar 12 meses gratuitos. A inscrição em newsletter não é necessária."
  >
    <div className="auth-founder-banner"><b>Acesso fundador</b>As vagas são limitadas a 25 pessoas. Cada CPF, e-mail e telefone pode pertencer a apenas uma conta.</div>
    {message&&<p className="auth-alert">{message}</p>}
    <form method="post" action="/api/account/activate-founder" className="auth-form">
      <label className="auth-field">Nome completo<input className="auth-input" name="full_name" required autoComplete="name"/></label>
      <label className="auth-field">E-mail<input className="auth-input" value={user.email} readOnly/></label>
      <label className="auth-field">CPF<input className="auth-input" name="cpf" inputMode="numeric" placeholder="000.000.000-00" required/></label>
      <label className="auth-field">Telefone<input className="auth-input" name="phone" inputMode="tel" placeholder="(83) 99999-9999" required autoComplete="tel"/></label>
      <button className="auth-submit" type="submit">Ativar acesso fundador</button>
    </form>
    <p className="auth-helper">O CPF é usado apenas para garantir um benefício por pessoa. Receber comunicações de marketing é opcional e configurado separadamente.</p>
  </AuthShell>;
}
