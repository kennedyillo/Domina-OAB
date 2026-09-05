import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { enforceRateLimit, readJsonWithLimit } from "@/lib/public-api-security";
import { supabaseAccessCookie, updatePasswordWithAccessToken } from "@/lib/supabase";

function json(body:Record<string,unknown>,status=200){
  const response=NextResponse.json(body,{status});
  response.headers.set("cache-control","private, no-store");
  return response;
}

export async function POST(request: Request) {
  const limited=await enforceRateLimit(request,"auth_password_update",10,900);
  if(limited){
    const retry=limited.headers.get("Retry-After")||"900";
    const response=json({error:"rate_limited"},429);
    response.headers.set("Retry-After",retry);
    return response;
  }

  let body:{access_token?:unknown;password?:unknown;password_confirmation?:unknown};
  try{body=await readJsonWithLimit<typeof body>(request,4*1024);}catch(error){
    return json({error:error instanceof Error&&error.message==="payload_too_large"?"payload_too_large":"invalid_payload"},error instanceof Error&&error.message==="payload_too_large"?413:400);
  }

  const store=await cookies();
  const cookieToken=store.get(supabaseAccessCookie)?.value?.trim()??"";
  const legacyToken=typeof body.access_token==="string"?body.access_token.trim().slice(0,4096):"";
  const accessToken=cookieToken||legacyToken;
  const password=typeof body.password==="string"?body.password:"";
  const confirmation=typeof body.password_confirmation==="string"?body.password_confirmation:"";

  if(!accessToken)return json({error:"recovery_session_required"},401);
  if(password.length<6||password.length>128||password!==confirmation)return json({error:"invalid_input"},400);

  try{
    await updatePasswordWithAccessToken(accessToken,password);
    const response=json({ok:true});
    response.cookies.delete(supabaseAccessCookie);
    return response;
  }catch{
    return json({error:"invalid_or_expired_token"},400);
  }
}
