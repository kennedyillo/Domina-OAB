"use client";

import { AppHeader } from "@/components/app-header";
import { BellRing, CheckCircle2, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Preferences = {
  marketing_opt_in: boolean;
  study_reminders: boolean;
  transactional_enabled: boolean;
  unsubscribed_at: string | null;
  consent_version: string | null;
};

export default function CommunicationPreferencesPage() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/account/communication-preferences", { cache: "no-store" });
      const data = await response.json() as { preferences?: Preferences; error?: string };
      if (!response.ok || !data.preferences) throw new Error(data.error || "Não foi possível carregar suas preferências.");
      setPreferences(data.preferences);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível carregar suas preferências.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function save(next = preferences) {
    if (!next) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch("/api/account/communication-preferences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          marketing_opt_in: next.marketing_opt_in,
          study_reminders: next.study_reminders,
        }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar suas preferências.");
      setPreferences(next);
      setSaved(true);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar suas preferências.");
    } finally {
      setSaving(false);
    }
  }

  function cancelOptional() {
    if (!preferences) return;
    const next = { ...preferences, marketing_opt_in: false, study_reminders: false };
    setPreferences(next);
    void save(next);
  }

  return <main className="app-surface">
    <AppHeader active="inicio"/>
    <div className="practice-shell" style={{maxWidth:850}}>
      <section className="result-card" style={{textAlign:"left"}}>
        <span className="result-kicker">COMUNICAÇÕES</span>
        <h1>Preferências de e-mail</h1>
        <p>Você decide sobre comunicações opcionais. Mensagens necessárias para conta, segurança e acesso continuam separadas do consentimento de marketing.</p>

        {loading ? <div style={{display:"flex",alignItems:"center",gap:10}}><LoaderCircle className="spin"/><p>Carregando preferências...</p></div> : error && !preferences ? <p className="form-error">{error}</p> : preferences && <div style={{display:"grid",gap:14,marginTop:22}}>
          <label style={{display:"flex",gap:12,alignItems:"center",padding:16,border:"1px solid #ddd8ce"}}>
            <input type="checkbox" checked={preferences.marketing_opt_in} onChange={(event)=>{setSaved(false);setPreferences({...preferences,marketing_opt_in:event.target.checked});}}/>
            <Mail/>
            <span><b>Novidades e conteúdos</b><small style={{display:"block"}}>Atualizações, materiais e novidades do Domina OAB.</small></span>
          </label>
          <label style={{display:"flex",gap:12,alignItems:"center",padding:16,border:"1px solid #ddd8ce"}}>
            <input type="checkbox" checked={preferences.study_reminders} onChange={(event)=>{setSaved(false);setPreferences({...preferences,study_reminders:event.target.checked});}}/>
            <BellRing/>
            <span><b>Lembretes de estudo</b><small style={{display:"block"}}>Avisos opcionais para manter sua rotina de preparação.</small></span>
          </label>

          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",paddingTop:8}}>
            <button className="button" disabled={saving} onClick={()=>void save()}>{saving?<LoaderCircle className="spin" size={16}/>:<CheckCircle2 size={16}/>}Salvar preferências</button>
            <button className="button button-secondary" disabled={saving||(!preferences.marketing_opt_in&&!preferences.study_reminders)} onClick={cancelOptional}>Cancelar comunicações opcionais</button>
            <Link href="/conta">Voltar à conta</Link>
          </div>
          {saved&&<p style={{display:"flex",alignItems:"center",gap:6}}><CheckCircle2 size={15}/> Preferências atualizadas.</p>}
          {error&&<p className="form-error">{error}</p>}
          <div style={{display:"flex",gap:9,alignItems:"start",marginTop:12,padding:14,background:"#f7f5f0"}}><ShieldCheck size={17}/><small>Comunicações transacionais sobre segurança, conta ou acesso não dependem do consentimento de marketing.</small></div>
        </div>}
      </section>
    </div>
  </main>;
}
