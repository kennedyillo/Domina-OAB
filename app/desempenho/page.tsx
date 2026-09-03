import { AppHeader } from "@/components/app-header";
import { StudentDiagnostics } from "@/components/student-diagnostics";
import { getSupabaseUser } from "@/lib/supabase";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DesempenhoPage() {
  const user = await getSupabaseUser();

  if (!user?.id) {
    redirect("/entrar?return_to=/desempenho");
  }

  return (
    <main className="app-surface">
      <AppHeader active="inicio" access="subscriber" />
      <div className="practice-shell" style={{ display: "block" }}>
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "24px" }}>
          <span className="eyebrow">
            <span /> DIAGNÓSTICO
          </span>
          <h1 style={{ margin: "8px 0" }}>Seu desempenho</h1>
          <p style={{ maxWidth: 720 }}>
            Evolução, pontos fortes e prioridades de estudo calculados a partir dos simulados salvos na sua conta.
          </p>
          <div style={{ marginTop: 24 }}>
            <StudentDiagnostics />
          </div>
        </section>
      </div>
    </main>
  );
}
