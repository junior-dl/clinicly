"use client";
import { useEffect } from "react";
import { useBookingStore } from "@/stores/booking.store";

export function usePublicBooking(slug: string) {
  const store = useBookingStore();
  const { load } = store;
  useEffect(() => {
    load(slug);
  }, [slug, load]);
  return store;
}
