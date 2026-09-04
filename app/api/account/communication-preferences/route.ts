import { getSupabaseUser, supabaseAdminRpc } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type PreferencesPayload = {
  marketing_opt_in?: unknown;
  study_reminders?: unknown;
};

export async function GET() {
  const user = await getSupabaseUser();
  if (!user?.id) {
    return Response.json({ error: "Faça login para ver suas preferências." }, { status: 401 });
  }

  const preferences = await supabaseAdminRpc("my_communication_preferences", { p_user_id: user.id });
  return Response.json({ preferences }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await getSupabaseUser();
  if (!user?.id) {
    return Response.json({ error: "Faça login para alterar suas preferências." }, { status: 401 });
  }

  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(declaredLength) && declaredLength > 4096) {
    return Response.json({ error: "Requisição inválida." }, { status: 413 });
  }

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) {
      return Response.json({ error: "Requisição inválida." }, { status: 413 });
    }

    const body = JSON.parse(raw) as PreferencesPayload;
    if (typeof body.marketing_opt_in !== "boolean" || typeof body.study_reminders !== "boolean") {
      return Response.json({ error: "Preferências inválidas." }, { status: 400 });
    }

    const result = await supabaseAdminRpc("set_my_communication_preferences", {
      p_user_id: user.id,
      p_marketing_opt_in: body.marketing_opt_in,
      p_study_reminders: body.study_reminders,
    });

    return Response.json(result, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Não foi possível salvar as preferências." }, { status: 500 });
  }
}
