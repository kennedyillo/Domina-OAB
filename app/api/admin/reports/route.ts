import { getAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";

export async function GET(request:Request){
  const admin=await getAdminUser();
  if(!admin) return Response.json({error:"Acesso negado."},{status:403});
  const url=new URL(request.url);
  const status=url.searchParams.get("status")?.trim()||null;
  const reports=await supabaseAdminRpc("admin_reports",{p_status:status});
  return Response.json({reports});
}

export async function PATCH(request:Request){
  const admin=await getAdminUser();
  if(!admin) return Response.json({error:"Acesso negado."},{status:403});
  try{
    const body=await request.json() as {
      id?:number;
      status?:"open"|"reviewing"|"resolved"|"dismissed";
      note?:string;
      priority?:"low"|"normal"|"high"|"critical";
      assigned_to_email?:string|null;
    };
    const id=Number(body.id);
    if(!Number.isInteger(id)) return Response.json({error:"Reporte inválido."},{status:400});
    if(body.status && !["open","reviewing","resolved","dismissed"].includes(body.status)) return Response.json({error:"Situação inválida."},{status:400});
    if(body.priority && !["low","normal","high","critical"].includes(body.priority)) return Response.json({error:"Prioridade inválida."},{status:400});

    await supabaseAdminRpc("admin_update_report",{
      p_id:id,
      p_status:body.status??null,
      p_note:body.note??null,
      p_priority:body.priority??null,
      p_assigned_to_email:body.assigned_to_email===undefined?null:body.assigned_to_email,
      p_actor_email:admin.email,
    });
    return Response.json({ok:true});
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"Não foi possível atualizar o reporte."},{status:500});
  }
}
