"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, Card, ErrorText, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setBusy(false);
    // Same message whether or not the account exists, so emails can't be probed.
    if (res.error && res.error.status !== 404) return setError(res.error.message ?? "Couldn't send the email. Try again.");
    setSent(true);
  }

  return (
    <Card className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-2 text-xl font-semibold">Reset your password</h1>
      {sent ? (
        <>
          <p className="text-sm text-stone-600">
            If an account exists for <span className="font-medium">{email}</span>, we&apos;ve sent a link to reset the password. It expires in 1 hour.
          </p>
          <Link href="/sign-in" className="mt-6 inline-block text-sm text-teal-700">Back to sign in</Link>
        </>
      ) : (
        <form onSubmit={handle} className="space-y-3">
          <p className="text-sm text-stone-600">Enter the email you signed up with and we&apos;ll send you a reset link.</p>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          <ErrorText>{error}</ErrorText>
          <Button disabled={busy} className="w-full">{busy ? "Sending…" : "Send reset link"}</Button>
          <p className="text-center text-sm"><Link href="/sign-in" className="text-teal-700">Back to sign in</Link></p>
        </form>
      )}
    </Card>
  );
}
