import { create } from "zustand";
import { api } from "@/lib/api";
import type { WorkspaceDetail, WorkspaceSummary } from "@/lib/types";

interface WorkspaceState {
  mine: WorkspaceSummary[];
  current: WorkspaceDetail | null;
  loading: boolean;
  error: string | null;
  fetchMine: () => Promise<void>;
  fetchCurrent: (slug: string) => Promise<void>;
  create: (input: { name: string; slug: string }) => Promise<WorkspaceSummary>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  mine: [],
  current: null,
  loading: false,
  error: null,
  fetchMine: async () => {
    set({ loading: true, error: null });
    try {
      set({ mine: await api<WorkspaceSummary[]>("/api/workspaces") });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  fetchCurrent: async (slug) => {
    set({ loading: true, error: null });
    try {
      set({ current: await api<WorkspaceDetail>(`/api/w/${slug}`) });
    } catch (e) {
      set({ error: (e as Error).message, current: null });
    } finally {
      set({ loading: false });
    }
  },
  create: (input) => api<WorkspaceSummary>("/api/workspaces", { method: "POST", json: input }),
}));
