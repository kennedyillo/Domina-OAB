import { getSupabaseUser,supabaseAdminSelect } from "@/lib/supabase";

type AccountRow={account_status:"active"|"blocked"|"cancelled"};

export type StudentSessionState=
  | {state:"anonymous";user:null}
  | {state:"inactive";user:NonNullable<Awaited<ReturnType<typeof getSupabaseUser>>>}
  | {state:"active";user:NonNullable<Awaited<ReturnType<typeof getSupabaseUser>>>};

export async function getStudentSessionState():Promise<StudentSessionState>{
  const user=await getSupabaseUser();
  if(!user?.id)return {state:"anonymous",user:null};

  const profiles=await supabaseAdminSelect<AccountRow[]>(
    `user_profiles?select=account_status&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
  );

  // A conta recém-criada pode ainda não ter perfil completo. Ausência de perfil
  // não deve impedir o primeiro acesso nem forçar coleta prematura de CPF/telefone.
  if(profiles[0]&&profiles[0].account_status!=="active")return {state:"inactive",user};
  return {state:"active",user};
}
