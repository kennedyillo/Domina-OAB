import { getSupabaseUser,supabaseAdminRpc } from "@/lib/supabase";

export async function GET(){
  const user=await getSupabaseUser();
  if(!user?.id) return Response.json({error:"Faça login para acessar seu diagnóstico."},{status:401});
  try{
    const data=await supabaseAdminRpc("student_diagnostics",{p_user_id:user.id});
    return Response.json(data);
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"Não foi possível carregar seu diagnóstico."},{status:500});
  }
}
