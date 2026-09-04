import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getSupabaseUser } from "@/lib/supabase";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

const PLANS = {
  "30d": {
    amount: 49.9,
    days: 30,
    title: "Domina OAB - 30 dias",
  },
  "90d": {
    amount: 129.9,
    days: 90,
    title: "Domina OAB - 90 dias",
  },
  annual: {
    amount: 360,
    days: 365,
    title: "Domina OAB - 365 dias",
  },
} as const;

type PlanId = keyof typeof PLANS;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") as PlanId | null;

  if (!plan || !(plan in PLANS)) {
    return NextResponse.redirect(new URL("/#planos", request.url), 303);
  }

  const user = await getSupabaseUser();
  if (!user?.id) {
    const signup = new URL("/cadastro", request.url);
    signup.searchParams.set("plan", plan);
    return NextResponse.redirect(signup, 303);
  }

  if (!accessToken) {
    return NextResponse.json({ error: "Mercado Pago não configurado." }, { status: 500 });
  }

  const selected = PLANS[plan];
  const origin = url.origin;
  const client = new MercadoPagoConfig({ accessToken });
  const preferenceClient = new Preference(client);

  const preference = await preferenceClient.create({
    body: {
      items: [
        {
          id: plan,
          title: selected.title,
          quantity: 1,
          currency_id: "BRL",
          unit_price: selected.amount,
        },
      ],
      payer: user.email ? { email: user.email } : undefined,
      external_reference: `${user.id}:${plan}`,
      metadata: {
        user_id: user.id,
        email: user.email ?? "",
        plan,
        access_days: selected.days,
      },
      notification_url: `${origin}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${origin}/conta?payment=success`,
        pending: `${origin}/conta?payment=pending`,
        failure: `${origin}/conta?payment=failure`,
      },
      auto_return: "approved",
    },
  });

  const checkoutUrl = accessToken.startsWith("TEST-")
    ? preference.sandbox_init_point ?? preference.init_point
    : preference.init_point;

  if (!checkoutUrl) {
    return NextResponse.json({ error: "Não foi possível iniciar o checkout." }, { status: 502 });
  }

  return NextResponse.redirect(checkoutUrl, 303);
}
