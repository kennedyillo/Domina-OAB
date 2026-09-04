import { enforceRateLimit, readJsonWithLimit } from "@/lib/public-api-security";
import { supabaseAdminRpc } from "@/lib/supabase";

type VerifyBody={question_id?:number;option?:number};

export async function POST(request:Request){
  try{
    const rateResponse=await enforceRateLimit(request,"question-verify",240,60);
    if(rateResponse) return rateResponse;

    const body=await readJsonWithLimit<VerifyBody>(request,1024);
    const questionId=Number(body.question_id);
    const option=Number(body.option);
    if(!Number.isInteger(questionId)||!Number.isInteger(option)||option<0||option>3){
      return Response.json({error:"Resposta inválida."},{status:400});
    }
    const result=await supabaseAdminRpc<{correct:boolean;correct_index:number;explanation:string}>("verify_question",{p_question_id:questionId,p_option:option});
    return Response.json(result);
  }catch(error){
    const message=error instanceof Error?error.message:"";
    if(message==="payload_too_large") return Response.json({error:"Resposta inválida."},{status:413});
    if(message==="invalid_json"||message.includes("question_not_found")) return Response.json({error:"Resposta inválida."},{status:400});
    return Response.json({error:"Não foi possível verificar a resposta."},{status:500});
  }
}
