import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Track } from "@/src/types/audio";

/* ────────────────────────────────
   TYPES
──────────────────────────────── */

export interface Cassette {
  id: string;
  name: string; // e.g. "Roadtrip Vol. 1"
  tracks: Track[];
  color: string;
  createdAt: number;
  lastPlayed?: string; // track id
  position?: number; // in seconds
  lastPlayedAt?: number; // timestamp
}

interface LibraryState {
  cassettes: Cassette[];
  activeCassetteId: string | null;

  // ───── Cassette Management ─────
  addCassette: (cassette: Omit<Cassette, "id" | "createdAt">) => string;
  removeCassette: (id: string) => void;
  updateCassette: (id: string, updates: Partial<Cassette>) => void;
  renameCassette: (id: string, newName: string) => void;
  loadCassette: (id: string) => Cassette | null;
  clearLibrary: () => void;

  // ───── Playback Memory ─────
  updatePlaybackMemory: (
    cassetteId: string,
    trackId: string,
    position: number
  ) => void;
  getLastPlayedCassette: () => Cassette | null;
  setActiveCassette: (id: string | null) => void;
}

/* ────────────────────────────────
   ZUSTAND STORE
──────────────────────────────── */

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      cassettes: [],
      activeCassetteId: null,

      /* ───── Cassette Management ───── */
      addCassette: (cassetteData) => {
        const id = `cassette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newCassette: Cassette = {
          ...cassetteData,
          id,
          createdAt: Date.now(),
        };

        set((state) => ({
          cassettes: [...state.cassettes, newCassette],
        }));

        return id;
      },

      removeCassette: (id) => {
        set((state) => ({
          cassettes: state.cassettes.filter((c) => c.id !== id),
          activeCassetteId:
            state.activeCassetteId === id ? null : state.activeCassetteId,
        }));
      },

      updateCassette: (id, updates) => {
        set((state) => ({
          cassettes: state.cassettes.map((cassette) =>
            cassette.id === id ? { ...cassette, ...updates } : cassette
          ),
        }));
      },

      renameCassette: (id, newName) => {
        get().updateCassette(id, { name: newName });
      },

      loadCassette: (id) => {
        const cassette = get().cassettes.find((c) => c.id === id);
        if (cassette) {
          set({ activeCassetteId: id });
        }
        return cassette || null;
      },

      clearLibrary: () => {
        set({ cassettes: [], activeCassetteId: null });
      },

      /* ───── Playback Memory ───── */
      updatePlaybackMemory: (cassetteId, trackId, position) => {
        get().updateCassette(cassetteId, {
          lastPlayed: trackId,
          position,
          lastPlayedAt: Date.now(),
        });
      },

      getLastPlayedCassette: () => {
        const { cassettes } = get();
        if (cassettes.length === 0) return null;

        // Find cassette with most recent lastPlayedAt
        const sorted = [...cassettes]
          .filter((c) => c.lastPlayedAt)
          .sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0));

        return sorted.length > 0 ? sorted[0] : cassettes[0];
      },

      setActiveCassette: (id) => {
        set({ activeCassetteId: id });
      },
    }),
    {
      name: "replay-cassette-library",
      storage: {
        getItem: async (name) => {
          const item = await AsyncStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: async (name, value) =>
          AsyncStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => AsyncStorage.removeItem(name),
      },
      partialize: (state) => ({
        cassettes: state.cassettes,
        activeCassetteId: state.activeCassetteId,
      }),
    }
  )
);

