import { enforceRateLimit, readJsonWithLimit } from "@/lib/public-api-security";
import { supabaseAdminRpc } from "@/lib/supabase";

const reasons=new Set(["gabarito","enunciado","explicacao","desatualizada","duplicada","outro"]);

type ReportBody={question_id?:number;reason?:string;message?:string};

export async function POST(request:Request){
  try{
    const rateResponse=await enforceRateLimit(request,"question-report",12,600);
    if(rateResponse) return rateResponse;

    const body=await readJsonWithLimit<ReportBody>(request,4096);
    const questionId=Number(body.question_id);
    const reason=String(body.reason??"");
    const message=String(body.message??"").trim();
    if(!Number.isInteger(questionId)||!reasons.has(reason)||message.length>1000){
      return Response.json({error:"Reporte inválido."},{status:400});
    }
    const result=await supabaseAdminRpc<{ok:boolean;report_id:number}>("report_question",{p_question_id:questionId,p_reason:reason,p_message:message||null});
    return Response.json(result,{status:201});
  }catch(error){
    const message=error instanceof Error?error.message:"";
    if(message==="payload_too_large") return Response.json({error:"Reporte inválido."},{status:413});
    if(message==="invalid_json") return Response.json({error:"Reporte inválido."},{status:400});
    if(message.includes("question_not_found")) return Response.json({error:"Reporte inválido."},{status:400});
    return Response.json({error:"Não foi possível enviar o reporte."},{status:500});
  }
}
