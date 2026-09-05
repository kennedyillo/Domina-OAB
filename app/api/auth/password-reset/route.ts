import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/public-api-security";
import { requestPasswordReset } from "@/lib/supabase";

const MAX_FORM_BYTES=4*1024;

function neutralResponse(request:Request,retry?:string|null){
  const response=NextResponse.redirect(new URL("/recuperar-senha?sent=1",request.url),303);
  if(retry)response.headers.set("Retry-After",retry);
  response.headers.set("Cache-Control","no-store");
  return response;
}

export async function POST(request: Request) {
  const limited=await enforceRateLimit(request,"auth_password_reset",3,900);
  if(limited)return neutralResponse(request,limited.headers.get("Retry-After"));

  const rawBody=await request.clone().arrayBuffer();
  if(rawBody.byteLength>MAX_FORM_BYTES)return neutralResponse(request);

  const form=await request.formData();
  const email=String(form.get("email")??"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254){
    return neutralResponse(request);
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
