import { getChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";

const ADMIN_EMAILS = new Set([
  "kmps16@gmail.com",
  "portaldominaoab@gmail.com",
]);

export function isAdminUser(user: ChatGPTUser | null) {
  return Boolean(user && ADMIN_EMAILS.has(user.email.toLowerCase()));
}

export async function getAdminUser() {
  const user = await getChatGPTUser();
  return isAdminUser(user) ? user : null;
}
