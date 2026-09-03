import { NextResponse } from "next/server";
import { signUpWithPassword, supabaseAccessCookie } from "@/lib/supabase";

const VALID_PLANS = new Set(["30d", "90d", "annual"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const fullName = String(form.get("full_name") ?? "").trim();
  const rawPlan = String(form.get("plan") ?? "").trim();
  const plan = VALID_PLANS.has(rawPlan) ? rawPlan : "";

  if (!email || !email.includes("@") || password.length < 6) {
    const target = plan ? `/cadastro?error=1&plan=${encodeURIComponent(plan)}` : "/cadastro?error=1";
    return NextResponse.redirect(new URL(target, request.url), 303);
  }

  try {
    const result = await signUpWithPassword(email, password, fullName || undefined);
    const target = plan
      ? `/api/mercadopago/checkout?plan=${encodeURIComponent(plan)}`
      : "/conta?created=1";
    const response = NextResponse.redirect(new URL(target, request.url), 303);
    if (result.access_token && result.expires_in) {
      response.cookies.set(supabaseAccessCookie, result.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: Math.max(300, result.expires_in - 60),
      });
    }
    return response;
  } catch {
    const target = plan ? `/cadastro?error=1&plan=${encodeURIComponent(plan)}` : "/cadastro?error=1";
    return NextResponse.redirect(new URL(target, request.url), 303);
  }
}
