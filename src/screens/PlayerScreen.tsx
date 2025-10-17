import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlayerController, usePlayerStore, playSfx } from "../../src/store/playerStore";
import Walkman from "../../components/Walkman";

// 🎵 Song data
const songs: Record<
  string,
  { title: string; artist: string; color: string; album: any; audio: any }
> = {
  "1": {
    title: "On My Mama",
    artist: "Victoria Monét",
    color: "#FF7E57",
    album: require("../../assets/images/covers/VictoriaMonet.png"),
    audio: require("../../assets/mp3s/OnMyMama.mp3"),
  },
  "2": {
    title: "Timeless",
    artist: "The Weeknd & Playboi Carti",
    color: "#7E57FF",
    album: require("../../assets/images/covers/Timeless.png"),
    audio: require("../../assets/mp3s/Timeless.mp3"),
  },
  "3": {
    title: "Paint the Town Red",
    artist: "Doja Cat",
    color: "#D62D2D",
    album: require("../../assets/images/covers/Paint-The-Town-Red.png"),
    audio: require("../../assets/mp3s/PaintTheTownRed.mp3"),
  },
};

export default function PlayerScreen() {
  const { id = "1" } = useLocalSearchParams<{ id?: string }>();
  const song = songs[id];
  const { play, pause, isPlaying, currentTime, duration } = usePlayerStore();
  const hasInserted = useRef(false);

  // Attach player to selected tape
  usePlayerController(song.audio);

  const togglePlay = () => (isPlaying ? pause() : play());

  // Handle cassette sound effects
  useEffect(() => {
    if (isPlaying && !hasInserted.current) {
      hasInserted.current = true;
      playSfx(require("../../assets/sfx/tape-cassette-insert.mp3"));
      playSfx(require("../../assets/sfx/closing-tape-cassette.mp3"), 500);
    }
    if (!isPlaying && hasInserted.current) {
      playSfx(require("../../assets/sfx/cassette-eject.mp3"));
      hasInserted.current = false;
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: song.color }]}>{song.title}</Text>
      <Text style={styles.artist}>{song.artist}</Text>

      {/* 🎛 The Walkman deck */}
      <Walkman cassetteInserted={isPlaying} color={song.color} album={song.album} />

      {/* Play / Pause button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: song.color }]}
        onPress={togglePlay}
      >
        <Text style={styles.buttonText}>{isPlaying ? "⏸ Pause" : "▶️ Play"}</Text>
      </TouchableOpacity>

      {/* Playback time */}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  artist: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 40,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  time: {
    color: "#aaa",
    marginTop: 20,
  },
});


