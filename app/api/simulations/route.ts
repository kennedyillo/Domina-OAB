import { enforceRateLimit,readJsonWithLimit } from "@/lib/public-api-security";
import { getSupabaseUser,supabaseAdminRpc } from "@/lib/supabase";

const MAX_SLUG_LENGTH=120;

function noStore(body:Record<string,unknown>,status=200){
  return Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
}

function positiveInteger(value:unknown){
  const number=typeof value==="number"?value:Number(value);
  return Number.isSafeInteger(number)&&number>0?number:null;
}

function optionIndex(value:unknown){
  const number=typeof value==="number"?value:Number(value);
  return Number.isInteger(number)&&number>=0&&number<=3?number:null;
}

function validOptionOrder(value:unknown):number[]|null{
  if(!Array.isArray(value)||value.length!==4)return null;
  const order=value.map(Number);
  if(order.some((item)=>!Number.isInteger(item)||item<0||item>3))return null;
  return new Set(order).size===4?order:null;
}

export async function GET(request:Request){
  const user=await getSupabaseUser();
  const url=new URL(request.url);
  const slug=(url.searchParams.get("slug")?.trim()||"simulado-etica").slice(0,MAX_SLUG_LENGTH);
  if(!/^[a-z0-9-]+$/.test(slug))return noStore({error:"Simulado inválido."},400);

  try{
    const data=await supabaseAdminRpc<Record<string,unknown>>("prepare_simulation",{p_user_id:user?.id??null,p_slug:slug});
    return noStore(data);
  }catch(error){
    const message=error instanceof Error?error.message:"";
    if(message.includes("simulation_not_available")) return noStore({error:"Este simulado não está disponível."},404);
    if(message.includes("insufficient_published_questions")) return noStore({error:"O simulado não possui questões publicadas suficientes."},409);
    return noStore({error:"Não foi possível preparar o simulado agora."},500);
  }
}

export async function POST(request:Request){
  const rateLimited=await enforceRateLimit(request,"simulation_runtime",300,60);
  if(rateLimited)return rateLimited;

  const user=await getSupabaseUser();
  let body:{
    action?:"answer"|"finish";
    attempt_id?:number|null;
    question_id?:number;
    selected_index?:number;
    option_order?:number[];
  };
  try{
    body=await readJsonWithLimit<typeof body>(request,4*1024);
  }catch(error){
    const tooLarge=error instanceof Error&&error.message==="payload_too_large";
    return noStore({error:tooLarge?"Payload excede o limite permitido.":"Payload inválido."},tooLarge?413:400);
  }

  try{
    if(body.action==="answer"){
      const attemptId=body.attempt_id==null?null:positiveInteger(body.attempt_id);
      const questionId=positiveInteger(body.question_id);
      const selectedIndex=optionIndex(body.selected_index);
      if(body.attempt_id!=null&&!attemptId)return noStore({error:"Tentativa inválida."},400);
      if(!questionId||selectedIndex==null)return noStore({error:"Resposta inválida."},400);

      // Em tentativas persistidas, a ordem autoritativa já está salva no banco.
      // O cliente só fornece option_order para modo visitante, que não persiste score/ranking.
      const guestOrder=attemptId===null?validOptionOrder(body.option_order):null;
      if(attemptId===null&&!guestOrder)return noStore({error:"Ordem de alternativas inválida."},400);

      const result=await supabaseAdminRpc<Record<string,unknown>>("verify_simulation_answer",{
        p_user_id:user?.id??null,
        p_attempt_id:attemptId,
        p_question_id:questionId,
        p_selected_index:selectedIndex,
        p_option_order:guestOrder,
      });
      if(result.expired===true)return noStore({error:"O tempo do simulado terminou.",expired:true,answer_locked:true},409);
      return noStore(result);
    }

    if(body.action==="finish"){
      if(!user?.id)return noStore({guest:true});
      const attemptId=positiveInteger(body.attempt_id);
      if(!attemptId)return noStore({error:"Tentativa inválida."},400);
      const result=await supabaseAdminRpc<Record<string,unknown>>("finish_simulation_v2",{p_user_id:user.id,p_attempt_id:attemptId});
      return noStore(result);
    }
    return noStore({error:"Ação inválida."},400);
  }catch(error){
    const message=error instanceof Error?error.message:"";
    if(message.includes("simulation_expired")) return noStore({error:"O tempo do simulado terminou.",expired:true},409);
    if(message.includes("attempt_not_found")||message.includes("question_not_in_attempt")) return noStore({error:"Tentativa ou questão inválida."},404);
    if(message.includes("invalid_option")||message.includes("invalid_option_order")) return noStore({error:"Resposta inválida."},400);
    return noStore({error:"Não foi possível registrar o simulado agora."},500);
  }
}
