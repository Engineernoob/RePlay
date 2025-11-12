import { Track } from "@/src/types/audio";

/**
 * Centralized track data source
 * This replaces hardcoded arrays scattered throughout the app
 */
export const AVAILABLE_TRACKS: Track[] = [
  {
    id: "1",
    title: "On My Mama",
    artist: "Victoria Monét",
    audio: require("@/assets/mp3s/OnMyMama.mp3"),
    album: require("@/assets/images/covers/VictoriaMonet.png"),
    color: "#FF7E57",
    genre: "R&B",
    year: "2023",
    albumName: "JAGUAR",
  },
  {
    id: "2",
    title: "Timeless",
    artist: "The Weeknd & Playboi Carti",
    audio: require("@/assets/mp3s/Timeless.mp3"),
    album: require("@/assets/images/covers/Timeless.png"),
    color: "#7E57FF",
    genre: "Hip-Hop",
    year: "2024",
    albumName: "Timeless",
  },
  {
    id: "3",
    title: "Paint the Town Red",
    artist: "Doja Cat",
    audio: require("@/assets/mp3s/PaintTheTownRed.mp3"),
    album: require("@/assets/images/covers/Paint-The-Town-Red.png"),
    color: "#D62D2D",
    genre: "Pop",
    year: "2023",
    albumName: "Scarlet",
  },
];

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

