import { create } from "zustand";
import { api } from "@/lib/api";
import type { PublicBookingPage } from "@/lib/types";

export interface BookingDraft {
  serviceId: string;
  staffMemberId: string;
  startsAt: string;
  client: { name: string; email: string; phone?: string };
}

interface BookingState {
  page: PublicBookingPage | null;
  loading: boolean;
  error: string | null;
  confirmedId: string | null;
  load: (slug: string) => Promise<void>;
  submit: (slug: string, draft: BookingDraft) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  page: null,
  loading: false,
  error: null,
  confirmedId: null,
  load: async (slug) => {
    set({ loading: true, error: null });
    try {
      set({ page: await api<PublicBookingPage>(`/api/public/${slug}`) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  submit: async (slug, draft) => {
    set({ error: null });
    try {
      const { id } = await api<{ id: string }>(`/api/public/${slug}/book`, {
        method: "POST",
        json: { ...draft, startsAt: new Date(draft.startsAt).toISOString() },
      });
      set({ confirmedId: id });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
