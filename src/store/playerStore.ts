import { create } from "zustand";
import { Audio } from "expo-av";

type PlayerState = {
  isPlaying: boolean;
  sound: Audio.Sound | null;
  play: (uri: string) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  sound: null,
  play: async (uri) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    set({ sound, isPlaying: true });
  },
  pause: async () => {
    const { sound } = get();
    if (sound) {
      await sound.pauseAsync();
      set({ isPlaying: false });
    }
  },
  stop: async () => {
    const { sound } = get();
    if (sound) {
      await sound.stopAsync();
      set({ isPlaying: false });
    }
  },
}));
