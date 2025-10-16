import { create } from "zustand";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { useEffect } from "react";

type PlayerState = {
  isInitialized: boolean;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
};

export const usePlayerStore = create<PlayerState>(() => ({
  isInitialized: false,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  play: () => {},
  pause: () => {},
  seekTo: () => {},
}));

// Hook to attach Expo Audio player and sync Zustand
export function usePlayerController(source: any) {
  // create player and status hooks from expo-audio
  const player = useAudioPlayer(source, { updateInterval: 200 });
  const status = useAudioPlayerStatus(player);

  // Configure audio mode
  useEffect(() => {
    (async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: "mixWithOthers",
      });
    })();
  }, []);

  // Sync Zustand with player state
  useEffect(() => {
    usePlayerStore.setState({
      isInitialized: true,
      isPlaying: status.playing,
      duration: status.duration,
      currentTime: status.currentTime,
      play: () => player.play(),
      pause: () => player.pause(),
      seekTo: (t) => player.seekTo(t),
    });
  }, [status, player]);
}
