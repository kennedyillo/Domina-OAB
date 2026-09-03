import { supabaseAdminRpc } from "@/lib/supabase";

const reasons=new Set(["gabarito","enunciado","explicacao","desatualizada","duplicada","outro"]);

export async function POST(request:Request){
  try{
    const body=await request.json() as {question_id?:number;reason?:string;message?:string};
    const questionId=Number(body.question_id);
    const reason=String(body.reason??"");
    const message=String(body.message??"").trim();
    if(!Number.isInteger(questionId)||!reasons.has(reason)){
      return Response.json({error:"Reporte inválido."},{status:400});
    }
    const result=await supabaseAdminRpc<{ok:boolean;report_id:number}>("report_question",{p_question_id:questionId,p_reason:reason,p_message:message||null});
    return Response.json(result,{status:201});
  }catch{
    return Response.json({error:"Não foi possível enviar o reporte."},{status:500});
  }
}
