import { NextResponse } from "next/server";
import { updatePasswordWithAccessToken } from "@/lib/supabase";

export async function POST(request: Request) {
  let body:{access_token?:unknown;password?:unknown;password_confirmation?:unknown};
  try{body=await request.json();}catch{return NextResponse.json({error:"invalid_payload"},{status:400});}

  const accessToken=typeof body.access_token==="string"?body.access_token.trim():"";
  const password=typeof body.password==="string"?body.password:"";
  const confirmation=typeof body.password_confirmation==="string"?body.password_confirmation:"";

  if(!accessToken||password.length<6||password.length>128||password!==confirmation){
    return NextResponse.json({error:"invalid_input"},{status:400});
  }

  try{
    await updatePasswordWithAccessToken(accessToken,password);
    return NextResponse.json({ok:true});
  }catch{
    return NextResponse.json({error:"invalid_or_expired_token"},{status:400});
  }
}
