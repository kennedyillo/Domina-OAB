import { redirect } from "next/navigation";
import { getSupabaseUser, supabaseAdminSelect } from "@/lib/supabase";

export type AdminRole = "owner" | "administrator" | "editor" | "legal_reviewer" | "support";
export type AdminPermission =
  | "dashboard:view"
  | "analytics:view"
  | "finance:view"
  | "founders:export"
  | "content:view"
  | "content:edit"
  | "legal:review"
  | "users:view"
  | "users:manage"
  | "reports:view"
  | "support:manage"
  | "audit:view"
  | "roles:manage";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
};

type AdminMembershipRow = {
  role: AdminRole;
  active: boolean;
};

const permissions: Record<AdminRole, readonly AdminPermission[] | "*"> = {
  owner: "*",
  administrator: [
    "dashboard:view", "analytics:view", "finance:view", "founders:export",
    "content:view", "content:edit", "legal:review", "users:view", "users:manage",
    "reports:view", "support:manage", "audit:view",
  ],
  editor: ["dashboard:view", "content:view", "content:edit", "reports:view"],
  legal_reviewer: ["dashboard:view", "content:view", "legal:review", "reports:view"],
  support: ["dashboard:view", "users:view", "reports:view", "support:manage"],
};

const roleLabels: Record<AdminRole, string> = {
  owner: "PROPRIETÁRIO",
  administrator: "ADMINISTRADOR",
  editor: "EDITOR",
  legal_reviewer: "REVISOR JURÍDICO",
  support: "ATENDIMENTO",
};

export function adminRoleLabel(role: AdminRole) {
  return roleLabels[role];
}

export function adminCan(role: AdminRole, permission: AdminPermission) {
  const allowed = permissions[role];
  return allowed === "*" || allowed.includes(permission);
}

export async function getAdminMembershipByUserId(userId: string): Promise<AdminMembershipRow | null> {
  const rows = await supabaseAdminSelect<AdminMembershipRow[]>(
    `admin_members?select=role,active&user_id=eq.${encodeURIComponent(userId)}&active=eq.true&limit=1`,
  );
  return rows[0] ?? null;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await getSupabaseUser();
  if (!user?.email) return null;

  const membership = await getAdminMembershipByUserId(user.id);
  if (!membership) return null;

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  return { id: user.id, email: user.email, fullName, role: membership.role };
}

export async function requireAdminUser(returnTo = "/admin") {
  const user = await getAdminUser();
  if (user) return user;
  redirect(`/admin/login?return_to=${encodeURIComponent(returnTo)}`);
}

export async function requireAdminPermission(permission: AdminPermission, returnTo = "/admin") {
  const user = await requireAdminUser(returnTo);
  if (adminCan(user.role, permission)) return user;
  redirect("/admin?error=forbidden");
}
