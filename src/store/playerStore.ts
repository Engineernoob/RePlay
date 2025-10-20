import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { useEffect } from "react";

/* ────────────────────────────────
   TYPES
──────────────────────────────── */
export interface Track {
  id: string;
  title: string;
  artist: string;
  audio: any; // local require()
  album: any; // cover image
  color: string;
}

export interface SavedPlaylist {
  name: string;
  tracks: Track[];
  createdAt: string;
}

interface PlaylistState {
  playlist: Track[];
  currentTrackIndex: number;
  isShuffle: boolean;
  repeatMode: "none" | "one" | "all";
  savedPlaylists: SavedPlaylist[];
}

interface PlayerState extends PlaylistState {
  isInitialized: boolean;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  player: AudioPlayer | null;
  currentTrack: Track | null;

  // ───── Cassette Realism State ─────
  powerOn: boolean;
  volume: number;
  playbackRate: number;
  reelRotation: number;

  /* ───── Core Player Controls ───── */
  loadTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;

  /* ───── Tape Simulation Controls ───── */
  rewind: (seconds: number) => void;
  fastForward: (seconds: number) => void;
  restartTrack: () => void;
  setVolume: (level: number) => void;
  setPlaybackRate: (rate: number) => void;
  setPowerState: (on: boolean) => void;
  playSfx: (name: "insert" | "eject" | "click") => Promise<void>;
  setReelRotation: () => void;

  /* ───── Playlist Controls ───── */
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  clearPlaylist: () => void;
  clearQueueAfter: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  jumpToTrack: (index: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: "none" | "one" | "all") => void;
  loadPlaylist: (tracks: Track[]) => void;

  /* ───── Advanced Playlist Management ───── */
  enqueueNext: (track: Track) => void;
  addTracks: (tracks: Track[]) => void;
  shufflePlaylist: () => void;
  savePlaylist: (name: string) => void;
  loadSavedPlaylist: (name: string) => void;
  autoPlaylist: (mode: "retro" | "party" | "chill") => void;
  suggestNextTrack: () => Track | null;
}

/* ────────────────────────────────
   ZUSTAND STORE
──────────────────────────────── */
export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      /* Playlist */
      playlist: [],
      currentTrackIndex: 0,
      isShuffle: false,
      repeatMode: "none",
      savedPlaylists: [],
      currentTrack: null,

      /* Playback */
      isInitialized: false,
      isPlaying: false,
      duration: 0,
      currentTime: 0,
      player: null,

      // ───── Cassette Realism State ─────
      powerOn: true,
      volume: 1.0,
      playbackRate: 1.0,
      reelRotation: 0,

      /* ───── Core Player Controls ───── */
      loadTrack: (track) => {
        set({ currentTrack: track, isInitialized: true });
        get().playSfx("insert");
      },

      play: () => {
        const { player, powerOn } = get();
        if (player && powerOn) player.play();
        get().playSfx("click");
      },

      pause: () => {
        const { player } = get();
        if (player) player.pause();
        get().playSfx("click");
      },

      togglePlayPause: () => {
        const { isPlaying } = get();
        if (isPlaying) get().pause();
        else get().play();
      },

      seekTo: (seconds) => {
        const { player } = get();
        if (player) player.seekTo(seconds);
      },

      /* ───── Tape Simulation Controls ───── */
      rewind: (seconds = 5) => {
        const { currentTime, seekTo } = get();
        const newTime = Math.max(0, currentTime - seconds);
        seekTo(newTime);
      },

      fastForward: (seconds = 5) => {
        const { currentTime, duration, seekTo } = get();
        const newTime = Math.min(duration, currentTime + seconds);
        seekTo(newTime);
      },

      restartTrack: () => {
        get().seekTo(0);
      },

      setVolume: (level) => {
        const { player } = get();
        const normalizedLevel = Math.max(0, Math.min(1, level));
        set({ volume: normalizedLevel });

        // Note: expo-audio AudioPlayer doesn't expose setVolume method directly
        // Volume control should be implemented at the player instance level
        // This is a placeholder for future implementation
        if (player && "volume" in player) {
          try {
            (player as any).volume = normalizedLevel;
          } catch (error) {
            console.warn("Volume control not available:", error);
          }
        }
      },

      setPlaybackRate: (rate) => {
        const { player } = get();
        const normalizedRate = Math.max(0.5, Math.min(2.0, rate));
        set({ playbackRate: normalizedRate });

        // Note: expo-audio AudioPlayer doesn't expose setRate method directly
        // Playback rate control should be implemented at the player instance level
        // This is a placeholder for future implementation
        if (player && "rate" in player) {
          try {
            (player as any).rate = normalizedRate;
          } catch (error) {
            console.warn("Playback rate control not available:", error);
          }
        }
      },

      setPowerState: (on) => {
        const { player, isPlaying } = get();
        set({ powerOn: on });
        if (!on && isPlaying && player) {
          player.pause();
        }
        get().playSfx("click");
      },

      playSfx: async (name) => {
        try {
          const sfxMap = {
            insert: require("../../assets/sfx/tape-cassette-insert.mp3"),
            eject: require("../../assets/sfx/cassette-eject.mp3"),
            click: require("../../assets/sfx/button-click.mp3"),
          };
          // Note: This will need to be implemented with expo-audio
          // For now, it's a placeholder for future SFX implementation
        } catch (error) {
          console.warn(`SFX ${name} not found:`, error);
        }
      },

      setReelRotation: () => {
        const { currentTime, duration, isPlaying } = get();
        if (duration > 0) {
          const progress = currentTime / duration;
          const rotation = progress * 360 * 3; // 3 full rotations per track
          set({ reelRotation: rotation });
        }
      },

      /* ───── Playlist Controls ───── */
      addToPlaylist: (track) =>
        set((state) => ({ playlist: [...state.playlist, track] })),

      removeFromPlaylist: (trackId) =>
        set((state) => ({
          playlist: state.playlist.filter((t) => t.id !== trackId),
        })),

      clearPlaylist: () => set({ playlist: [], currentTrackIndex: 0 }),

      clearQueueAfter: (index) =>
        set((state) => ({
          playlist: state.playlist.slice(0, index + 1),
        })),

      playNext: () => {
        const state = get();
        if (state.playlist.length === 0) return;

        let nextIndex = state.currentTrackIndex + 1;
        if (state.isShuffle)
          nextIndex = Math.floor(Math.random() * state.playlist.length);
        else if (nextIndex >= state.playlist.length) {
          if (state.repeatMode === "all") nextIndex = 0;
          else return;
        }

        const nextTrack = state.playlist[nextIndex];
        set({ currentTrackIndex: nextIndex });
        state.loadTrack(nextTrack);
      },

      playPrevious: () => {
        const state = get();
        if (state.playlist.length === 0) return;

        let prevIndex = state.currentTrackIndex - 1;
        if (prevIndex < 0) prevIndex = state.playlist.length - 1;

        const prevTrack = state.playlist[prevIndex];
        set({ currentTrackIndex: prevIndex });
        state.loadTrack(prevTrack);
      },

      jumpToTrack: (index) => {
        const { playlist } = get();
        if (index < 0 || index >= playlist.length) return;
        const track = playlist[index];
        set({ currentTrackIndex: index });
        get().loadTrack(track);
      },

      toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
      setRepeatMode: (mode) => set({ repeatMode: mode }),
      loadPlaylist: (tracks) => set({ playlist: tracks, currentTrackIndex: 0 }),

      /* ───── Advanced Playlist Management ───── */
      enqueueNext: (track) =>
        set((state) => {
          const newPlaylist = [...state.playlist];
          const insertIndex = state.currentTrackIndex + 1;
          newPlaylist.splice(insertIndex, 0, track);
          return { playlist: newPlaylist };
        }),

      addTracks: (tracks) =>
        set((state) => ({
          playlist: [...state.playlist, ...tracks],
        })),

      shufflePlaylist: () => {
        const { playlist } = get();
        const shuffled = [...playlist];

        // Fisher–Yates shuffle
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        set({ playlist: shuffled, currentTrackIndex: 0 });
      },

      savePlaylist: (name) => {
        const { playlist } = get();
        const newSavedPlaylist: SavedPlaylist = {
          name,
          tracks: playlist,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          savedPlaylists: [...state.savedPlaylists, newSavedPlaylist],
        }));
      },

      loadSavedPlaylist: (name) => {
        const { savedPlaylists } = get();
        const playlist = savedPlaylists.find((p) => p.name === name);
        if (playlist) {
          set({ playlist: playlist.tracks, currentTrackIndex: 0 });
        }
      },

      autoPlaylist: (mode) => {
        const { playlist } = get();
        let filtered = [...playlist];

        switch (mode) {
          case "retro":
            filtered = filtered.filter(
              (track) =>
                track.title.toLowerCase().includes("retro") ||
                track.artist.toLowerCase().includes("vintage")
            );
            break;
          case "party":
            filtered = filtered.filter(
              (track) =>
                track.title.toLowerCase().includes("party") ||
                track.title.toLowerCase().includes("dance")
            );
            break;
          case "chill":
            filtered = filtered.filter(
              (track) =>
                track.title.toLowerCase().includes("chill") ||
                track.title.toLowerCase().includes("relax")
            );
            break;
        }

        set({ playlist: filtered, currentTrackIndex: 0 });
      },

      suggestNextTrack: () => {
        const { playlist, currentTrack } = get();
        if (playlist.length === 0 || !currentTrack) return null;

        // Placeholder for AI-powered suggestions
        // For now, return a random track that's not the current one
        const otherTracks = playlist.filter((t) => t.id !== currentTrack.id);
        if (otherTracks.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * otherTracks.length);
        return otherTracks[randomIndex];
      },
    }),
    {
      name: "walkman-player-store",
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
        playlist: state.playlist,
        currentTrackIndex: state.currentTrackIndex,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        savedPlaylists: state.savedPlaylists,
        currentTrack: state.currentTrack,
        isInitialized: state.isInitialized,
        isPlaying: state.isPlaying,
        duration: state.duration,
        currentTime: state.currentTime,
        player: state.player,
        powerOn: state.powerOn,
        volume: state.volume,
        playbackRate: state.playbackRate,
        reelRotation: state.reelRotation,
        loadTrack: state.loadTrack,
        play: state.play,
        pause: state.pause,
        togglePlayPause: state.togglePlayPause,
        seekTo: state.seekTo,
        rewind: state.rewind,
        fastForward: state.fastForward,
        restartTrack: state.restartTrack,
        setVolume: state.setVolume,
        setPlaybackRate: state.setPlaybackRate,
        setPowerState: state.setPowerState,
        playSfx: state.playSfx,
        setReelRotation: state.setReelRotation,
        addToPlaylist: state.addToPlaylist,
        removeFromPlaylist: state.removeFromPlaylist,
        clearPlaylist: state.clearPlaylist,
        clearQueueAfter: state.clearQueueAfter,
        playNext: state.playNext,
        playPrevious: state.playPrevious,
        jumpToTrack: state.jumpToTrack,
        toggleShuffle: state.toggleShuffle,
        setRepeatMode: state.setRepeatMode,
        loadPlaylist: state.loadPlaylist,
        enqueueNext: state.enqueueNext,
        addTracks: state.addTracks,
        shufflePlaylist: state.shufflePlaylist,
        savePlaylist: state.savePlaylist,
        loadSavedPlaylist: state.loadSavedPlaylist,
        autoPlaylist: state.autoPlaylist,
        suggestNextTrack: state.suggestNextTrack,
      }),
    }
  )
);

/* ────────────────────────────────
   HOOK: usePlayerController
──────────────────────────────── */
export function usePlayerController(track?: Track) {
  const player = useAudioPlayer(track?.audio, { updateInterval: 200 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    (async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });
    })();
  }, []);

  useEffect(() => {
    usePlayerStore.setState({
      isInitialized: true,
      isPlaying: status.playing,
      duration: status.duration,
      currentTime: status.currentTime,
      player,
      play: () => player.play(),
      pause: () => player.pause(),
      seekTo: (t) => player.seekTo(t),
    });

    // Update reel rotation when time changes
    usePlayerStore.getState().setReelRotation();
  }, [status, player, track]);
}
