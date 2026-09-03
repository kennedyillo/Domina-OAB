import { NextResponse } from "next/server";
import { adminCan, getAdminUser, type AdminRole } from "@/lib/admin-access";
import { writeAdminAudit } from "@/lib/admin-audit";
import { supabaseAdminSelect, supabaseAdminUpdate } from "@/lib/supabase";

const roles: AdminRole[] = ["owner", "administrator", "editor", "legal_reviewer", "support"];

type AdminMemberRow = {
  user_id: string;
  role: AdminRole;
  active: boolean;
  created_at: string;
  updated_at: string;
};

function forbidden() {
  return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
}

export async function GET() {
  const actor = await getAdminUser();
  if (!actor || !adminCan(actor.role, "roles:manage")) return forbidden();

  const members = await supabaseAdminSelect<AdminMemberRow[]>(
    "admin_members?select=user_id,role,active,created_at,updated_at&order=created_at.asc",
  );

  return NextResponse.json({ members }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(request: Request) {
  const actor = await getAdminUser();
  if (!actor || !adminCan(actor.role, "roles:manage")) return forbidden();

  const body = await request.json().catch(() => null) as {
    user_id?: string;
    role?: AdminRole;
    active?: boolean;
  } | null;

  const userId = body?.user_id?.trim();
  const role = body?.role;
  const active = body?.active;

  if (!userId || !role || !roles.includes(role) || typeof active !== "boolean") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const currentRows = await supabaseAdminSelect<AdminMemberRow[]>(
    `admin_members?select=user_id,role,active,created_at,updated_at&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  const current = currentRows[0];
  if (!current) return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });

  if (userId === actor.id && (!active || role !== "owner")) {
    return NextResponse.json({ error: "O proprietário não pode remover o próprio acesso." }, { status: 409 });
  }

  const updatedRows = await supabaseAdminUpdate<AdminMemberRow[]>(
    `admin_members?user_id=eq.${encodeURIComponent(userId)}`,
    { role, active },
  );
  const updated = updatedRows[0];
  if (!updated) return NextResponse.json({ error: "Alteração não aplicada." }, { status: 409 });

  await writeAdminAudit({
    actor,
    action: "admin_member.updated",
    resourceType: "admin_member",
    resourceId: userId,
    before: current,
    after: updated,
    requestId: request.headers.get("x-vercel-id") ?? request.headers.get("x-request-id"),
  });

  return NextResponse.json({ member: updated }, { headers: { "cache-control": "no-store" } });
}
