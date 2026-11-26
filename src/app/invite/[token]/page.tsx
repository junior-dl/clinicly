"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Button, Card, ErrorText } from "@/components/ui";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    try {
      const { slug } = await api<{ slug: string }>(`/api/invitations/${token}/accept`, { method: "POST" });
      router.push(`/w/${slug}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return router.push(`/sign-up?next=/invite/${token}`);
      setError((e as Error).message);
    }
  }

  return (
    <Card className="mx-auto mt-16 max-w-sm text-center">
      <h1 className="mb-4 text-xl font-semibold">You&apos;ve been invited to join a workspace</h1>
      <Button onClick={accept}>Accept invite</Button>
      <div className="mt-3"><ErrorText>{error}</ErrorText></div>
    </Card>
  );
}
