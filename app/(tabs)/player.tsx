import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { usePlayerController, usePlayerStore } from "@/src/store/playerStore";
import Cassette from "@/components/Cassette";

const tapes: Record<string, any> = {
  "1": require("@/assets/mp3s/midnight.mp3"),
  "2": require("@/assets/mp3s/blinding.mp3"),
  "3": require("@/assets/mp3s/dreams.mp3"),
};

export default function PlayerScreen() {
  const { id = "1", title = "Unknown" } = useLocalSearchParams<{
    id?: string;
    title?: string;
  }>();

  const source = tapes[id];
  usePlayerController(source);

  const { isPlaying, play, pause } = usePlayerStore();

  // Slide cassette animation
  const cassetteStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(isPlaying ? 0 : 200, { duration: 600 }) }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Animated.View style={[cassetteStyle]}>
        <Cassette />
      </Animated.View>

      <TouchableOpacity style={styles.button} onPress={() => (isPlaying ? pause() : play())}>
        <Text style={styles.buttonText}>{isPlaying ? "⏸ Pause" : "▶️ Play"}</Text>
      </TouchableOpacity>

      <Image
        source={require("@/assets/images/walkman-bg.png")}
        style={styles.walkmanBg}
        blurRadius={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  title: { color: "#FFDD57", fontSize: 24, marginBottom: 20, fontWeight: "700" },
  button: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 40,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  walkmanBg: { position: "absolute", width: "100%", height: "100%", opacity: 0.25 },
});


