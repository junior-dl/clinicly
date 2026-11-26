"use client";
import { useEffect } from "react";
import { useServiceStore } from "@/stores/service.store";

export function useServices(slug: string) {
  const store = useServiceStore();
  const { fetch } = store;
  useEffect(() => {
    fetch(slug);
  }, [slug, fetch]);
  return store;
}
