import { redirect } from "next/navigation";
import { getSupabaseUser } from "@/lib/supabase";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
};

const ADMIN_EMAILS = new Set([
  "kmps16@gmail.com",
  "portaldominaoab@gmail.com",
]);

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && ADMIN_EMAILS.has(email.toLowerCase()));
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await getSupabaseUser();
  if (!user?.email || !isAdminEmail(user.email)) return null;

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
