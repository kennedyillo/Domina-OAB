import { getAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";

export async function GET(){
 const admin=await getAdminUser();
 if(!admin) return Response.json({error:"Acesso negado."},{status:403});
 const plans=await supabaseAdminRpc("admin_commercial_plans");
 return Response.json({plans});
}

export async function PATCH(request:Request){
 const admin=await getAdminUser();
 if(!admin) return Response.json({error:"Acesso negado."},{status:403});
 try{
  const body=await request.json() as {id?:string;name?:string;price_cents?:number;max_installments?:number;active?:boolean};
  if(!body.id) return Response.json({error:"Plano inválido."},{status:400});
  const result=await supabaseAdminRpc("admin_update_commercial_plan",{
   p_id:body.id,p_name:String(body.name??""),p_price_cents:Number(body.price_cents??0),p_max_installments:Number(body.max_installments??1),p_active:Boolean(body.active),p_actor_email:admin.email,
  });
  return Response.json(result);
 }catch(error){return Response.json({error:error instanceof Error?error.message:"Não foi possível atualizar o plano."},{status:500});}
}
