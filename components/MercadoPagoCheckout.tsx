"use client";

import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

if (publicKey) {
  initMercadoPago(publicKey, {
    locale: "pt-BR",
  });
}

type Props = {
  plan: "90d" | "annual";
};

export default function MercadoPagoCheckout({ plan }: Props) {
  const amount = plan === "annual" ? 360 : 149.9;

  const initialization = {
    amount,
  };

  const customization = {
    paymentMethods: {
      creditCard: "all" as const,
      debitCard: "all" as const,
      pix: "all" as const,
    },
  };

  const onSubmit = async ({ formData }: any) => {
    const response = await fetch("/api/mercadopago/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        plan,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Erro ao processar pagamento");
    }

    return result;
  };

  return (
    <Payment
      initialization={initialization}
      customization={customization}
      onSubmit={onSubmit}
    />
  );
}
