import { getStudentSessionState } from "@/lib/account-access";
import { supabaseAdminRpc } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES=4*1024;

type PreferencesPayload = {
  marketing_opt_in?: unknown;
  study_reminders?: unknown;
};

function json(body:Record<string,unknown>,status=200){
  return Response.json(body,{status,headers:{"cache-control":"no-store"}});
}

export async function GET() {
  const session=await getStudentSessionState();
  if(session.state==="anonymous")return json({error:"Faça login para ver suas preferências."},401);
  if(session.state==="inactive")return json({error:"Conta indisponível."},403);

  try{
    const preferences=await supabaseAdminRpc("my_communication_preferences",{p_user_id:session.user.id});
    return json({preferences});
  }catch{
    return json({error:"Não foi possível carregar suas preferências."},500);
  }
}

export async function POST(request: Request) {
  const session=await getStudentSessionState();
  if(session.state==="anonymous")return json({error:"Faça login para alterar suas preferências."},401);
  if(session.state==="inactive")return json({error:"Conta indisponível."},403);

  const declaredLength=Number(request.headers.get("content-length")||"0");
  if(Number.isFinite(declaredLength)&&declaredLength>MAX_BODY_BYTES)return json({error:"Requisição inválida."},413);

  try {
    const raw=await request.text();
    if(new TextEncoder().encode(raw).byteLength>MAX_BODY_BYTES)return json({error:"Requisição inválida."},413);

    const body=JSON.parse(raw) as PreferencesPayload;
    if(typeof body.marketing_opt_in!=="boolean"||typeof body.study_reminders!=="boolean"){
      return json({error:"Preferências inválidas."},400);
    }

    const result=await supabaseAdminRpc<Record<string,unknown>>("set_my_communication_preferences",{
      p_user_id:session.user.id,
      p_marketing_opt_in:body.marketing_opt_in,
      p_study_reminders:body.study_reminders,
    });

    return json(result);
  } catch {
    return json({error:"Não foi possível salvar as preferências."},500);
  }
}
