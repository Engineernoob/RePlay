import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlayerController, usePlayerStore } from "@/src/store/playerStore";
import Cassette from "@/components/Cassette";
import LCDDisplay from "@/components/LCDDisplay";
import VUMeter from "@/components/VUMeter";
import { WalkmanThemeType } from "@/constants/walkman-theme";
import { useTheme } from "@react-navigation/native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const songs: Record<
  string,
  { audio: any; album: any; color: string; artist: string; title: string }
> = {
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
  const { play, pause, isPlaying } = usePlayerStore();
  const theme = useTheme() as WalkmanThemeType;

  // initialize player
  usePlayerController(song.audio);

  // slide cassette in/out animation
  const cassetteAnim = useAnimatedStyle(() => ({
    transform: [
      { translateY: withTiming(isPlaying ? 0 : 150, { duration: 700 }) },
    ],
  }));

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* LCD + VU Meter */}
      <View style={styles.displaySection}>
        <LCDDisplay />
        <VUMeter barCount={12} height={35} />
      </View>

      {/* Cassette animation */}
      <Animated.View style={[cassetteAnim]}>
        <Cassette color={song.color} album={song.album} />
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.buttonRow}>
          <Button label="⏪" onPress={() => {}} />
          <Button
            label={isPlaying ? "⏸" : "▶️"}
            onPress={() => (isPlaying ? pause() : play())}
          />
          <Button label="⏩" onPress={() => {}} />
        </View>
      </View>
    </View>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View style={styles.btnOuter}>
      <View style={styles.btnInner}>
        <View>
          <View onTouchEnd={onPress}>
            <Animated.Text style={styles.btnLabel}>{label}</Animated.Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "space-around" },
  displaySection: { alignItems: "center", marginTop: 40 },
  controls: { marginBottom: 40 },
  buttonRow: { flexDirection: "row", gap: 25 },
  btnOuter: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: "#666",
  },
  btnInner: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 10,
  },
  btnLabel: { fontSize: 20, color: "#FFDD57" },
});
