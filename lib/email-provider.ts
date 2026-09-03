type Recipient = { email: string; name?: string | null };

export type SendEmailInput = {
  to: Recipient[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  tags?: string[];
};

export type EmailProviderResult = {
  provider: string;
  messageId: string | null;
};

/**
 * Provider-neutral e-mail boundary.
 *
 * Newsletter consent, opt-out, communication preferences and event tracking
 * remain independent from the delivery provider. Brevo will be connected in a
 * later phase without changing callers or exposing provider credentials to the
 * browser.
 */
export async function sendTransactionalEmail(_input: SendEmailInput): Promise<EmailProviderResult> {
  throw new Error("Serviço de e-mail ainda não configurado. Integração Brevo adiada para fase posterior.");
}

export const emailProviderConfig = {
  senderEmail: process.env.EMAIL_SENDER_EMAIL || "portaldominaoab@gmail.com",
  senderName: process.env.EMAIL_SENDER_NAME || "Domina OAB",
  replyToEmail: process.env.EMAIL_REPLY_TO || process.env.EMAIL_SENDER_EMAIL || "portaldominaoab@gmail.com",
  provider: "pending",
} as const;
