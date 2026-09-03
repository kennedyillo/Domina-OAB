export type EmailRecipient={email:string;name?:string|null};
export type OutboundEmail={to:EmailRecipient[];subject:string;htmlContent?:string;textContent?:string;tags?:string[]};
export type EmailSendResult={messageId:string|null};
export type EmailProvider={send(input:OutboundEmail):Promise<EmailSendResult>};

export const defaultEmailSender={
 email:process.env.EMAIL_SENDER_EMAIL||"portaldominaoab@gmail.com",
 name:process.env.EMAIL_SENDER_NAME||"Domina OAB",
 replyTo:process.env.EMAIL_REPLY_TO_EMAIL||process.env.EMAIL_SENDER_EMAIL||"portaldominaoab@gmail.com",
};

export function getEmailProvider():EmailProvider{
 throw new Error("Provedor de e-mail ainda não configurado. Estrutura pronta para integração futura.");
}

// Integração futura: implementar um provider (ex.: Brevo) atrás desta interface,
// mantendo credenciais exclusivamente no servidor e sem acoplar o restante do app ao fornecedor.
