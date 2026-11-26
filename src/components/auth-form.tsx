"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, Card, ErrorText, Input } from "./ui";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res =
      mode === "sign-up"
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (res.error) return setError(res.error.message ?? "Something went wrong");
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next ?? "/dashboard");
  }

  return (
    <Card className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">{mode === "sign-up" ? "Create your account" : "Sign in"}</h1>
      <form onSubmit={handle} className="space-y-3">
        {mode === "sign-up" && <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <ErrorText>{error}</ErrorText>
        <Button disabled={busy} className="w-full">{mode === "sign-up" ? "Sign up" : "Sign in"}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-stone-500">
        {mode === "sign-up" ? <>Have an account? <Link className="text-teal-700" href="/sign-in">Sign in</Link></> : <>New here? <Link className="text-teal-700" href="/sign-up">Create an account</Link></>}
      </p>
    </Card>
  );
}
