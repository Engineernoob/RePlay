/**
 * MP3 Configuration
 * Add new MP3 files here - they'll automatically be available in the Library
 * 
 * To add a new MP3:
 * 1. Place the file in assets/mp3s/
 * 2. Add an entry below with the filename and metadata
 */

export interface MP3FileConfig {
  filename: string;
  title: string;
  artist: string;
  color: string;
  genre?: string;
  year?: string;
  albumName?: string;
  albumArt?: any; // Optional: require("@/assets/images/covers/...")
}

/**
 * MP3 Files Configuration
 * Add your MP3 files here - they'll be automatically loaded
 */
export const MP3_CONFIG: MP3FileConfig[] = [
  {
    filename: "OnMyMama.mp3",
    title: "On My Mama",
    artist: "Victoria Monét",
    color: "#FF7E57",
    genre: "R&B",
    year: "2023",
    albumName: "JAGUAR",
    albumArt: require("@/assets/images/covers/VictoriaMonet.png"),
  },
  {
    filename: "Timeless.mp3",
    title: "Timeless",
    artist: "The Weeknd & Playboi Carti",
    color: "#7E57FF",
    genre: "Hip-Hop",
    year: "2024",
    albumName: "Timeless",
    albumArt: require("@/assets/images/covers/Timeless.png"),
  },
  {
    filename: "PaintTheTownRed.mp3",
    title: "Paint the Town Red",
    artist: "Doja Cat",
    color: "#D62D2D",
    genre: "Pop",
    year: "2023",
    albumName: "Scarlet",
    albumArt: require("@/assets/images/covers/Paint-The-Town-Red.png"),
  },
  // Add more MP3 files here:
  // {
  //   filename: "YourNewSong.mp3",
  //   title: "Your Song Title",
  //   artist: "Artist Name",
  //   color: "#FF5733",
  //   genre: "Genre",
  //   year: "2024",
  // },
];

