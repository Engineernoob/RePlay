#!/usr/bin/env node

/**
 * Auto-update MP3 Loader Script
 * 
 * This script scans the assets/mp3s folder and automatically updates
 * the mp3Loader.ts file with new MP3 files.
 * 
 * Run: node scripts/update-mp3-loader.js
 */

const fs = require('fs');
const path = require('path');

const MP3_FOLDER = path.join(__dirname, '../assets/mp3s');
const LOADER_FILE = path.join(__dirname, '../src/utils/mp3Loader.ts');
const CONFIG_FILE = path.join(__dirname, '../src/config/mp3Config.ts');

function getMP3Files() {
  try {
    const files = fs.readdirSync(MP3_FOLDER);
    return files.filter(file => file.endsWith('.mp3'));
  } catch (error) {
    console.error('Error reading MP3 folder:', error);
    return [];
  }
}

function generateAudioMap(mp3Files) {
  const mapEntries = mp3Files.map(file => {
    const baseName = file.replace('.mp3', '');
    return `  "${file}": require("@/assets/mp3s/${file}"),`;
  }).join('\n');

  return `const AUDIO_MAP: Record<string, any> = {\n${mapEntries}\n};`;
}

function updateLoaderFile(mp3Files) {
  const audioMap = generateAudioMap(mp3Files);
  
  const loaderContent = `import { Track } from "@/src/types/audio";
import { MP3_CONFIG } from "@/src/config/mp3Config";

/**
 * MP3 File Loader
 * Automatically loads MP3 files from the configuration
 * 
 * This file is auto-generated. To add new MP3s, update src/config/mp3Config.ts
 * and add the require() statement below.
 */

// Audio file mapping - automatically generated
${audioMap}

/**
 * Get all available MP3 files as tracks
 * Automatically generates tracks from MP3_CONFIG
 */
export function getAvailableMP3Tracks(): Track[] {
  return MP3_CONFIG.map((config, index) => {
    const audio = AUDIO_MAP[config.filename];
    
    if (!audio) {
      console.warn(\`Audio file not found for: \${config.filename}. Make sure to add the require() in mp3Loader.ts\`);
    }

    return {
      id: \`mp3_\${config.filename}_\${index}\`,
      title: config.title,
      artist: config.artist,
      audio: audio || null,
      album: config.albumArt || require("@/assets/images/covers/VictoriaMonet.png"),
      color: config.color,
      genre: config.genre || "Unknown",
      year: config.year || new Date().getFullYear().toString(),
      albumName: config.albumName,
    };
  }).filter((track) => track.audio !== null);
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
    id: \`mp3_\${filename}_\${Date.now()}\`,
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
`;

  fs.writeFileSync(LOADER_FILE, loaderContent, 'utf8');
  console.log(`✅ Updated ${LOADER_FILE} with ${mp3Files.length} MP3 files`);
}

function checkConfigForNewFiles(mp3Files) {
  try {
    const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
    const configFiles = mp3Files.filter(file => {
      const baseName = file.replace('.mp3', '');
      return configContent.includes(`"${file}"`) || configContent.includes(baseName);
    });

    const missingFiles = mp3Files.filter(file => !configFiles.includes(file));
    
    if (missingFiles.length > 0) {
      console.log('\n⚠️  New MP3 files found that need to be added to config:');
      missingFiles.forEach(file => {
        console.log(`   - ${file}`);
        console.log(`     Add this to src/config/mp3Config.ts:`);
        console.log(`     {`);
        console.log(`       filename: "${file}",`);
        console.log(`       title: "Your Song Title",`);
        console.log(`       artist: "Artist Name",`);
        console.log(`       color: "#FF5733",`);
        console.log(`     },`);
      });
    } else {
      console.log('✅ All MP3 files are configured');
    }
  } catch (error) {
    console.error('Error reading config file:', error);
  }
}

// Main execution
console.log('🔍 Scanning for MP3 files...');
const mp3Files = getMP3Files();

if (mp3Files.length === 0) {
  console.log('❌ No MP3 files found in assets/mp3s/');
  process.exit(1);
}

console.log(`📁 Found ${mp3Files.length} MP3 file(s):`);
mp3Files.forEach(file => console.log(`   - ${file}`));

updateLoaderFile(mp3Files);
checkConfigForNewFiles(mp3Files);

console.log('\n✨ Done! MP3 loader updated.');

