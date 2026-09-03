import { requireAdminUser } from "@/lib/admin-access";
import { supabaseAdminRpc } from "@/lib/supabase";

const allowed=new Set(["refund","reversal","chargeback","manual_adjustment"]);

export async function POST(request:Request){
  const user=await requireAdminUser("/admin/financeiro/ajustes");
  try{
    const body=await request.json() as {payment_id?:number|null;adjustment_type?:string;amount_cents?:number;reason?:string};
    const type=String(body.adjustment_type??"");
    const amount=Number(body.amount_cents);
    const paymentId=body.payment_id===null||body.payment_id===undefined?null:Number(body.payment_id);
    const reason=String(body.reason??"").trim();
    if(!allowed.has(type)||!Number.isInteger(amount)||amount===0||reason.length<3|| (paymentId!==null&&!Number.isInteger(paymentId))){
      return Response.json({error:"Ajuste financeiro inválido."},{status:400});
    }
    const result=await supabaseAdminRpc<{ok:boolean;id:number}>("admin_record_financial_adjustment",{
      p_payment_id:paymentId,
      p_adjustment_type:type,
      p_amount_cents:amount,
      p_reason:reason,
      p_actor_user_id:user.id,
      p_actor_role:"admin",
    });
    return Response.json(result,{status:201});
  }catch(e){
    return Response.json({error:e instanceof Error?e.message:"Não foi possível registrar o ajuste."},{status:500});
  }
}
