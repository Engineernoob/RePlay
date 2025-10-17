import { create } from "zustand";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { Audio } from "expo-av";
import { useEffect } from "react";

// ---------- Zustand Player State ---------- //
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

// ---------- Expo Audio Player Hook ---------- //
export function usePlayerController(source: any) {
  const player = useAudioPlayer(source, { updateInterval: 200 });
  const status = useAudioPlayerStatus(player);

  // Configure global audio behavior
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

// ---------- Sound Effects Utility ---------- //

/**
 * A reusable sound effect manager to prevent overlapping SFX.
 * It ensures only one instance of a specific effect plays at a time.
 */
const activeSfx: Record<string, Audio.Sound | null> = {};

/**
 * Plays a short sound effect (e.g., cassette insert, close, eject)
 * with optional delay and overlap protection.
 */
export async function playSfx(soundPath: any, delay = 0) {
  try {
    // Create a unique key for this sound
    const key = JSON.stringify(soundPath);

    // Prevent overlapping sound playback
    if (activeSfx[key]) {
      const status = await activeSfx[key]?.getStatusAsync();
      if (status?.isLoaded && status?.isPlaying) {
        return; // already playing → skip
      }
    }

    // Wait before playback if needed
    setTimeout(async () => {
      // If a previous instance exists, unload it first
      if (activeSfx[key]) {
        await activeSfx[key]?.unloadAsync();
        activeSfx[key] = null;
      }

      // Load and play the new sound
      const { sound } = await Audio.Sound.createAsync(soundPath);
      activeSfx[key] = sound;

      await sound.playAsync();

      // Cleanup after playback ends
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && !status.isPlaying && (status as any).didJustFinish) {
          await sound.unloadAsync();
          activeSfx[key] = null;
        }
      });
    }, delay);
  } catch (err) {
    console.warn("SFX error:", err);
  }
}

