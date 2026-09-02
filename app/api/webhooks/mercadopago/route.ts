import { NextResponse } from "next/server";
import {
  InvalidWebhookSignatureError,
  MercadoPagoConfig,
  Payment,
  WebhookSignatureValidator,
} from "mercadopago";
import { supabaseAdminRpc } from "@/lib/supabase";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

function paymentIdFromRequest(url: URL, body: Record<string, any>) {
  return (
    url.searchParams.get("data.id") ??
    body?.data?.id ??
    body?.id ??
    url.searchParams.get("id")
  );
}

export async function POST(request: Request) {
  try {
    if (!accessToken || !webhookSecret) {
      return NextResponse.json(
        { error: "Mercado Pago não configurado." },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const body = (await request.json().catch(() => ({}))) as Record<string, any>;

    const eventType = body?.type ?? url.searchParams.get("type");
    const paymentId = paymentIdFromRequest(url, body);

    // O Mercado Pago pode enviar outros tipos de notificação.
    if (eventType && eventType !== "payment") {
      return NextResponse.json({ received: true });
    }

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const xSignature = request.headers.get("x-signature") ?? "";
    const xRequestId = request.headers.get("x-request-id") ?? "";

    try {
      WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId: String(paymentId),
        secret: webhookSecret,
      });
    } catch (error) {
      if (error instanceof InvalidWebhookSignatureError) {
        return NextResponse.json(
          { error: "Assinatura inválida." },
          { status: 401 }
        );
      }
      throw error;
    }

    // Depois da assinatura validada, ainda buscamos o pagamento diretamente
    // no Mercado Pago antes de conceder qualquer acesso.
    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: String(paymentId) });

    const metadata = (payment.metadata ?? {}) as Record<string, any>;
    const userId = String(metadata.user_id ?? "").trim();
    const email = String(metadata.email ?? payment.payer?.email ?? "").trim();
    const plan = String(metadata.plan ?? "").trim();
    const accessDays = Number(metadata.access_days ?? 0);

    if (!userId || !email || !["90d", "annual"].includes(plan)) {
      console.error("Pagamento Mercado Pago sem metadata válida", {
        paymentId: payment.id,
        userId,
        email,
        plan,
      });

      return NextResponse.json({ received: true });
    }

    const providerPaymentId = String(payment.id ?? paymentId);
    const status = String(payment.status ?? "pending");
    const installments = Number(payment.installments ?? 1);
    const grossAmountCents = Math.round(
      Number(payment.transaction_amount ?? 0) * 100
    );

    await supabaseAdminRpc("process_mercadopago_payment", {
      p_provider_payment_id: providerPaymentId,
      p_user_id: userId,
      p_email: email,
      p_plan_id: plan,
      p_status: status,
      p_payment_method: payment.payment_method_id ?? null,
      p_installments: installments,
      p_gross_amount_cents: grossAmountCents,
      p_access_days: accessDays || (plan === "annual" ? 365 : 90),
      p_approved_at: payment.date_approved ?? null,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook Mercado Pago:", error);

    return NextResponse.json(
      { error: "Falha ao processar webhook." },
      { status: 500 }
    );
  }
}
