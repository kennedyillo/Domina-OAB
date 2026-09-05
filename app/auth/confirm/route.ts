import { NextResponse } from "next/server";
import { supabaseAccessCookie, verifyRecoveryTokenHash } from "@/lib/supabase";

function fail(request:Request){
  const response=NextResponse.redirect(new URL("/recuperar-senha?error=link",request.url),303);
  response.headers.set("cache-control","private, no-store");
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash")?.trim() ?? "";
  const type = url.searchParams.get("type")?.trim() ?? "";

  if (!tokenHash || tokenHash.length>2048 || type !== "recovery") return fail(request);

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
    return fail(request);
  }
}
