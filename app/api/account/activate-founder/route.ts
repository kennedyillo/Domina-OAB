import { NextResponse } from "next/server";
import { getStudentSessionState } from "@/lib/account-access";
import { supabaseAdminRpc } from "@/lib/supabase";

const MAX_FORM_BYTES=4*1024;

function redirect(request:Request,path:string){
  const response=NextResponse.redirect(new URL(path,request.url),303);
  response.headers.set("Cache-Control","no-store");
  return response;
}

export async function POST(request: Request) {
  const session=await getStudentSessionState();
  if(session.state==="anonymous"||!session.user.email){
    return redirect(request,"/entrar?return_to=/ativar-fundador");
  }
  if(session.state==="inactive")return redirect(request,"/entrar?error=1");

  const rawBody=await request.clone().arrayBuffer();
  if(rawBody.byteLength>MAX_FORM_BYTES)return redirect(request,"/ativar-fundador?error=1");

  const form = await request.formData();
  const fullName = String(form.get("full_name") ?? "").trim().slice(0,160);
  const cpf = String(form.get("cpf") ?? "").trim().slice(0,32);
  const phone = String(form.get("phone") ?? "").trim().slice(0,32);

  try {
    await supabaseAdminRpc("activate_founder_access_v2", {
      p_user_id: session.user.id,
      p_email: session.user.email,
      p_cpf: cpf,
      p_phone: phone,
      p_full_name: fullName || null,
    });
    return redirect(request,"/plataforma?founder=active");
  } catch (error) {
    const message = error instanceof Error ? error.message : "activation_failed";
    const code = message.includes("cpf_already_in_use") ? "cpf"
      : message.includes("phone_already_in_use") ? "phone"
      : message.includes("founder_slots_full") ? "full"
      : "1";
    return redirect(request,`/ativar-fundador?error=${code}`);
  }
}
