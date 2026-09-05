import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/public-api-security";
import { signUpWithPassword, supabaseAccessCookie } from "@/lib/supabase";

const VALID_PLANS = new Set(["30d", "90d", "annual"]);
const MAX_FORM_BYTES = 8 * 1024;

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export async function POST(request: Request) {
  const rateLimited = await enforceRateLimit(request, "auth_signup", 5, 600);
  if (rateLimited) {
    const response = NextResponse.redirect(new URL("/cadastro?error=rate", request.url), 303);
    const retry = rateLimited.headers.get("Retry-After");
    if (retry) response.headers.set("Retry-After", retry);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const rawBody = await request.clone().arrayBuffer();
  if (rawBody.byteLength > MAX_FORM_BYTES) {
    const response = NextResponse.redirect(new URL("/cadastro?error=size", request.url), 303);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const fullName = String(form.get("full_name") ?? "").trim();
  const rawPlan = String(form.get("plan") ?? "").trim();
  const plan = VALID_PLANS.has(rawPlan) ? rawPlan : "";
  const founder = !plan && String(form.get("founder") ?? "") === "1";

  const signupTarget = (kind: "error" | "check_email", code = "1") => {
    const params = new URLSearchParams();
    if (kind === "error") params.set("error", code);
    else params.set("check_email", "1");
    if (plan) params.set("plan", plan);
    if (founder) {
      params.set("founder", "1");
      if (email) params.set("email", email);
    }
    return `/cadastro?${params.toString()}`;
  };

  if (!validEmail(email) || password.length < 6 || password.length > 1024 || fullName.length > 160) {
    return NextResponse.redirect(new URL(signupTarget("error"), request.url), 303);
  }

  try {
    const result = await signUpWithPassword(email, password, fullName || undefined);

    if (!result.access_token || !result.expires_in) {
      const response = NextResponse.redirect(new URL(signupTarget("check_email"), request.url), 303);
      response.headers.set("Cache-Control", "no-store");
      return response;
    }

    const target = plan
      ? `/api/mercadopago/checkout?plan=${encodeURIComponent(plan)}`
      : founder
        ? "/ativar-fundador"
        : "/conta?created=1";
    const response = NextResponse.redirect(new URL(target, request.url), 303);
    response.cookies.set(supabaseAccessCookie, result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(300, result.expires_in - 60),
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.redirect(new URL(signupTarget("error"), request.url), 303);
  }
}
