import { supabaseAdminRpc } from "@/lib/supabase";

type PublicQuestion = {
  id:number;
  code:string;
  discipline_slug:string;
  discipline:string;
  topic:string|null;
  statement:string;
  options:string[];
  difficulty:"easy"|"medium"|"hard";
  position:number;
};

export async function GET(request:Request){
  const url=new URL(request.url);
  const discipline=url.searchParams.get("discipline")?.trim()||"etica-profissional";
  try{
    const questions=await supabaseAdminRpc<PublicQuestion[]>("public_questions",{p_discipline_slug:discipline});
    return Response.json({questions});
  }catch{
    return Response.json({error:"Não foi possível carregar as questões."},{status:500});
  }
}
