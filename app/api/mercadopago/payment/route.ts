import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getSupabaseUser } from "@/lib/supabase";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

const PLANS = {
  "90d": {
    amount: 129.9,
    days: 90,
    maxInstallments: 1,
    description: "Domina OAB - Plano 90 dias",
  },
  annual: {
    amount: 360,
    days: 365,
    maxInstallments: 12,
    description: "Domina OAB - Plano Anual",
  },
} as const;

type PlanId = keyof typeof PLANS;

export async function POST(request: Request) {
  try {
    if (!accessToken) {
      return NextResponse.json(
        { error: "Mercado Pago não configurado." },
        { status: 500 }
      );
    }

    const user = await getSupabaseUser();

    if (!user) {
      return NextResponse.json(
        { error: "Faça login antes de realizar o pagamento." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan, ...formData } = body;

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json(
        { error: "Plano inválido." },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS[plan as PlanId];
    const installments = Math.max(1, Number(formData.installments ?? 1));

    if (!Number.isInteger(installments) || installments > selectedPlan.maxInstallments) {
      return NextResponse.json(
        { error: `Parcelamento inválido para este plano. Máximo: ${selectedPlan.maxInstallments}x.` },
        { status: 400 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);

    const payment = await paymentClient.create({
      body: {
        ...formData,
        installments,
        transaction_amount: selectedPlan.amount,
        description: selectedPlan.description,
        metadata: {
          user_id: user.id,
          email: user.email ?? "",
          plan,
          access_days: selectedPlan.days,
        },
        external_reference: `${user.id}:${plan}`,
      },
    });

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
    });
  } catch (error) {
    console.error("Erro Mercado Pago:", error);

    return NextResponse.json(
      { error: "Não foi possível processar o pagamento." },
      { status: 500 }
    );
  }
}
