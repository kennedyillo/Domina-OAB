type Recipient={email:string;name?:string|null};
type SendEmailInput={to:Recipient[];subject:string;htmlContent?:string;textContent?:string;tags?:string[]};

export async function sendTransactionalEmail(input:SendEmailInput){
 const apiKey=process.env.BREVO_API_KEY;
 const senderEmail=process.env.BREVO_SENDER_EMAIL||"portaldominaoab@gmail.com";
 const senderName=process.env.BREVO_SENDER_NAME||"Domina OAB";
 const replyTo=process.env.BREVO_REPLY_TO_EMAIL||senderEmail;
 if(!apiKey) throw new Error("BREVO_API_KEY não configurada.");
 if(!input.to.length) throw new Error("Nenhum destinatário informado.");
 if(!input.htmlContent&&!input.textContent) throw new Error("Conteúdo do e-mail ausente.");

 const response=await fetch("https://api.brevo.com/v3/smtp/email",{
  method:"POST",
  headers:{accept:"application/json","content-type":"application/json","api-key":apiKey},
  body:JSON.stringify({
   sender:{name:senderName,email:senderEmail},
   replyTo:{email:replyTo,name:senderName},
   to:input.to.map(item=>({email:item.email,name:item.name||undefined})),
   subject:input.subject,
   ...(input.htmlContent?{htmlContent:input.htmlContent}:{textContent:input.textContent}),
   ...(input.tags?.length?{tags:input.tags}:{}),
  }),
 });
 const data=await response.json().catch(()=>({})) as {messageId?:string;messageIds?:string[];message?:string;code?:string};
 if(!response.ok) throw new Error(data.message||data.code||`Brevo respondeu ${response.status}.`);
 return {messageId:data.messageId??data.messageIds?.[0]??null};
}

// Para usar remetente @dominaoab.com.br, configure BREVO_SENDER_EMAIL após
// verificar o remetente/domínio na Brevo. A chave da API permanece server-only.
