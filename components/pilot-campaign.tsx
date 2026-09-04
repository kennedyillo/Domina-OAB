"use client";

import { ArrowRight, CheckCircle2, Gift, LoaderCircle, Mail } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type Result = { status: "founder"; remaining: number; marketing_opt_in?: boolean };

export function PilotCampaign() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/pilot")
      .then((response) => response.json())
      .then((data: { remaining?: number }) => {
        if (typeof data.remaining === "number") setRemaining(data.remaining);
      })
      .catch(() => undefined);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/pilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent }),
      });
      const data = (await response.json()) as Result & { error?: string; closed?: boolean };
      if (data.closed) {
        setRemaining(0);
        return;
      }
      if (!response.ok) throw new Error(data.error ?? "Não foi possível concluir o cadastro.");
      setRemaining(data.remaining);
      setResult(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  const available = remaining ?? 25;
  const cadastroHref = `/cadastro?founder=1&email=${encodeURIComponent(email)}`;

  return <section className="pilot-campaign" id="piloto">
    <div className="pilot-copy">
      <span className="pilot-icon"><Gift size={21}/></span>
      <div><span className="eyebrow light"><span/> Grupo fundador</span><h2>Os primeiros 25 usuários ganham um ano de Plano Domina.</h2><p>Participe do piloto, use todos os recursos de diagnóstico e ajude a aperfeiçoar a plataforma antes do lançamento.</p></div>
    </div>
    <div className="pilot-counter" aria-live="polite"><strong>{available}</strong><span>de 25 acessos<br/>ainda disponíveis</span><i><b style={{width:`${(available/25)*100}%`}}/></i></div>
    {available===0&&!result?<div className="pilot-closed"><strong>As vagas gratuitas foram preenchidas.</strong><p>Escolha o período de acesso que combina com a sua preparação.</p><a href="#planos">Ver planos pagos <ArrowRight size={16}/></a></div>:!result ? <form className="pilot-form" onSubmit={submit}>
      <label><span>E-mail para participar</span><div><Mail size={17}/><input type="email" value={email} onChange={(event)=>setEmail(event.target.value)} placeholder="voce@email.com" required/><button disabled={loading}>{loading?<LoaderCircle className="spin" size={18}/>:<>Quero participar <ArrowRight size={16}/></>}</button></div></label>
      <label className="consent"><input type="checkbox" checked={consent} onChange={(event)=>setConsent(event.target.checked)}/><span>Quero receber novidades, conteúdos e condições especiais do Domina OAB. Este aceite é opcional e não interfere na vaga fundadora.</span></label>
      {error&&<p className="form-error">{error}</p>}
    </form> : <div className="pilot-success"><CheckCircle2/><div><strong>Sua vaga fundadora foi reservada.</strong><p>Agora crie sua conta com este mesmo e-mail e, depois do login, conclua CPF e telefone para ativar os 12 meses gratuitos. Nenhum cartão é necessário.</p><a href={cadastroHref}>Criar minha conta <ArrowRight size={16}/></a></div></div>}
  </section>;
}
