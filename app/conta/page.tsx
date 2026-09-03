import { AppHeader } from "@/components/app-header";
import { getSupabaseUser, supabaseAdminSelect } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { CalendarClock, Mail, ShieldCheck, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

type Entitlement = {
  id: number;
  plan_id: string;
  status: string;
  starts_at: string;
  ends_at: string;
};

type Plan = {
  id: string;
  name: string;
  billing_type: string;
  price_cents: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ContaPage() {
  const user = await getSupabaseUser();
  if (!user?.id) redirect("/entrar?return_to=/conta");

  let entitlement: Entitlement | null = null;
  let plan: Plan | null = null;

  try {
    const rows = await supabaseAdminSelect<Entitlement[]>(
      `entitlements?user_id=eq.${encodeURIComponent(user.id)}&status=eq.active&ends_at=gt.${encodeURIComponent(new Date().toISOString())}&select=id,plan_id,status,starts_at,ends_at&order=ends_at.desc&limit=1`
    );
    entitlement = rows[0] ?? null;

    if (entitlement) {
      const planRows = await supabaseAdminSelect<Plan[]>(
        `plans?id=eq.${encodeURIComponent(entitlement.plan_id)}&select=id,name,billing_type,price_cents&limit=1`
      );
      plan = planRows[0] ?? null;
    }
  } catch {
    // Se a consulta falhar, a página ainda mostra os dados básicos da conta.
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  return (
    <main className="app-surface">
      <AppHeader active="inicio" access={entitlement ? "subscriber" : "visitor"} />
      <div className="app-container" style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <span className="eyebrow">
          <span /> CONTA
        </span>
        <h1 style={{ margin: "8px 0 24px" }}>Minha conta</h1>

        <section
          style={{
            background: "#0f1f38",
            border: "1px solid #1f3355",
            borderRadius: 14,
            padding: 24,
            marginBottom: 20,
            display: "grid",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "#d4a13a",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                color: "#111",
              }}
            >
              {(fullName ?? user.email ?? "U").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong style={{ display: "block", fontSize: 18 }}>{fullName ?? "Sem nome cadastrado"}</strong>
              <span style={{ color: "#8a9ab0", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <Mail size={14} /> {user.email}
              </span>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#0f1f38",
            border: "1px solid #1f3355",
            borderRadius: 14,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 16, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={18} /> Plano
          </h2>
          {entitlement ? (
            <div style={{ display: "grid", gap: 8 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                {plan?.name ?? entitlement.plan_id}
              </p>
              {plan && plan.price_cents > 0 && (
                <p style={{ margin: 0, color: "#8a9ab0" }}>{formatPrice(plan.price_cents)}</p>
              )}
              <p style={{ margin: 0, color: "#8a9ab0", display: "flex", alignItems: "center", gap: 6 }}>
                <CalendarClock size={14} /> Acesso até {formatDate(entitlement.ends_at)}
              </p>
            </div>
          ) : (
            <p style={{ margin: 0, color: "#8a9ab0" }}>
              Nenhum plano ativo no momento. Os simulados gratuitos continuam disponíveis, mas o desempenho não é
              salvo.
            </p>
          )}
        </section>

        <a
          href="/api/auth/logout"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 18px",
            borderRadius: 10,
            border: "1px solid #3a4a63",
            color: "#e8edf3",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          <LogOut size={16} /> Sair da conta
        </a>
      </div>
    </main>
  );
}
