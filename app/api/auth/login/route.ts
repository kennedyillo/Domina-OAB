import { NextResponse } from "next/server";
import { getAdminMembershipByUserId } from "@/lib/admin-access";
import { signInWithPassword, supabaseAccessCookie, supabaseAdminRpc } from "@/lib/supabase";

const MAX_FORM_BYTES=8*1024;

function safeReturnTo(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value : "/admin";
  return text.length<=2048&&text.startsWith("/")&&!text.startsWith("//") ? text : "/admin";
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

function errorRedirect(request:Request,code="1",retry?:number){
  const response=NextResponse.redirect(new URL(`/admin/login?error=${code}${retry?`&retry=${retry}`:""}`,request.url),303);
  if(retry)response.headers.set("Retry-After",String(retry));
  response.headers.set("Cache-Control","no-store");
  return response;
}

export async function POST(request: Request) {
  const rawBody=await request.clone().arrayBuffer();
  if(rawBody.byteLength>MAX_FORM_BYTES)return errorRedirect(request);

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0,254);
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnTo(form.get("return_to"));
  const ip = clientIp(request);

  if (!email || !password || password.length>1024) return errorRedirect(request);

  try {
    const rate = await supabaseAdminRpc<RateCheck>("admin_login_rate_check", {
      p_ip: ip,
      p_email: email,
    });

    if (rate.allowed === false) {
      const retry = Math.max(60, Math.min(1800, Number(rate.retry_after_seconds) || 300));
      return errorRedirect(request,"rate",retry);
    }

    const session = await signInWithPassword(email, password);
    const membership = await getAdminMembershipByUserId(session.user.id);
    if (!session.user.email || !membership?.active) {
      await recordAttempt(ip, email, false);
      return errorRedirect(request);
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
    return errorRedirect(request);
  }
}
