import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { usePlayerController, usePlayerStore } from "@/src/store/playerStore";
import Cassette from "@/components/Cassette";

// ✅ songs data mapping for quick lookup
const songs: Record<string, { audio: any; album: any; color: string; artist: string; title: string }> = {
  "1": {
    title: "On My Mama",
    artist: "Victoria Monét",
    audio: require("@/assets/mp3s/OnMyMama.mp3"),
    album: require("@/assets/images/covers/VictoriaMonèt.png"),
    color: "#FF7E57",
  },
  "2": {
    title: "Timeless",
    artist: "The Weeknd & Playboi Carti",
    audio: require("@/assets/mp3s/Timeless.mp3"),
    album: require("@/assets/images/covers/Timeless.png"),
    color: "#7E57FF",
  },
  "3": {
    title: "Paint the Town Red",
    artist: "Doja Cat",
    audio: require("@/assets/mp3s/Paint-The-Town-Red.mp3"),
    album: require("@/assets/images/covers/Paint-The-Town-Red.png"),
    color: "#D62D2D",
  },
};

export default function PlayerScreen() {
  const { id = "1" } = useLocalSearchParams<{ id?: string }>();
  const song = songs[id];
  const { play, pause, isPlaying, currentTime, duration } = usePlayerStore();

  // init audio player for selected song
  usePlayerController(song.audio);

  // animation for cassette sliding into deck
  const cassetteStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(isPlaying ? 0 : 200, { duration: 700 }) }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      {/* background glow based on song color */}
      <BlurView style={[styles.glow, { backgroundColor: song.color }]} intensity={40} tint="dark" />

      {/* album title */}
      <Text style={styles.title}>{song.title}</Text>
      <Text style={styles.artist}>{song.artist}</Text>

      {/* Cassette animation */}
      <Animated.View style={[cassetteStyle]}>
        <Cassette color={song.color} album={song.album} />
      </Animated.View>

      {/* Controls */}
      <TouchableOpacity style={[styles.button, { backgroundColor: song.color }]} onPress={() => (isPlaying ? pause() : play())}>
        <Text style={styles.buttonText}>{isPlaying ? "⏸ Pause" : "▶️ Play"}</Text>
      </TouchableOpacity>

      <Text style={styles.time}>
        {Math.floor(currentTime)} / {Math.floor(duration)} sec
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  glow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.2,
    top: "30%",
    zIndex: -1,
  },
  title: { color: "#FFF", fontSize: 24, fontWeight: "700", marginTop: 10 },
  artist: { color: "#AAA", fontSize: 16, marginBottom: 20 },
  button: {
    marginTop: 40,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  time: { color: "#999", marginTop: 15 },
});



