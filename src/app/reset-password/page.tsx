"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, Card, ErrorText, Input } from "@/components/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const linkError = params.get("error"); // Better Auth redirects with ?error=INVALID_TOKEN for bad/expired links
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token || linkError) {
    return (
      <Card className="mx-auto mt-16 max-w-sm">
        <h1 className="mb-2 text-xl font-semibold">This link has expired</h1>
        <p className="text-sm text-stone-600">Reset links work once and expire after 1 hour. Request a new one to continue.</p>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm text-teal-700">Send a new link</Link>
      </Card>
    );
  }

  async function handle(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    setError(null);
    const res = await authClient.resetPassword({ newPassword: password, token: token! });
    setBusy(false);
    if (res.error) return setError(res.error.message ?? "Couldn't reset the password. Request a new link.");
    router.push("/sign-in?reset=1");
  }

  return (
    <Card className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">Choose a new password</h1>
      <form onSubmit={handle} className="space-y-3">
        <Input label="New password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
        <Input label="Confirm new password" type="password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <ErrorText>{error}</ErrorText>
        <Button disabled={busy} className="w-full">{busy ? "Saving…" : "Save new password"}</Button>
      </form>
    </Card>
  );
}
