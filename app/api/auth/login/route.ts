import { NextResponse } from "next/server";
import { signInWithPassword, supabaseAccessCookie } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin-access";

function safeReturnTo(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value : "/admin";
  return text.startsWith("/") && !text.startsWith("//") ? text : "/admin";
}

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnTo(form.get("return_to"));

  if (!isAdminEmail(email) || !password) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }

  try {
    const session = await signInWithPassword(email, password);
    if (!session.user.email || !isAdminEmail(session.user.email)) {
      return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
    }

    const response = NextResponse.redirect(new URL(returnTo, request.url), 303);
    response.cookies.set(supabaseAccessCookie, session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(300, session.expires_in - 60),
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }
}
