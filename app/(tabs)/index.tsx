import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Walkman from "@/components/Walkman"; // ✅ main player body
import { usePlayerStore } from "@/src/store/playerStore"; // ✅ Zustand player state

export default function IndexScreen() {
  const { isPlaying, play, pause } = usePlayerStore();

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
