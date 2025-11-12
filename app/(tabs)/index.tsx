import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Walkman from "@/components/Walkman"; // ✅ main player body
import { usePlayerStore } from "@/src/store/playerStore"; // ✅ Zustand player state
import { useLibraryStore } from "@/src/store/libraryStore";
import { AVAILABLE_TRACKS } from "@/src/data/tracks";

export default function IndexScreen() {
  const { isPlaying, play, pause, currentTrack, loadTrack, activeCassetteId, setActiveCassetteId } = usePlayerStore();
  const { getLastPlayedCassette } = useLibraryStore();

  // Playback Resume Logic: Auto-load last played cassette on app start
  useEffect(() => {
    const lastPlayed = getLastPlayedCassette();
    if (lastPlayed && !activeCassetteId && !currentTrack) {
      // Load the last played cassette
      const { loadCassette } = useLibraryStore.getState();
      const cassette = loadCassette(lastPlayed.id);
      
      if (cassette) {
        setActiveCassetteId(cassette.id);
        usePlayerStore.getState().loadPlaylist(cassette.tracks);
        
        // Resume from saved position
        if (cassette.lastPlayed && cassette.position !== undefined) {
          const lastTrack = cassette.tracks.find(t => t.id === cassette.lastPlayed);
          if (lastTrack) {
            loadTrack(lastTrack);
            setTimeout(() => {
              usePlayerStore.getState().seekTo(cassette.position || 0);
            }, 500);
          }
        } else if (cassette.tracks.length > 0) {
          loadTrack(cassette.tracks[0]);
        }
      }
    } else if (!currentTrack && AVAILABLE_TRACKS.length > 0) {
      // Fallback: Load first track if no cassette
      loadTrack(AVAILABLE_TRACKS[0]);
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) pause();
    else play();
  };

  return (
    <View style={styles.container}>
      {/* Walkman device */}
      <Walkman />

      {/* Controls */}
      <TouchableOpacity
        onPress={togglePlay}
        style={[
          styles.button,
          { backgroundColor: isPlaying ? "#D62D2D" : "#FFDD57" },
        ]}
      >
        <Text style={styles.buttonText}>
          {isPlaying ? "⏸ Pause" : "▶️ Play"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C2233",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
});
