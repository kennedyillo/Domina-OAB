"use client";

import { AuthShell } from "@/components/auth-shell";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

export default function RedefinirSenhaPage() {
  const [accessToken,setAccessToken]=useState("");
  const [recoverySession,setRecoverySession]=useState(false);
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    const hash=new URLSearchParams(window.location.hash.replace(/^#/,""));
    const query=new URLSearchParams(window.location.search);
    const token=hash.get("access_token")||query.get("access_token")||"";
    const type=hash.get("type")||query.get("type")||"";
    const providerError=hash.get("error")||query.get("error");
    if(query.get("recovery")==="1") setRecoverySession(true);
    if(token&&(!type||type==="recovery")) setAccessToken(token);
    if(providerError) setError("Este link de recuperação é inválido ou expirou. Solicite um novo link.");
    setReady(true);
  },[]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!recoverySession&&!accessToken){setError("Este link de recuperação é inválido ou expirou. Solicite um novo link.");return;}
    const form=new FormData(event.currentTarget);
    const password=String(form.get("password")??"");
    const confirmation=String(form.get("password_confirmation")??"");
    if(password.length<6){setError("Use uma senha com pelo menos 6 caracteres.");return;}
    if(password!==confirmation){setError("As senhas informadas não coincidem.");return;}

    setBusy(true);setError("");
    try{
      const response=await fetch("/api/auth/password-reset/update",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({access_token:accessToken||undefined,password,password_confirmation:confirmation}),
      });
      if(!response.ok) throw new Error("reset_failed");
      window.location.assign("/entrar?reset=1");
    }catch{
      setError("Não foi possível atualizar a senha. O link pode ter expirado; solicite uma nova recuperação.");
      setBusy(false);
    }
  }

  const validRecovery=recoverySession||Boolean(accessToken);
  return <AuthShell
    eyebrow="NOVA SENHA"
    title="Defina sua nova senha"
    description="Escolha uma nova senha para recuperar o acesso ao seu histórico e aos seus diagnósticos."
    footer={<>Precisa de outro link? <Link href="/recuperar-senha">Solicitar nova recuperação</Link></>}
  >
    {!ready?<div className="auth-loading"><i/>Validando o link seguro...</div>:!validRecovery?<p className="auth-alert">{error||"Este link de recuperação é inválido ou expirou. Solicite um novo link."}</p>:<>
      {error&&<p className="auth-alert">{error}</p>}
      <form className="auth-form" onSubmit={submit}>
        <label className="auth-field">Nova senha<input className="auth-input" name="password" type="password" minLength={6} required autoComplete="new-password"/></label>
        <label className="auth-field">Confirmar nova senha<input className="auth-input" name="password_confirmation" type="password" minLength={6} required autoComplete="new-password"/></label>
        <button className="auth-submit" type="submit" disabled={busy}>{busy?"Atualizando senha...":"Atualizar senha"}</button>
      </form>
    </>}
  </AuthShell>;
}
