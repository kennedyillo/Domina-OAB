import { getSupabaseUser,supabaseAdminRpc } from "@/lib/supabase";

export async function GET(request:Request){
  const user=await getSupabaseUser();
  const url=new URL(request.url);
  const slug=url.searchParams.get("slug")?.trim()||"simulado-etica";
  try{
    const data=await supabaseAdminRpc("prepare_simulation",{p_user_id:user?.id??null,p_slug:slug});
    return Response.json(data);
  }catch(error){
    const message=error instanceof Error?error.message:"Não foi possível preparar o simulado.";
    if(message.includes("simulation_not_available")) return Response.json({error:"Este simulado não está disponível."},{status:404});
    if(message.includes("insufficient_published_questions")) return Response.json({error:"O simulado não possui questões publicadas suficientes."},{status:409});
    return Response.json({error:message},{status:500});
  }
}

export async function POST(request:Request){
  const user=await getSupabaseUser();
  try{
    const body=await request.json() as {
      action?:"answer"|"finish";
      attempt_id?:number|null;
      question_id?:number;
      selected_index?:number;
      option_order?:number[];
      response_time_ms?:number;
    };
    if(body.action==="answer"){
      const result=await supabaseAdminRpc("verify_simulation_answer",{
        p_user_id:user?.id??null,
        p_attempt_id:body.attempt_id?Number(body.attempt_id):null,
        p_question_id:Number(body.question_id),
        p_selected_index:Number(body.selected_index),
        p_option_order:Array.isArray(body.option_order)?body.option_order.map(Number):null,
      });
      if(user?.id&&body.attempt_id&&Number.isFinite(body.response_time_ms)){
        await supabaseAdminRpc("record_simulation_answer_timing",{
          p_user_id:user.id,
          p_attempt_id:Number(body.attempt_id),
          p_question_id:Number(body.question_id),
          p_response_time_ms:Math.max(0,Math.min(3600000,Math.round(Number(body.response_time_ms)))),
        });
      }
      return Response.json(result);
    }
    if(body.action==="finish"){
      if(!user?.id||!body.attempt_id) return Response.json({guest:true});
      const result=await supabaseAdminRpc("finish_simulation_v2",{p_user_id:user.id,p_attempt_id:Number(body.attempt_id)});
      return Response.json(result);
    }
    return Response.json({error:"Ação inválida."},{status:400});
  }catch(error){
    const message=error instanceof Error?error.message:"Não foi possível registrar o simulado.";
    if(message.includes("simulation_expired")) return Response.json({error:"O tempo do simulado terminou.",expired:true},{status:409});
    return Response.json({error:message},{status:500});
  }
}
