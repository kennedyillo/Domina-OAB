import { getAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";

export async function GET(request:Request){
  const admin=await getAdminUser();
  if(!admin) return Response.json({error:"Acesso negado."},{status:403});
  const url=new URL(request.url);
  const historyId=Number(url.searchParams.get("history_id"));
  if(Number.isInteger(historyId)&&historyId>0){
    const versions=await supabaseAdminRpc("admin_question_versions",{p_question_id:historyId});
    return Response.json({versions});
  }
  const q=url.searchParams.get("q")?.trim()||null;
  const status=url.searchParams.get("status")?.trim()||null;
  const questions=await supabaseAdminRpc("admin_questions",{p_query:q,p_status:status});
  return Response.json({questions});
}

export async function POST(request:Request){
  const admin=await getAdminUser();
  if(!admin) return Response.json({error:"Acesso negado."},{status:403});
  try{
    const body=await request.json() as Record<string,unknown>;
    const action=String(body.action??"");
    if(action==="duplicate"){
      const id=Number(body.id);
      if(!Number.isInteger(id)) return Response.json({error:"Questão inválida."},{status:400});
      return Response.json(await supabaseAdminRpc("admin_duplicate_question",{p_id:id,p_actor_email:admin.email}),{status:201});
    }
    if(action==="import"){
      const items=Array.isArray(body.items)?body.items:[];
      if(items.length===0) return Response.json({error:"Nenhuma questão para importar."},{status:400});
      return Response.json(await supabaseAdminRpc("admin_import_questions",{p_items:items,p_actor_email:admin.email}));
    }
    const options=Array.isArray(body.options)?body.options.map(String):[];
    if(options.length!==4) return Response.json({error:"A questão precisa ter quatro alternativas."},{status:400});
    const result=await supabaseAdminRpc("admin_save_question_v3",{
      p_id:body.id?Number(body.id):null,
      p_code:String(body.code??""),
      p_discipline_slug:String(body.discipline_slug??"etica-profissional"),
      p_topic:String(body.topic??""),
      p_statement:String(body.statement??""),
      p_options:options,
      p_correct_index:Number(body.correct_index),
      p_explanation:String(body.explanation??""),
      p_source_label:String(body.source_label??""),
      p_difficulty:String(body.difficulty??"medium"),
      p_status:String(body.status??"draft"),
      p_exam_name:String(body.exam_name??""),
      p_exam_edition:String(body.exam_edition??""),
      p_exam_phase:String(body.exam_phase??""),
      p_subtopic:String(body.subtopic??""),
      p_incidence:String(body.incidence??"medium"),
      p_actor_email:admin.email,
    });
    return Response.json(result,{status:body.id?200:201});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Não foi possível salvar a questão."},{status:500});}
}

export async function PATCH(request:Request){
  const admin=await getAdminUser();
  if(!admin) return Response.json({error:"Acesso negado."},{status:403});
  try{
    const body=await request.json() as {id?:number;status?:string};
    const id=Number(body.id);const status=String(body.status??"");
    if(!Number.isInteger(id)||!["draft","reviewing","published","suspended","archived"].includes(status)) return Response.json({error:"Alteração inválida."},{status:400});
    await supabaseAdminRpc("admin_set_question_status_v3",{p_id:id,p_status:status,p_actor_email:admin.email});
    return Response.json({ok:true});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Não foi possível atualizar a questão."},{status:500});}
}
