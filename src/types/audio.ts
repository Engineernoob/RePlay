import { ImageSourcePropType } from "react-native";

/**
 * Audio source type - can be a local require() or URI string
 */
export type AudioSource = ImageSourcePropType | string;

/**
 * Album art type - can be a local require() or URI string
 */
export type AlbumArtSource = ImageSourcePropType | string;

/**
 * Track interface with proper types
 */
export interface Track {
  id: string;
  title: string;
  artist: string;
  audio: AudioSource;
  album: AlbumArtSource;
  color: string;
  duration?: number; // Duration in seconds (optional, can be calculated)
  genre?: string;
  year?: string;
  albumName?: string;
}

/**
 * Playback status
 */
export interface PlaybackStatus {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Player error types
 */
export enum PlayerErrorType {
  LOAD_ERROR = "LOAD_ERROR",
  PLAY_ERROR = "PLAY_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  PERMISSION_ERROR = "PERMISSION_ERROR",
  UNKNOWN = "UNKNOWN",
}

export interface PlayerError {
  type: PlayerErrorType;
  message: string;
  code?: string;
}

