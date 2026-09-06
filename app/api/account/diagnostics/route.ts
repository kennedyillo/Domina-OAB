import { getStudentSessionState } from "@/lib/account-access";
import { supabaseAdminRpc } from "@/lib/supabase";

function json(body:Record<string,unknown>,status=200){
  return Response.json(body,{status,headers:{"cache-control":"no-store"}});
}

export async function GET(){
  const session=await getStudentSessionState();
  if(session.state==="anonymous")return json({error:"Faça login para acessar seu diagnóstico."},401);
  if(session.state==="inactive")return json({error:"Conta indisponível."},403);

  try{
    const data=await supabaseAdminRpc<Record<string,unknown>>("student_diagnostics",{p_user_id:session.user.id});
    return json(data);
  }catch{
    return json({error:"Não foi possível carregar seu diagnóstico."},500);
  }
}
