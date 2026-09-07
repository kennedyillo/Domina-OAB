import { AppHeader } from "@/components/app-header";
import { StudentDiagnostics } from "@/components/student-diagnostics";
import { getSupabaseUser, supabaseAdminSelect } from "@/lib/supabase";
import { ArrowRight, BookOpenCheck, BrainCircuit, LockKeyhole, Target } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function resolveAccess(): Promise<{ access: "visitor" | "subscriber"; signedIn: boolean }> {
  const user = await getSupabaseUser();
  if (!user?.id) return { access: "visitor", signedIn: false };

  try {
    const rows = await supabaseAdminSelect<{ id: number }[]>(
      `entitlements?user_id=eq.${encodeURIComponent(user.id)}&status=eq.active&ends_at=gt.${encodeURIComponent(new Date().toISOString())}&select=id&limit=1`,
    );
    return { access: rows.length > 0 ? "subscriber" : "visitor", signedIn: true };
  } catch {
    return { access: "visitor", signedIn: true };
  }
}

export default async function Plataforma() {
  const { access, signedIn } = await resolveAccess();

  if (access === "subscriber") {
    return (
      <main className="app-surface">
        <AppHeader active="inicio" access="subscriber" />
        <div className="practice-shell" style={{ display: "block" }}>
          <section style={{ maxWidth: 1180, margin: "0 auto", padding: "24px" }}>
            <span className="eyebrow"><span /> SUA PLATAFORMA</span>
            <h1 style={{ margin: "8px 0" }}>Diagnóstico de desempenho</h1>
            <p style={{ maxWidth: 760 }}>
              Os indicadores abaixo são calculados exclusivamente a partir das suas tentativas salvas. Nenhum dado demonstrativo é misturado ao seu desempenho.
            </p>
            <div style={{ marginTop: 24 }}>
              <StudentDiagnostics />
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="button" href="/simulado?mode=exam">Simulado tradicional <ArrowRight size={17} /></Link>
              <Link className="button button-secondary" href="/simulado?mode=study">Modo estudo <BookOpenCheck size={16} /></Link>
              <Link className="button button-secondary" href="/disciplinas">Ver disciplinas</Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="app-surface">
      <AppHeader active="inicio" access="visitor" />
      <div className="practice-shell" style={{ display: "block" }}>
        <section style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px" }}>
          <span className="eyebrow"><span /> DOMINA OAB</span>
          <h1 style={{ margin: "8px 0" }}>{signedIn ? "Sua conta está pronta para começar." : "Comece por um simulado real."}</h1>
          <p style={{ maxWidth: 720 }}>
            Escolha entre simulado tradicional, com gabarito apenas no final, ou modo estudo, com correção e explicação questão por questão. O diagnóstico detalhado e o histórico são liberados para contas com acesso ativo.
          </p>

          <div className="diagnosis-overview" style={{ marginTop: 28 }}>
            <article className="readiness-card">
              <Target />
              <small>RESULTADO REAL</small>
              <h2>Sem números inventados</h2>
              <p>Seu desempenho só aparece depois que você responde questões de verdade.</p>
            </article>
            <article className="readiness-card">
              <BrainCircuit />
              <small>DIAGNÓSTICO</small>
              <h2>Baseado no seu histórico</h2>
              <p>Pontos fortes e prioridades são calculados a partir das tentativas salvas.</p>
            </article>
            <article className="readiness-card">
              <BookOpenCheck />
              <small>DOIS MODOS</small>
              <h2>Prova ou estudo guiado</h2>
              <p>Treine sem feedback antecipado ou veja a fundamentação depois de cada resposta.</p>
            </article>
          </div>

          <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="button" href="/simulado?mode=exam">Simulado tradicional <ArrowRight size={17} /></Link>
            <Link className="button button-secondary" href="/simulado?mode=study">Modo estudo <BookOpenCheck size={16} /></Link>
            {!signedIn && <Link className="button button-secondary" href="/cadastro">Criar conta</Link>}
            <Link className="button button-secondary" href="/#planos"><LockKeyhole size={16} /> Conhecer planos</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
