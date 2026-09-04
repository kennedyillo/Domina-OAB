import { adminCan, getAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";

function forbidden(){return Response.json({ error: "Acesso negado." }, { status: 403 });}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin || !adminCan(admin.role,"support:manage")) return forbidden();
  const data = await supabaseAdminRpc("admin_communications");
  return Response.json(data);
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin || !adminCan(admin.role,"support:manage")) return forbidden();
  const body = await request.json() as { user_id?: string; marketing_opt_in?: boolean; study_reminders?: boolean };
  if (!body.user_id) return Response.json({ error: "Usuário inválido." }, { status: 400 });
  await supabaseAdminRpc("admin_set_communication_preferences", {
    p_user_id: body.user_id,
    p_marketing_opt_in: Boolean(body.marketing_opt_in),
    p_study_reminders: Boolean(body.study_reminders),
  });
  return Response.json({ ok: true });
}
