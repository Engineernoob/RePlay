# MP3 File Setup Guide

## Quick Start: Adding New MP3 Files

To add a new MP3 file to your Walkman app:

### Step 1: Add the MP3 File
Place your MP3 file in: `assets/mp3s/YourSong.mp3`

### Step 2: Update Configuration
Edit `src/config/mp3Config.ts` and add:

```typescript
{
  filename: "YourSong.mp3",
  title: "Your Song Title",
  artist: "Artist Name",
  color: "#FF5733", // Choose a color for the track
  genre: "Pop", // Optional
  year: "2024", // Optional
  albumName: "Album Name", // Optional
  albumArt: require("@/assets/images/covers/YourCover.png"), // Optional
},
```

### Step 3: Add the Require Statement
Edit `src/utils/mp3Loader.ts` and add to the `AUDIO_MAP`:

```typescript
"YourSong.mp3": require("@/assets/mp3s/YourSong.mp3"),
```

### Step 4: (Optional) Run Auto-Update Script
```bash
npm run update-mp3s
```

This script will:
- Scan the `assets/mp3s/` folder
- Detect new MP3 files
- Show you what needs to be added to the config
- Help keep everything in sync

## How It Works

1. **MP3 Config** (`src/config/mp3Config.ts`) - Contains metadata for all MP3 files
2. **MP3 Loader** (`src/utils/mp3Loader.ts`) - Maps filenames to audio requires
3. **Tracks Data** (`src/data/tracks.ts`) - Automatically uses MP3 config
4. **Library Screen** - Shows all MP3 files for cassette creation

## Notes

- React Native requires explicit `require()` statements for assets
- The config file makes it easy to add metadata
- The loader automatically generates Track objects from the config
- All MP3s are available in the Library when creating cassettes

## Example

```typescript
// In mp3Config.ts
{
  filename: "SummerVibes.mp3",
  title: "Summer Vibes",
  artist: "DJ Cool",
  color: "#FFDD57",
  genre: "Electronic",
  year: "2024",
}

// In mp3Loader.ts AUDIO_MAP
"SummerVibes.mp3": require("@/assets/mp3s/SummerVibes.mp3"),
```

That's it! The track will automatically appear in:
- Explore screen
- Library MP3 selector
- Available for cassette creation

