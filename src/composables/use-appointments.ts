"use client";
import { useEffect, useMemo } from "react";
import { useAppointmentStore } from "@/stores/appointment.store";

/** Appointments for the 7 days starting at `weekStart`. */
export function useAppointments(slug: string, weekStart: Date) {
  const store = useAppointmentStore();
  const { fetchRange } = store;
  const from = weekStart.getTime();
  const range = useMemo(() => ({ from: new Date(from), to: new Date(from + 7 * 86_400_000) }), [from]);
  useEffect(() => {
    fetchRange(slug, range.from, range.to);
  }, [slug, range, fetchRange]);
  return { ...store, range };
}
