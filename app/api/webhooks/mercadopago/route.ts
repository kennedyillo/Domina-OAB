import { createHash } from "crypto";
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

type EventStart={event_id:number;should_process:boolean;reprocessed:boolean};

function paymentIdFromRequest(url: URL, body: Record<string, any>) {
  return url.searchParams.get("data.id") ?? body?.data?.id ?? body?.id ?? url.searchParams.get("id");
}

export async function POST(request: Request) {
  let eventId:number|null=null;
  try {
    if (!accessToken || !webhookSecret) return NextResponse.json({ error: "Mercado Pago não configurado." }, { status: 500 });

    const url = new URL(request.url);
    const rawBody=await request.text();
    const body=(rawBody?JSON.parse(rawBody):{}) as Record<string,any>;
    const eventType = body?.type ?? url.searchParams.get("type") ?? "payment";
    const paymentId = paymentIdFromRequest(url, body);
    if (eventType !== "payment" || !paymentId) return NextResponse.json({ received: true });

    const xSignature = request.headers.get("x-signature") ?? "";
    const xRequestId = request.headers.get("x-request-id") ?? "";
    try {
      WebhookSignatureValidator.validate({ xSignature, xRequestId, dataId: String(paymentId), secret: webhookSecret });
    } catch (error) {
      if (error instanceof InvalidWebhookSignatureError) return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
      throw error;
    }

    const fallbackId=`payment:${paymentId}:${createHash("sha256").update(rawBody).digest("hex").slice(0,24)}`;
    const event=await supabaseAdminRpc<EventStart>("begin_payment_event",{
      p_provider_event_id:xRequestId||fallbackId,
      p_event_type:eventType,
      p_resource_id:String(paymentId),
      p_payload:rawBody,
    });
    eventId=event.event_id;
    if(!event.should_process) return NextResponse.json({received:true,duplicate:true});

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: String(paymentId) });

    const metadata = (payment.metadata ?? {}) as Record<string, any>;
    const userId = String(metadata.user_id ?? "").trim();
    const email = String(metadata.email ?? payment.payer?.email ?? "").trim();
    const plan = String(metadata.plan ?? "").trim();
    const accessDays = Number(metadata.access_days ?? 0);

    if (!userId || !email || !["90d", "annual"].includes(plan)) {
      await supabaseAdminRpc("finish_payment_event",{p_event_id:eventId,p_processing_status:"ignored",p_error_message:"metadata inválida"});
      return NextResponse.json({ received: true });
    }

    await supabaseAdminRpc("process_mercadopago_payment", {
      p_provider_payment_id: String(payment.id ?? paymentId),
      p_user_id: userId,
      p_email: email,
      p_plan_id: plan,
      p_status: String(payment.status ?? "pending"),
      p_payment_method: payment.payment_method_id ?? null,
      p_installments: Number(payment.installments ?? 1),
      p_gross_amount_cents: Math.round(Number(payment.transaction_amount ?? 0) * 100),
      p_access_days: accessDays || (plan === "annual" ? 365 : 90),
      p_approved_at: payment.date_approved ?? null,
    });

    await supabaseAdminRpc("finish_payment_event",{p_event_id:eventId,p_processing_status:"processed",p_error_message:null});
    return NextResponse.json({ received: true, reprocessed:event.reprocessed });
  } catch (error) {
    if(eventId){
      try{await supabaseAdminRpc("finish_payment_event",{p_event_id:eventId,p_processing_status:"failed",p_error_message:error instanceof Error?error.message:"erro desconhecido"});}catch{}
    }
    console.error("Erro no webhook Mercado Pago:", error);
    return NextResponse.json({ error: "Falha ao processar webhook." }, { status: 500 });
  }
}
