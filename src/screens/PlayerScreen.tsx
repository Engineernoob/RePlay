import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Cassette from "../../components/Cassette";
import { usePlayerController, usePlayerStore } from "../store/playerStore";

const source = require("../../assets/sample.mp3");

export default function PlayerScreen() {
  usePlayerController(source);
  const { play, pause, isPlaying, currentTime, duration } = usePlayerStore();

  const togglePlay = () => (isPlaying ? pause() : play());

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CassetteBeat 🎵</Text>
      <Cassette /> {/* ✅ no props needed, uses Zustand internally */}
      <TouchableOpacity style={styles.button} onPress={togglePlay}>
        <Text style={styles.buttonText}>{isPlaying ? "Pause" : "Play"}</Text>
      </TouchableOpacity>
      <Text style={styles.time}>
        {Math.floor(currentTime)} / {Math.floor(duration)} sec
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#fff", fontSize: 24, marginBottom: 20 },
  button: {
    backgroundColor: "#FF6B6B",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  time: { color: "#aaa", marginTop: 20 },
});
