import { Track } from "@/src/types/audio";
import { MP3_CONFIG } from "@/src/config/mp3Config";

/**
 * MP3 File Loader
 * Automatically loads MP3 files from the configuration
 * 
 * To add new MP3s:
 * 1. Place the MP3 file in assets/mp3s/
 * 2. Add entry to src/config/mp3Config.ts
 * 3. Add require() below for the new file
 * 4. Run: npm run update-mp3s (optional - helps auto-detect new files)
 */

// Audio file mapping - add require() statements here for new MP3s
const AUDIO_MAP: Record<string, any> = {
  "OnMyMama.mp3": require("@/assets/mp3s/OnMyMama.mp3"),
  "Timeless.mp3": require("@/assets/mp3s/Timeless.mp3"),
  "PaintTheTownRed.mp3": require("@/assets/mp3s/PaintTheTownRed.mp3"),
  // Add new MP3 files here:
  // "YourNewSong.mp3": require("@/assets/mp3s/YourNewSong.mp3"),
};

/**
 * Get all available MP3 files as tracks
 * Automatically generates tracks from MP3_CONFIG
 */
export function getAvailableMP3Tracks(): Track[] {
  return MP3_CONFIG.map((config, index) => {
    const audio = AUDIO_MAP[config.filename];
    
    if (!audio) {
      console.warn(`Audio file not found for: ${config.filename}. Make sure to add the require() in mp3Loader.ts`);
    }

    return {
      id: `mp3_${config.filename}_${index}`,
      title: config.title,
      artist: config.artist,
      audio: audio || null, // Will show error if not found
      album: config.albumArt || require("@/assets/images/covers/VictoriaMonet.png"),
      color: config.color,
      genre: config.genre || "Unknown",
      year: config.year || new Date().getFullYear().toString(),
      albumName: config.albumName,
    };
  }).filter((track) => track.audio !== null); // Filter out tracks without audio
}

/**
 * Get track by filename
 */
export function getTrackByFilename(filename: string): Track | null {
  const config = MP3_CONFIG.find((c) => c.filename === filename);
  if (!config) return null;

  const audio = AUDIO_MAP[filename];
  if (!audio) return null;

  return {
    id: `mp3_${filename}_${Date.now()}`,
    title: config.title,
    artist: config.artist,
    audio: audio,
    album: config.albumArt || require("@/assets/images/covers/VictoriaMonet.png"),
    color: config.color,
    genre: config.genre || "Unknown",
    year: config.year || new Date().getFullYear().toString(),
    albumName: config.albumName,
  };
}

/**
 * Get list of available MP3 filenames
 */
export function getAvailableMP3Filenames(): string[] {
  return MP3_CONFIG.map((config) => config.filename);
}

