import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlayerStore } from "@/src/store/playerStore";
import Walkman from "@/components/Walkman";
import ErrorDisplay from "@/src/components/ErrorDisplay";
import { getTrackById } from "@/src/data/tracks";
import type { Track } from "@/src/types/audio";

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { loadTrack, isLoading, currentTrack } = usePlayerStore();

  useEffect(() => {
    // Load selected track into player when component mounts or params change
    if (id) {
      const track = getTrackById(id);
      if (track) {
        loadTrack(track);
      }
    }
  }, [id, loadTrack]);

  if (isLoading && !currentTrack) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFDD57" />
        <Text style={styles.loadingText}>Loading track...</Text>
      </View>
    );
  }

  const backgroundColor = currentTrack?.color || "#0C2233";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Error Display */}
      <ErrorDisplay />
      
      {/* Main Walkman Interface */}
      <Walkman />
      
      {/* Track Info Display */}
      {currentTrack && (
        <View style={styles.trackInfo}>
          <Text style={styles.title}>{currentTrack.title}</Text>
          <Text style={styles.artist}>{currentTrack.artist}</Text>
        </View>
      )}
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
  loadingContainer: {
    justifyContent: "center",
  },
  loadingText: {
    color: "#FFDD57",
    fontSize: 16,
    marginTop: 16,
    opacity: 0.8,
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

