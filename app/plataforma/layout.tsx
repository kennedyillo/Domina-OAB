import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminMembershipByUserId } from "@/lib/admin-access";
import { getSupabaseUser } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function PlataformaLayout({ children }: { children: ReactNode }) {
  const user = await getSupabaseUser();

  if (user?.id) {
    const membership = await getAdminMembershipByUserId(user.id);
    if (membership?.active) redirect("/admin");
  }

  return children;
}
