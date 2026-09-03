import { adminCan, getAdminUser } from "@/lib/admin-access";
import { supabaseAdminSelect } from "@/lib/supabase";

function csv(value: unknown) {
  return `"${String(value??"").replaceAll('"','""')}"`;
}

type FounderRow = { email:string; status:string; created_at:string };

export async function GET() {
  const user = await getAdminUser();
  if (!user || !adminCan(user.role, "founders:export")) {
    return Response.json({error:"Acesso negado."},{status:403});
  }

  const rows = await supabaseAdminSelect<FounderRow[]>(
    "pilot_leads?select=email,status,created_at&order=created_at.asc,id.asc",
  );

  const lines = [
    "email,situacao,cadastrado_em",
    ...rows.map(row=>[csv(row.email),csv(row.status),csv(row.created_at)].join(",")),
  ];

  return new Response(`\uFEFF${lines.join("\n")}`,{
    headers:{
      "content-type":"text/csv; charset=utf-8",
      "content-disposition":"attachment; filename=domina-oab-fundadores.csv",
      "cache-control":"no-store",
    },
  });
}
