import { create } from "zustand";
import { api } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";

type ServiceInput = Pick<ServiceItem, "name" | "durationMinutes" | "priceCents"> & { description?: string | null };

interface ServiceState {
  items: ServiceItem[];
  loading: boolean;
  error: string | null;
  fetch: (slug: string) => Promise<void>;
  create: (slug: string, input: ServiceInput) => Promise<void>;
  toggleActive: (slug: string, s: ServiceItem) => Promise<void>;
  remove: (slug: string, id: string) => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  fetch: async (slug) => {
    set({ loading: true, error: null });
    try {
      set({ items: await api<ServiceItem[]>(`/api/w/${slug}/services`) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  create: async (slug, input) => {
    const row = await api<ServiceItem>(`/api/w/${slug}/services`, { method: "POST", json: input });
    set({ items: [...get().items, row].sort((a, b) => a.name.localeCompare(b.name)) });
  },
  toggleActive: async (slug, s) => {
    const row = await api<ServiceItem>(`/api/w/${slug}/services/${s.id}`, { method: "PATCH", json: { isActive: !s.isActive } });
    set({ items: get().items.map((i) => (i.id === row.id ? row : i)) });
  },
  remove: async (slug, id) => {
    await api(`/api/w/${slug}/services/${id}`, { method: "DELETE" });
    set({ items: get().items.filter((i) => i.id !== id) });
  },
}));
