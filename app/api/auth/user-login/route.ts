import { NextResponse } from "next/server";
import { clientIp } from "@/lib/public-api-security";
import { resolveLoginIdentifier, signInWithPassword, supabaseAccessCookie, supabaseAdminRpc, supabaseAdminSelect } from "@/lib/supabase";

const MAX_FORM_BYTES=8*1024;

function safeReturnTo(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value : "/plataforma";
  return text.length<=2048&&text.startsWith("/")&&!text.startsWith("//") ? text : "/plataforma";
}

type AdminMembership = { active: boolean };
type AccountRow={account_status:"active"|"blocked"|"cancelled"};
type RateCheck = { allowed?: boolean; retry_after_seconds?: number };

async function recordAttempt(ip:string,identifier:string,succeeded:boolean){
  await supabaseAdminRpc<void>("admin_login_record",{
    p_ip:ip,
    p_email:identifier,
    p_succeeded:succeeded,
  });
}

function errorRedirect(request:Request){
  const response=NextResponse.redirect(new URL("/entrar?error=1",request.url),303);
  response.headers.set("Cache-Control","no-store");
  return response;
}

export async function POST(request: Request) {
  const rawBody=await request.clone().arrayBuffer();
  if(rawBody.byteLength>MAX_FORM_BYTES)return errorRedirect(request);

  const form = await request.formData();
  const identifier = String(form.get("identifier") ?? "").trim();
  const normalizedIdentifier=identifier.toLowerCase().slice(0,320);
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnTo(form.get("return_to"));
  const ip=clientIp(request);

  if (!normalizedIdentifier || !password || password.length>1024) return errorRedirect(request);

  try {
    const rate=await supabaseAdminRpc<RateCheck>("admin_login_rate_check",{
      p_ip:ip,
      p_email:normalizedIdentifier,
    });
    if(rate.allowed===false){
      const response=errorRedirect(request);
      response.headers.set("Retry-After",String(Math.max(60,Math.min(1800,Number(rate.retry_after_seconds)||300))));
      return response;
    }

    const email = await resolveLoginIdentifier(normalizedIdentifier);
    if (!email) {
      await recordAttempt(ip,normalizedIdentifier,false);
      return errorRedirect(request);
    }

    const session = await signInWithPassword(email, password);
    const memberships = await supabaseAdminSelect<AdminMembership[]>(
      `admin_members?select=active&user_id=eq.${encodeURIComponent(session.user.id)}&active=eq.true&limit=1`,
    );

    // Papel administrativo e status da conta de aluno são domínios separados.
    // Um admin ativo continua podendo acessar /admin; uma conta comum bloqueada/cancelada
    // não recebe cookie de sessão da aplicação mesmo que a senha no Auth esteja correta.
    if(memberships.length===0){
      const profiles=await supabaseAdminSelect<AccountRow[]>(
        `user_profiles?select=account_status&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`,
      );
      if(profiles[0]&&profiles[0].account_status!=="active"){
        await recordAttempt(ip,normalizedIdentifier,false);
        return errorRedirect(request);
      }
    }

    await recordAttempt(ip,normalizedIdentifier,true);
    const target = memberships.length > 0 ? "/admin" : returnTo;
    const response = NextResponse.redirect(new URL(target, request.url), 303);
    response.cookies.set(supabaseAccessCookie, session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(300, session.expires_in - 60),
    });
    response.headers.set("Cache-Control","no-store");
    return response;
  } catch {
    try{await recordAttempt(ip,normalizedIdentifier,false);}catch{}
    return errorRedirect(request);
  }
}
