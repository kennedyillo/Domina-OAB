import { adminCan, getAdminUser } from "@/lib/admin-access";
import { readJsonWithLimit } from "@/lib/public-api-security";
import { supabaseAdminRpc } from "@/lib/supabase";

type AdminUserRow = {
  user_id: string;
  full_name: string | null;
  cpf_masked: string | null;
  email: string;
  phone: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  cpf_verified: boolean;
  account_status: "active" | "blocked" | "cancelled";
  created_at: string;
  founder_status: "reserved" | "active" | "expired" | "cancelled" | "none";
  founder_activated_at: string | null;
  founder_expires_at: string | null;
  active_plan: string | null;
  access_ends_at: string | null;
  days_remaining: number | null;
};

type UserAction="block"|"unblock"|"cancel_account"|"cancel_access"|"extend_access";
const ACTIONS=new Set<UserAction>(["block","unblock","cancel_account","cancel_access","extend_access"]);
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body:Record<string,unknown>,status=200){
  return Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
}

function forbidden(){return json({error:"Acesso negado."},403);}

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin || !adminCan(admin.role, "users:view")) return forbidden();

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim().slice(0,200) || null;
  const users = await supabaseAdminRpc<AdminUserRow[]>("admin_users", { p_query: query });
  return json({ users });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin || !adminCan(admin.role, "users:manage")) return forbidden();

  let body:{user_id?:unknown;action?:unknown;days?:unknown};
  try{body=await readJsonWithLimit<typeof body>(request,4*1024);}catch(error){
    const tooLarge=error instanceof Error&&error.message==="payload_too_large";
    return json({error:tooLarge?"Payload excede o limite permitido.":"Dados inválidos."},tooLarge?413:400);
  }

  const userId=typeof body.user_id==="string"?body.user_id.trim():"";
  const action=typeof body.action==="string"&&ACTIONS.has(body.action as UserAction)?body.action as UserAction:null;
  if(!UUID_RE.test(userId)||!action)return json({error:"Ação inválida."},400);

  let days:number|null=null;
  if(action==="extend_access"){
    days=Number(body.days??0);
    if(!Number.isInteger(days)||days<1||days>730)return json({error:"Informe entre 1 e 730 dias."},400);
  }

  try {
    await supabaseAdminRpc("admin_manage_user_v2",{
      p_user_id:userId,
      p_action:action,
      p_days:days,
      p_actor_user_id:admin.id,
      p_actor_role:admin.role,
      p_request_id:request.headers.get("x-vercel-id")??request.headers.get("x-request-id"),
    });
    return json({ok:true});
  } catch (error) {
    const message=error instanceof Error?error.message:"";
    if(message.includes("user_not_found"))return json({error:"Usuário não encontrado."},404);
    if(message.includes("active_access_not_found"))return json({error:"O usuário não possui acesso ativo para estender."},409);
    if(message.includes("actor_not_authorized"))return forbidden();
    return json({error:"Não foi possível concluir a ação agora."},500);
  }
}
