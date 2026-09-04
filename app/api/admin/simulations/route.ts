import { adminCan, getAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";

function forbidden(){return Response.json({error:"Acesso negado."},{status:403});}

export async function GET(){
  const admin=await getAdminUser();
  if(!admin||!adminCan(admin.role,"content:view")) return forbidden();
  const [analytics,definitions]=await Promise.all([
    supabaseAdminRpc("admin_simulations"),
    supabaseAdminRpc("admin_simulation_definitions"),
  ]);
  return Response.json({...(analytics as Record<string,unknown>),definitions});
}

export async function POST(request:Request){
  const admin=await getAdminUser();
  if(!admin||!adminCan(admin.role,"content:edit")) return forbidden();
  try{
    const body=await request.json() as Record<string,unknown>;
    const result=await supabaseAdminRpc("admin_save_simulation_definition_v3",{
      p_id:body.id?Number(body.id):null,
      p_slug:String(body.slug??""),
      p_name:String(body.name??""),
      p_description:String(body.description??""),
      p_discipline_slug:String(body.discipline_slug??""),
      p_topic_ids:Array.isArray(body.topic_ids)?body.topic_ids.map(Number):[],
      p_question_count:Number(body.question_count??0),
      p_time_limit_minutes:body.time_limit_minutes===null||body.time_limit_minutes===""?null:Number(body.time_limit_minutes),
      p_randomize_questions:Boolean(body.randomize_questions),
      p_randomize_options:Boolean(body.randomize_options),
      p_use_incidence_weights:body.use_incidence_weights!==false,
      p_status:String(body.status??"draft"),
      p_actor_email:admin.email,
    });
    return Response.json(result,{status:body.id?200:201});
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"Não foi possível salvar o simulado."},{status:500});
  }
}

export async function PATCH(request:Request){
  const admin=await getAdminUser();
  if(!admin||!adminCan(admin.role,"content:edit")) return forbidden();
  try{
    const body=await request.json() as {id?:number;status?:string};
    const id=Number(body.id);
    const status=String(body.status??"");
    if(!Number.isInteger(id)||!["draft","published","paused","archived"].includes(status)) return Response.json({error:"Alteração inválida."},{status:400});
    await supabaseAdminRpc("admin_set_simulation_definition_status",{p_id:id,p_status:status,p_actor_email:admin.email});
    return Response.json({ok:true});
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"Não foi possível atualizar o simulado."},{status:500});
  }
}
