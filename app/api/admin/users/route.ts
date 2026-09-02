import { getAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";

type AdminUserRow = {
  user_id: string;
  full_name: string | null;
  cpf_masked: string | null;
  email: string;
  phone: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  cpf_verified: boolean;
  account_status: "active" | "blocked" | "cancelled";
  created_at: string;
  founder_status: "reserved" | "active" | "expired" | "cancelled" | "none";
  founder_activated_at: string | null;
  founder_expires_at: string | null;
  active_plan: string | null;
  access_ends_at: string | null;
  days_remaining: number | null;
};

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Acesso negado." }, { status: 403 });

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || null;
  const users = await supabaseAdminRpc<AdminUserRow[]>("admin_users", { p_query: query });
  return Response.json({ users });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Acesso negado." }, { status: 403 });

  const body = await request.json() as {
    user_id?: string;
    action?: "block" | "unblock" | "cancel_account" | "cancel_access" | "extend_access";
    days?: number;
  };

  if (!body.user_id || !body.action) {
    return Response.json({ error: "Ação inválida." }, { status: 400 });
  }

  try {
    if (body.action === "block") {
      await supabaseAdminRpc<void>("admin_set_account_status", { p_user_id: body.user_id, p_status: "blocked" });
    } else if (body.action === "unblock") {
      await supabaseAdminRpc<void>("admin_set_account_status", { p_user_id: body.user_id, p_status: "active" });
    } else if (body.action === "cancel_account") {
      await supabaseAdminRpc<void>("admin_set_account_status", { p_user_id: body.user_id, p_status: "cancelled" });
    } else if (body.action === "cancel_access") {
      await supabaseAdminRpc<void>("admin_cancel_access", { p_user_id: body.user_id });
    } else if (body.action === "extend_access") {
      const days = Number(body.days ?? 0);
      if (!Number.isInteger(days) || days < 1 || days > 730) {
        return Response.json({ error: "Informe entre 1 e 730 dias." }, { status: 400 });
      }
      await supabaseAdminRpc("admin_extend_access", { p_user_id: body.user_id, p_days: days });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível concluir a ação.";
    return Response.json({ error: message }, { status: 500 });
  }
}
