import { NextResponse } from "next/server";
import { signUpWithPassword, supabaseAccessCookie } from "@/lib/supabase";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const fullName = String(form.get("full_name") ?? "").trim();

  if (!email || !email.includes("@") || password.length < 6) {
    return NextResponse.redirect(new URL("/cadastro?error=1", request.url), 303);
  }

  try {
    const result = await signUpWithPassword(email, password, fullName || undefined);
    const response = NextResponse.redirect(new URL("/conta?created=1", request.url), 303);
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
    return NextResponse.redirect(new URL("/cadastro?error=1", request.url), 303);
  }
}
