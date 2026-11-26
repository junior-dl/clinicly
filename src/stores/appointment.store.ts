import { create } from "zustand";
import { api } from "@/lib/api";
import type { AppointmentItem } from "@/lib/types";

interface AppointmentState {
  items: AppointmentItem[];
  loading: boolean;
  error: string | null;
  fetchRange: (slug: string, from: Date, to: Date) => Promise<void>;
  setStatus: (slug: string, id: string, status: AppointmentItem["status"]) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  fetchRange: async (slug, from, to) => {
    set({ loading: true, error: null });
    try {
      const q = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
      set({ items: await api<AppointmentItem[]>(`/api/w/${slug}/appointments?${q}`) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  setStatus: async (slug, id, status) => {
    await api(`/api/w/${slug}/appointments/${id}`, { method: "PATCH", json: { status } });
    set({ items: get().items.map((a) => (a.id === id ? { ...a, status } : a)) });
  },
}));
