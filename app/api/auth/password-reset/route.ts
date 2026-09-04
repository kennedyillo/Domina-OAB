import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/supabase";

function neutralResponse(request:Request){
  const response=NextResponse.redirect(new URL("/recuperar-senha?sent=1",request.url),303);
  response.headers.set("Cache-Control","no-store");
  return response;
}

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
  }catch{
    // Resposta deliberadamente neutra: não revela se a conta existe,
    // se o provedor aplicou rate limit ou se não enviou uma mensagem.
  }
  return neutralResponse(request);
}
