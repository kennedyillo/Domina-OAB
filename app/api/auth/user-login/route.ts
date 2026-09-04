import { NextResponse } from "next/server";
import { resolveLoginIdentifier, signInWithPassword, supabaseAccessCookie, supabaseAdminSelect } from "@/lib/supabase";

function safeReturnTo(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value : "/plataforma";
  return text.startsWith("/") && !text.startsWith("//") ? text : "/plataforma";
}

type AdminMembership = { active: boolean };

export async function POST(request: Request) {
  const form = await request.formData();
  const identifier = String(form.get("identifier") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnTo(form.get("return_to"));

  if (!identifier || !password) {
    return NextResponse.redirect(new URL("/entrar?error=1", request.url), 303);
  }

  try {
    const email = await resolveLoginIdentifier(identifier);
    if (!email) return NextResponse.redirect(new URL("/entrar?error=1", request.url), 303);

    const session = await signInWithPassword(email, password);
    const memberships = await supabaseAdminSelect<AdminMembership[]>(
      `admin_members?select=active&user_id=eq.${encodeURIComponent(session.user.id)}&active=eq.true&limit=1`,
    );
    const target = memberships.length > 0 ? "/admin" : returnTo;
    const response = NextResponse.redirect(new URL(target, request.url), 303);
    response.cookies.set(supabaseAccessCookie, session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(300, session.expires_in - 60),
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/entrar?error=1", request.url), 303);
  }
}
