import { supabaseAdminRpc } from "@/lib/supabase";

export async function POST(request:Request){
  try{
    const body=await request.json() as {question_id?:number;option?:number};
    const questionId=Number(body.question_id);
    const option=Number(body.option);
    if(!Number.isInteger(questionId)||!Number.isInteger(option)||option<0||option>3){
      return Response.json({error:"Resposta inválida."},{status:400});
    }
    const result=await supabaseAdminRpc<{correct:boolean;correct_index:number;explanation:string}>("verify_question",{p_question_id:questionId,p_option:option});
    return Response.json(result);
  }catch{
    return Response.json({error:"Não foi possível verificar a resposta."},{status:500});
  }
}
