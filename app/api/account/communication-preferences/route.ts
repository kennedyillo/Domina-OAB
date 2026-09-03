import { getSupabaseUser,supabaseAdminRpc } from "@/lib/supabase";

export async function POST(request:Request){
 const user=await getSupabaseUser();
 if(!user?.id) return Response.json({error:"Faça login para alterar suas preferências."},{status:401});
 try{
  const body=await request.json() as {marketing_opt_in?:boolean;study_reminders?:boolean};
  const result=await supabaseAdminRpc("set_my_communication_preferences",{
   p_user_id:user.id,p_marketing_opt_in:Boolean(body.marketing_opt_in),p_study_reminders:Boolean(body.study_reminders),
  });
  return Response.json(result);
 }catch(error){return Response.json({error:error instanceof Error?error.message:"Não foi possível salvar as preferências."},{status:500});}
}
