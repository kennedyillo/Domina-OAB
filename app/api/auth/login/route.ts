import { NextResponse } from "next/server";
import { hasAdminRole } from "@/lib/admin-access";
import { signInWithPassword, supabaseAccessCookie, supabaseAdminRpc } from "@/lib/supabase";

function safeReturnTo(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value : "/admin";
  return text.startsWith("/") && !text.startsWith("//") ? text : "/admin";
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

type RateCheck = {
  allowed?: boolean;
  retry_after_seconds?: number;
};

async function recordAttempt(ip: string, email: string, succeeded: boolean) {
  await supabaseAdminRpc<void>("admin_login_record", {
    p_ip: ip,
    p_email: email,
    p_succeeded: succeeded,
  });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnTo(form.get("return_to"));
  const ip = clientIp(request);

  if (!email || !password) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }

  try {
    const rate = await supabaseAdminRpc<RateCheck>("admin_login_rate_check", {
      p_ip: ip,
      p_email: email,
    });

    if (rate.allowed === false) {
      const retry = Math.max(60, Math.min(1800, Number(rate.retry_after_seconds) || 300));
      const response = NextResponse.redirect(new URL(`/admin/login?error=rate&retry=${retry}`, request.url), 303);
      response.headers.set("Retry-After", String(retry));
      return response;
    }

    const session = await signInWithPassword(email, password);
    if (!session.user.email || !hasAdminRole(session.user)) {
      await recordAttempt(ip, email, false);
      return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
    }

    await recordAttempt(ip, email, true);

    const response = NextResponse.redirect(new URL(returnTo, request.url), 303);
    response.cookies.set(supabaseAccessCookie, session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(300, session.expires_in - 60),
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    try {
      await recordAttempt(ip, email, false);
    } catch {
      // Never expose rate-limit storage failures to the client.
    }
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }
}
