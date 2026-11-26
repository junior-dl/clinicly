"use client";
import { useEffect } from "react";
import { useWorkspaceStore } from "@/stores/workspace.store";

export function useWorkspace(slug: string) {
  const { current, loading, error, fetchCurrent } = useWorkspaceStore();
  useEffect(() => {
    if (current?.slug !== slug) fetchCurrent(slug);
  }, [slug, current?.slug, fetchCurrent]);
  const isManager = current?.role === "owner" || current?.role === "admin";
  return { workspace: current, loading, error, isManager, isOwner: current?.role === "owner" };
}
