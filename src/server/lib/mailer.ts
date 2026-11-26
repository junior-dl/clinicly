/**
 * Minimal transactional email. Uses Resend's HTTP API when RESEND_API_KEY is set;
 * otherwise logs the message so flows like password reset still work locally.
 */
export async function sendEmail(input: { to: string; subject: string; text: string; html?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`\n[mail] (no RESEND_API_KEY — logging instead)\nTo: ${input.to}\nSubject: ${input.subject}\n\n${input.text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Clinicly <onboarding@resend.dev>",
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });
  if (!res.ok) console.error("[mail] Resend failed", res.status, await res.text());
}
