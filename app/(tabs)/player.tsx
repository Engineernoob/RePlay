import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { usePlayerController, usePlayerStore, playSfx } from "@/src/store/playerStore";
import Cassette from "@/components/Cassette";

// ✅ songs data mapping
const songs: Record<string, { audio: any; album: any; color: string; artist: string; title: string }> = {
  "1": {
    title: "On My Mama",
    artist: "Victoria Monét",
    audio: require("@/assets/mp3s/OnMyMama.mp3"),
    album: require("@/assets/images/covers/VictoriaMonet.png"),
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
    audio: require("@/assets/mp3s/PaintTheTownRed.mp3"),
    album: require("@/assets/images/covers/Paint-The-Town-Red.png"),
    color: "#D62D2D",
  },
};

export default function PlayerScreen() {
  const { id = "1" } = useLocalSearchParams<{ id?: string }>();
  const song = songs[id];
  const { play, pause, isPlaying, currentTime, duration } = usePlayerStore();

  // initialize player
  usePlayerController(song.audio);

  // track whether cassette already inserted
  const hasInserted = useRef(false);

  // handle sound effects for insert + close
  useEffect(() => {
    if (isPlaying && !hasInserted.current) {
      hasInserted.current = true;

      // 1️⃣ cassette slides in
      playSfx(require("@/assets/sfx/tape-cassette-insert.mp3"));

      // 2️⃣ door closes slightly after
      playSfx(require("@/assets/sfx/closing-tape-cassette.mp3"), 600);
    }
  }, [isPlaying]);

  // 3️⃣ eject sound when stopping playback
  useEffect(() => {
    if (!isPlaying && hasInserted.current) {
      playSfx(require("@/assets/sfx/cassette-eject.mp3"));
      hasInserted.current = false;
    }
  }, [isPlaying]);

  // animation for cassette slide
  const cassetteStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(isPlaying ? 0 : 200, { duration: 800 }) }],
  }));

  return (
    <ImageBackground
      source={require("@/assets/images/walkman.jpg")}
      style={styles.background}
      resizeMode="contain"
    >
      <View style={[styles.container]}>
        <BlurView style={[styles.glow, { backgroundColor: song.color }]} intensity={40} tint="dark" />

        {/* Info */}
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.artist}>{song.artist}</Text>

        {/* Cassette */}
        <Animated.View style={[cassetteStyle]}>
          <Cassette color={song.color} album={song.album} />
        </Animated.View>

        {/* Controls */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: song.color }]}
          onPress={() => (isPlaying ? pause() : play())}
        >
          <Text style={styles.buttonText}>{isPlaying ? "⏸ Pause" : "▶️ Play"}</Text>
        </TouchableOpacity>

        <Text style={styles.time}>
          {Math.floor(currentTime)} / {Math.floor(duration)} sec
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
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




