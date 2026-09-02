import { NextResponse } from "next/server";
import { supabaseAccessCookie } from "@/lib/supabase";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(supabaseAccessCookie, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
