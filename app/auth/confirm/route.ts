import { NextResponse } from "next/server";
import { supabaseAccessCookie, verifyRecoveryTokenHash } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash")?.trim() ?? "";
  const type = url.searchParams.get("type")?.trim() ?? "";

  if (!tokenHash || type !== "recovery") {
    return NextResponse.redirect(new URL("/recuperar-senha?error=link", request.url), 303);
  }

  try {
    const session = await verifyRecoveryTokenHash(tokenHash);
    if (!session.access_token || !session.expires_in) throw new Error("recovery_session_missing");

    const response = NextResponse.redirect(new URL("/redefinir-senha?recovery=1", request.url), 303);
    response.cookies.set(supabaseAccessCookie, session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(300, session.expires_in - 60),
    });
    response.headers.set("cache-control", "private, no-store");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/recuperar-senha?error=link", request.url), 303);
  }
}
