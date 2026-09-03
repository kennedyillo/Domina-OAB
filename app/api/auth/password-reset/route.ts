import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/supabase";

export async function POST(request: Request) {
  const form=await request.formData();
  const email=String(form.get("email")??"").trim().toLowerCase();
  if(!email||!email.includes("@")||email.length>320){
    return NextResponse.redirect(new URL("/recuperar-senha?error=1",request.url),303);
  }

  const configuredOrigin=process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/,"");
  const origin=configuredOrigin||new URL(request.url).origin;
  const redirectTo=`${origin}/redefinir-senha`;

  try{
    await requestPasswordReset(email,redirectTo);
    return NextResponse.redirect(new URL("/recuperar-senha?sent=1",request.url),303);
  }catch{
    return NextResponse.redirect(new URL("/recuperar-senha?error=1",request.url),303);
  }
}
