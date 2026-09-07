import { enforceRateLimit, readJsonWithLimit } from "@/lib/public-api-security";
import { getSupabaseUser, supabaseAdminRpc, supabaseAdminSelect } from "@/lib/supabase";

type VerifyBody={question_id?:number;option?:number};

function json(body:Record<string,unknown>,status=200){
  return Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
}

async function questionBelongsToOpenExam(userId:string,questionId:number){
  const attempts=await supabaseAdminSelect<{id:number}[]>(
    `simulation_attempts?user_id=eq.${encodeURIComponent(userId)}&status=eq.started&mode=eq.exam&select=id&limit=20`,
  );
  if(attempts.length===0)return false;

  const ids=attempts.map(item=>item.id).filter(Number.isSafeInteger);
  if(ids.length===0)return false;
  const rows=await supabaseAdminSelect<{attempt_id:number}[]>(
    `simulation_attempt_questions?attempt_id=in.(${ids.join(",")})&question_id=eq.${questionId}&select=attempt_id&limit=1`,
  );
  return rows.length>0;
}

export async function POST(request:Request){
  try{
    const rateResponse=await enforceRateLimit(request,"question-verify",240,60);
    if(rateResponse) return rateResponse;

    const body=await readJsonWithLimit<VerifyBody>(request,1024);
    const questionId=Number(body.question_id);
    const option=Number(body.option);
    if(!Number.isInteger(questionId)||!Number.isInteger(option)||option<0||option>3){
      return json({error:"Resposta inválida."},400);
    }

    // O endpoint legado continua disponível para estudo/questões avulsas, mas
    // não pode funcionar como um gabarito paralelo dentro de uma tentativa
    // tradicional salva. A correção dessa prova só é liberada no `finish`.
    const user=await getSupabaseUser();
    if(user?.id&&await questionBelongsToOpenExam(user.id,questionId)){
      return json({error:"O gabarito desta questão será liberado após a conclusão do simulado."},409);
    }

    const result=await supabaseAdminRpc<{correct:boolean;correct_index:number;explanation:string}>("verify_question",{p_question_id:questionId,p_option:option});
    return json(result);
  }catch(error){
    const message=error instanceof Error?error.message:"";
    if(message==="payload_too_large") return json({error:"Resposta inválida."},413);
    if(message==="invalid_json"||message.includes("question_not_found")) return json({error:"Resposta inválida."},400);
    return json({error:"Não foi possível verificar a resposta."},500);
  }
}
