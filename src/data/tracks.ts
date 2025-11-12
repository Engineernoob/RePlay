import { Track } from "@/src/types/audio";
import { getAvailableMP3Tracks } from "@/src/utils/mp3Loader";

/**
 * Centralized track data source
 * Automatically loads tracks from MP3 configuration
 * 
 * To add new tracks, update src/config/mp3Config.ts
 */
export const AVAILABLE_TRACKS: Track[] = getAvailableMP3Tracks();

/**
 * Get track by ID
 */
export function getTrackById(id: string): Track | undefined {
  return AVAILABLE_TRACKS.find((track) => track.id === id);
}

/**
 * Get tracks by artist
 */
export function getTracksByArtist(artist: string): Track[] {
  return AVAILABLE_TRACKS.filter(
    (track) => track.artist.toLowerCase() === artist.toLowerCase()
  );
}

/**
 * Get tracks by genre
 */
export function getTracksByGenre(genre: string): Track[] {
  return AVAILABLE_TRACKS.filter(
    (track) => track.genre?.toLowerCase() === genre.toLowerCase()
  );
}

/**
 * Search tracks by title or artist
 */
export function searchTracks(query: string): Track[] {
  const lowerQuery = query.toLowerCase();
  return AVAILABLE_TRACKS.filter(
    (track) =>
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery)
  );
}

