import { getStudentSessionState } from "@/lib/account-access";
import { supabaseAdminSelect, supabaseAdminUpsert } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES=4*1024;

type PreferencesPayload = {
  marketing_opt_in?: unknown;
  study_reminders?: unknown;
};

type PreferenceRow = {
  user_id:string;
  email:string;
  marketing_opt_in:boolean;
  study_reminders:boolean;
  transactional_enabled:boolean;
  unsubscribed_at:string|null;
  consent_version:string|null;
};

function json(body:Record<string,unknown>,status=200){
  return Response.json(body,{status,headers:{"cache-control":"no-store"}});
}

function defaults(){
  return {
    marketing_opt_in:false,
    study_reminders:false,
    transactional_enabled:true,
    unsubscribed_at:null,
    consent_version:null,
  };
}

async function currentPreferences(userId:string){
  const rows=await supabaseAdminSelect<PreferenceRow[]>(
    `communication_preferences?select=user_id,email,marketing_opt_in,study_reminders,transactional_enabled,unsubscribed_at,consent_version&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  return rows[0]??null;
}

export async function GET() {
  const session=await getStudentSessionState();
  if(session.state==="anonymous")return json({error:"Faça login para ver suas preferências."},401);
  if(session.state==="inactive")return json({error:"Conta indisponível."},403);

  try{
    const row=await currentPreferences(session.user.id);
    return json({preferences:row?{
      marketing_opt_in:row.marketing_opt_in,
      study_reminders:row.study_reminders,
      transactional_enabled:row.transactional_enabled,
      unsubscribed_at:row.unsubscribed_at,
      consent_version:row.consent_version,
    }:defaults()});
  }catch{
    return json({error:"Não foi possível carregar suas preferências."},500);
  }
}

export async function POST(request: Request) {
  const session=await getStudentSessionState();
  if(session.state==="anonymous")return json({error:"Faça login para alterar suas preferências."},401);
  if(session.state==="inactive")return json({error:"Conta indisponível."},403);
  if(!session.user.email)return json({error:"Conta sem e-mail disponível."},400);

  const declaredLength=Number(request.headers.get("content-length")||"0");
  if(Number.isFinite(declaredLength)&&declaredLength>MAX_BODY_BYTES)return json({error:"Requisição inválida."},413);

  try {
    const raw=await request.text();
    if(new TextEncoder().encode(raw).byteLength>MAX_BODY_BYTES)return json({error:"Requisição inválida."},413);

    const body=JSON.parse(raw) as PreferencesPayload;
    if(typeof body.marketing_opt_in!=="boolean"||typeof body.study_reminders!=="boolean"){
      return json({error:"Preferências inválidas."},400);
    }

    const existing=await currentPreferences(session.user.id);
    const unsubscribedAt=body.marketing_opt_in||body.study_reminders
      ? null
      : existing?.unsubscribed_at??new Date().toISOString();

    await supabaseAdminUpsert<PreferenceRow[]>("communication_preferences",{
      user_id:session.user.id,
      email:session.user.email.toLowerCase(),
      marketing_opt_in:body.marketing_opt_in,
      study_reminders:body.study_reminders,
      transactional_enabled:true,
      opt_in_source:"account",
      consent_version:"2026-09",
      unsubscribed_at:unsubscribedAt,
      updated_at:new Date().toISOString(),
    },"user_id");

    return json({
      ok:true,
      marketing_opt_in:body.marketing_opt_in,
      study_reminders:body.study_reminders,
      unsubscribed:!body.marketing_opt_in&&!body.study_reminders,
    });
  } catch {
    return json({error:"Não foi possível salvar as preferências."},500);
  }
}
