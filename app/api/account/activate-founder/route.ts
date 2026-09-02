import { NextResponse } from "next/server";
import { getSupabaseUser, supabaseAdminRpc } from "@/lib/supabase";

export async function POST(request: Request) {
  const user = await getSupabaseUser();
  if (!user?.id || !user.email) {
    return NextResponse.redirect(new URL("/entrar?return_to=/ativar-fundador", request.url), 303);
  }

  const form = await request.formData();
  const fullName = String(form.get("full_name") ?? "").trim();
  const cpf = String(form.get("cpf") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();

  try {
    await supabaseAdminRpc("activate_founder_access", {
      p_user_id: user.id,
      p_email: user.email,
      p_cpf: cpf,
      p_phone: phone,
      p_full_name: fullName || null,
    });
    return NextResponse.redirect(new URL("/plataforma?founder=active", request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "activation_failed";
    const code = message.includes("cpf_already_in_use") ? "cpf"
      : message.includes("phone_already_in_use") ? "phone"
      : message.includes("founder_reservation_not_found") ? "reservation"
      : "1";
    return NextResponse.redirect(new URL(`/ativar-fundador?error=${code}`, request.url), 303);
  }
}
