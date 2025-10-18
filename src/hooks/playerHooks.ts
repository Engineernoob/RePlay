import { useEffect, useMemo } from "react";
import { useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { usePlayerStore } from "@/src/store/playerStore";

/* ────────────────────────────────
   VISUAL SYNC HOOKS
──────────────────────────────── */

/**
 * Returns normalized playback progress (0-1) for UI elements
 * Updates automatically with current playback position
 */
export function useProgress(): number {
  const { currentTime, duration } = usePlayerStore();

  const progress = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min(1, Math.max(0, currentTime / duration));
  }, [currentTime, duration]);

  return progress;
}

/**
 * Returns animated LED brightness value based on playback state
 * LED dims when paused, brightens when playing pulses with volume
 */
export function useLEDStatus(): {
  brightness: number;
  isAnimating: boolean;
} {
  const { isPlaying, volume, powerOn } = usePlayerStore();

  const brightness = useMemo(() => {
    if (!powerOn) return 0.2; // Dim when powered off
    
    if (isPlaying) {
      // Pulsing effect when playing, modulated by volume
      return 0.5 + (volume * 0.5); // Range: 0.5 to 1.0
    }
    
    return 0.3; // Moderate brightness when paused
  }, [isPlaying, volume, powerOn]);

  return {
    brightness,
    isAnimating: isPlaying && powerOn,
  };
}

/**
 * Returns current track metadata with fallback values
 * Safe to use even when no track is loaded
 */
export function useTrackMetadata(): {
  title: string;
  artist: string;
  album: any;
  color: string;
  hasTrack: boolean;
} {
  const { currentTrack } = usePlayerStore();

  return useMemo(() => {
    if (!currentTrack) {
      return {
        title: "No Track",
        artist: "Unknown Artist",
        album: null,
        color: "#666666",
        hasTrack: false,
      };
    }

    return {
      title: currentTrack.title || "Untitled",
      artist: currentTrack.artist || "Unknown Artist",
      album: currentTrack.album || null,
      color: currentTrack.color || "#666666",
      hasTrack: true,
    };
  }, [currentTrack]);
}

/**
 * Returns animated reel rotation values for cassette visualization
 * Left and right reels rotate in opposite directions
 */
export function useReelAnimation(): {
  leftReelRotation: number;
  rightReelRotation: number;
  isAnimating: boolean;
} {
  const { reelRotation, isPlaying, powerOn } = usePlayerStore();

  const leftReelRotation = useMemo(() => {
    return powerOn ? reelRotation : 0;
  }, [reelRotation, powerOn]);

  const rightReelRotation = useMemo(() => {
    // Right reel rotates in opposite direction
    return powerOn ? -reelRotation : 0;
  }, [reelRotation, powerOn]);

  return {
    leftReelRotation,
    rightReelRotation,
    isAnimating: isPlaying && powerOn,
  };
}

/**
 * Returns volume level as percentage (0-100) for UI sliders
 * Ensures value is always within valid range
 */
export function useVolumeLevel(): number {
  const { volume } = usePlayerStore();

  return useMemo(() => {
    return Math.round(volume * 100);
  }, [volume]);
}

/**
 * Returns playback rate as human-readable string
 * Examples: "0.5x", "1.0x", "1.5x", "2.0x"
 */
export function usePlaybackRateDisplay(): string {
  const { playbackRate } = usePlayerStore();

  return useMemo(() => {
    return `${playbackRate.toFixed(1)}x`;
  }, [playbackRate]);
}

/**
 * Returns current time and duration formatted as MM:SS
 * Safe to use even when no track is loaded
 */
export function useFormattedTime(): {
  currentTime: string;
  duration: string;
  formattedProgress: string;
} {
  const { currentTime, duration } = usePlayerStore();

  const formatTime = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "0:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return useMemo(() => {
    const currentTimeStr = formatTime(currentTime);
    const durationStr = formatTime(duration);
    const formattedProgress = `${currentTimeStr} / ${durationStr}`;

    return {
      currentTime: currentTimeStr,
      duration: durationStr,
      formattedProgress,
    };
  }, [currentTime, duration]);
}

/**
 * Returns sequential track info for queue display
 * Includes current, next, and previous track metadata
 */
export function useQueueInfo(): {
  current: ReturnType<typeof useTrackMetadata>;
  next: ReturnType<typeof useTrackMetadata>;
  previous: ReturnType<typeof useTrackMetadata>;
  queueLength: number;
  currentPosition: number;
} {
  const { playlist, currentTrackIndex } = usePlayerStore();
  
  const current = useTrackMetadata();
  
  const next = useMemo(() => {
    const nextIndex = currentTrackIndex < playlist.length - 1 
      ? currentTrackIndex + 1 
      : -1;
    
    if (nextIndex >= 0 && playlist[nextIndex]) {
      return {
        title: playlist[nextIndex].title || "Untitled",
        artist: playlist[nextIndex].artist || "Unknown Artist",
        album: playlist[nextIndex].album || null,
        color: playlist[nextIndex].color || "#666666",
        hasTrack: true,
      };
    }
    
    return {
      title: "No Next Track",
      artist: "",
      album: null,
      color: "#666666",
      hasTrack: false,
    };
  }, [playlist, currentTrackIndex]);

  const previous = useMemo(() => {
    const prevIndex = currentTrackIndex > 0 
      ? currentTrackIndex - 1 
      : playlist.length - 1;
    
    if (prevIndex >= 0 && playlist[prevIndex]) {
      return {
        title: playlist[prevIndex].title || "Untitled",
        artist: playlist[prevIndex].artist || "Unknown Artist",
        album: playlist[prevIndex].album || null,
        color: playlist[prevIndex].color || "#666666",
        hasTrack: true,
      };
    }
    
    return {
      title: "No Previous Track",
      artist: "",
      album: null,
      color: "#666666",
      hasTrack: false,
    };
  }, [playlist, currentTrackIndex]);

  return {
    current,
    next,
    previous,
    queueLength: playlist.length,
    currentPosition: playlist.length > 0 ? currentTrackIndex + 1 : 0,
  };
}

/**
 * Returns power state information for UI
 * Includes visual indicators and interaction states
 */
export function usePowerState(): {
  isOn: boolean;
  isAvailable: boolean;
  indicatorColor: string;
  canInteract: boolean;
} {
  const { powerOn, currentTrack } = usePlayerStore();

  return useMemo(() => {
    const isOn = powerOn;
    const isAvailable = true; // Always available in current implementation
    const indicatorColor = isOn ? "#00FF00" : "#FF0000";
    const canInteract = isOn && !!currentTrack;

    return {
      isOn,
      isAvailable,
      indicatorColor,
      canInteract,
    };
  }, [powerOn, currentTrack]);
}
