import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlayerStore } from "@/src/store/playerStore";
import Walkman from "@/components/Walkman";
import type { Track } from "@/src/store/playerStore";

export default function PlayerScreen() {
  const { id, title, artist, color } = useLocalSearchParams();
  const { loadTrack } = usePlayerStore();

  useEffect(() => {
    // Load selected track into player when component mounts or params change
    if (id && title && artist && color) {
      const track: Track = {
        id: String(id),
        title: String(title),
        artist: String(artist),
        audio: null, // Would be actual audio file in production
        album: null, // Would be actual album art in production
        color: Array.isArray(color) ? color[0] : String(color),
      };
      loadTrack(track);
    }
  }, [id, title, artist, color, loadTrack]);

  const backgroundColor = Array.isArray(color) ? color[0] : color || "#0C2233";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Main Walkman Interface */}
      <Walkman />
      
      {/* Track Info Display */}
      <View style={styles.trackInfo}>
        <Text style={styles.title}>{title || "No Track Selected"}</Text>
        <Text style={styles.artist}>{artist || "---"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  trackInfo: {
    marginTop: 20,
    alignItems: "center",
  },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
  },
  artist: {
    color: "#AAA",
    fontSize: 16,
  },
});

