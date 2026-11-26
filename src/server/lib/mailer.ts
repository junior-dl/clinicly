/**
 * Transactional email. Tries, in order:
 *  1. n8n "Send Email (Gmail relay)" workflow  — N8N_MAIL_WEBHOOK_URL + N8N_MAIL_KEY
 *  2. Resend HTTP API                           — RESEND_API_KEY (+ EMAIL_FROM)
 *  3. Console log, so flows like password reset still work in development.
 */
type Email = { to: string; subject: string; text: string; html?: string };

const FROM_NAME = "Clinicly";

async function viaN8n(email: Email): Promise<boolean> {
  const url = process.env.N8N_MAIL_WEBHOOK_URL;
  const key = process.env.N8N_MAIL_KEY;
  if (!url || !key) return false;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", [process.env.N8N_MAIL_HEADER ?? "x-mail-key"]: key },
    body: JSON.stringify({ ...email, fromName: FROM_NAME }),
  });
  if (!res.ok) console.error("[mail] n8n relay failed", res.status, await res.text());
  return res.ok;
}

async function viaResend(email: Email): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? `${FROM_NAME} <onboarding@resend.dev>`, ...email }),
  });
  if (!res.ok) console.error("[mail] Resend failed", res.status, await res.text());
  return res.ok;
}

export async function sendEmail(email: Email) {
  try {
    if (await viaN8n(email)) return;
    if (await viaResend(email)) return;
  } catch (err) {
    console.error("[mail] send error", err);
  }
  // Nothing delivered it: log so the link (e.g. password reset) is still usable in development.
  console.info(`\n[mail] Not delivered — logging instead\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.text}\n`);
}
