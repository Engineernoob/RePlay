import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Cassette from "@/components/Cassette";
import { usePlayerStore } from "../store/playerStore";

export default function PlayerScreen() {
  const { play, pause, isPlaying } = usePlayerStore();

  const onPlay = async () => {
    await play(require("../../assets/sample.mp3"));
  };

  const onPause = async () => {
    await pause();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CassetteBeat 🎵</Text>
      <Cassette />

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#FF6B6B" }]}
          onPress={isPlaying ? onPause : onPlay}
        >
          <Text style={styles.buttonText}>{isPlaying ? "Pause" : "Play"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFDD57",
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "700",
  },
  controls: { flexDirection: "row", marginTop: 30 },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
