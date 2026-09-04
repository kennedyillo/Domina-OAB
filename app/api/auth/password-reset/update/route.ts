import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAccessCookie, updatePasswordWithAccessToken } from "@/lib/supabase";

export async function POST(request: Request) {
  let body:{access_token?:unknown;password?:unknown;password_confirmation?:unknown};
  try{body=await request.json();}catch{return NextResponse.json({error:"invalid_payload"},{status:400});}

  const store=await cookies();
  const cookieToken=store.get(supabaseAccessCookie)?.value?.trim()??"";
  const legacyToken=typeof body.access_token==="string"?body.access_token.trim():"";
  const accessToken=cookieToken||legacyToken;
  const password=typeof body.password==="string"?body.password:"";
  const confirmation=typeof body.password_confirmation==="string"?body.password_confirmation:"";

  if(!accessToken){
    return NextResponse.json({error:"recovery_session_required"},{status:401});
  }
  if(password.length<6||password.length>128||password!==confirmation){
    return NextResponse.json({error:"invalid_input"},{status:400});
  }

  try{
    await updatePasswordWithAccessToken(accessToken,password);
    const response=NextResponse.json({ok:true});
    response.cookies.delete(supabaseAccessCookie);
    response.headers.set("cache-control","private, no-store");
    return response;
  }catch{
    return NextResponse.json({error:"invalid_or_expired_token"},{status:400});
  }
}
