import { redirect } from "next/navigation";
import { getSupabaseUser } from "@/lib/supabase";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
};

type SupabaseUserLike = {
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

export function hasAdminRole(user: SupabaseUserLike | null | undefined) {
  if (!user) return false;
  const metadata = user.app_metadata;
  if (!metadata) return false;

  if (metadata.role === "admin") return true;
  if (Array.isArray(metadata.roles)) {
    return metadata.roles.some((role) => role === "admin");
  }

  return false;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await getSupabaseUser();
  if (!user?.email || !hasAdminRole(user)) return null;

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  return { id: user.id, email: user.email, fullName };
}

export async function requireAdminUser(returnTo = "/admin") {
  const user = await getAdminUser();
  if (user) return user;
  redirect(`/admin/login?return_to=${encodeURIComponent(returnTo)}`);
}
