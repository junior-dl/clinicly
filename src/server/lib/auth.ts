import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { dbAdmin, schema } from "@/server/db";
import { sendEmail } from "./mailer";

export const auth = betterAuth({
  database: drizzleAdapter(dbAdmin, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
    revokeSessionsOnPasswordReset: true, // sign out other devices after a reset
    sendResetPassword: async ({ user, url }) => {
      // Awaited so serverless hosts (Vercel) don't stop the function before the email is sent.
      await sendEmail({
        to: user.email,
        subject: "Reset your Clinicly password",
        text: `Hi ${user.name},\n\nUse this link to choose a new password. It expires in 1 hour.\n\n${url}\n\nIf you didn't ask for this, you can ignore this email.`,
        html: `<p>Hi ${user.name},</p><p>Use this link to choose a new password. It expires in 1 hour.</p><p><a href="${url}">Reset password</a></p><p>If you didn't ask for this, you can ignore this email.</p>`,
      });
    },
  },
  plugins: [nextCookies()],
});
