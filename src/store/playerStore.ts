import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { Audio } from "expo-av";
import { useEffect } from "react";

// ---------- Playlist Types ---------- //
interface Track {
  id: string;
  title: string;
  artist: string;
  audio: any;
  album: any;
  color: string;
}

interface PlaylistState {
  playlist: Track[];
  currentTrackIndex: number;
  isShuffle: boolean;
  repeatMode: "none" | "one" | "all";
}

// ---------- Zustand Player State ---------- //
type PlayerState = PlaylistState & {
  isInitialized: boolean;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  currentTrack: Track | null;
  // Player controls
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  // Playlist controls
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  clearPlaylist: () => void;
  playNext: () => void;
  playPrevious: () => void;
  jumpToTrack: (index: number) => void;
  setRepeatMode: (mode: "none" | "one" | "all") => void;
  toggleShuffle: () => void;
  loadPlaylist: (tracks: Track[]) => void;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Playlist state
      playlist: [],
      currentTrackIndex: 0,
      isShuffle: false,
      repeatMode: "none",
      currentTrack: null,
      
      // Player state
      isInitialized: false,
      isPlaying: false,
      duration: 0,
      currentTime: 0,
      
      // Player controls
      play: () => {},
      pause: () => {},
      seekTo: () => {},
      
      // Playlist controls
      addToPlaylist: (track) => set((state) => ({ 
        playlist: [...state.playlist, track] 
      })),
      
      removeFromPlaylist: (trackId) => set((state) => ({
        playlist: state.playlist.filter(t => t.id !== trackId)
      })),
      
      clearPlaylist: () => set({ playlist: [], currentTrackIndex: 0 }),
      
      playNext: () => {
        const state = get();
        if (state.playlist.length === 0) return;
        
        let nextIndex = state.currentTrackIndex + 1;
        if (nextIndex >= state.playlist.length) {
          if (state.repeatMode === "all" || state.isShuffle) {
            nextIndex = 0;
          } else {
            return; // End of playlist
          }
        }
        
        set({ currentTrackIndex: nextIndex });
        // The actual track loading will be handled by usePlayerController
      },
      
      playPrevious: () => {
        const state = get();
        if (state.playlist.length === 0) return;
        
        let prevIndex = state.currentTrackIndex - 1;
        if (prevIndex < 0) {
          prevIndex = state.playlist.length - 1;
        }
        
        set({ currentTrackIndex: prevIndex });
      },
      
      jumpToTrack: (index) => set({ currentTrackIndex: index }),
      
      setRepeatMode: (mode) => set({ repeatMode: mode }),
      
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      
      loadPlaylist: (tracks) => set({ 
        playlist: tracks, 
        currentTrackIndex: 0 
      }),
    }),
    {
      name: "walkman-player-store",
      storage: {
        getItem: (name) => AsyncStorage.getItem(name),
        setItem: (name, value) => AsyncStorage.setItem(name, value),
        removeItem: (name) => AsyncStorage.removeItem(name),
      },
      partialize: (state) => ({
        playlist: state.playlist,
        currentTrackIndex: state.currentTrackIndex,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
      }),
    }
  )
);

// ---------- Expo Audio Player Hook ---------- //
export function usePlayerController(source?: any) {
  const player = useAudioPlayer(source, { updateInterval: 200 });
  const status = useAudioPlayerStatus(player);
  const state = usePlayerStore();

  // Configure global audio behavior with background playback
  useEffect(() => {
    (async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1, // DO_NOT_MIX
        interruptionModeAndroid: 1, // DO_NOT_MIX
        playThroughEarpieceAndroid: false,
      });
    })();
  }, []);

  // Auto-play next track when current track ends
  useEffect(() => {
    if (status.didJustFinish && state.isPlaying) {
      if (state.repeatMode === "one") {
        // Replay current track
        setTimeout(() => {
          player.seekTo(0);
          player.play();
        }, 500);
      } else {
        // Play next track
        state.playNext();
      }
    }
  }, [status.didJustFinish, state.isPlaying, state.repeatMode, state.playNext, player]);

  // Update current track when playlist index changes
  useEffect(() => {
    if (state.playlist.length > 0 && state.currentTrackIndex < state.playlist.length) {
      const currentTrack = state.playlist[state.currentTrackIndex];
      usePlayerStore.setState({ currentTrack });
    }
  }, [state.playlist, state.currentTrackIndex]);

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

