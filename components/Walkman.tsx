import React, { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import Cassette from "./Cassette";
import { usePlayerStore, playSfx } from "@/src/store/playerStore";

export default function Walkman({ song }: any) {
  const { isPlaying, play, pause } = usePlayerStore();
  const pressY = useSharedValue(0);
  const cassetteX = useSharedValue(-500);
  const cassetteOpacity = useSharedValue(0);
  const currentSong = useRef(song.title);

  // button bounce
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressY.value }],
  }));

  // cassette movement
  const cassetteStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cassetteX.value }],
    opacity: cassetteOpacity.value,
  }));

  const slideInCassette = useCallback(async () => {
    cassetteX.value = -500;
    cassetteOpacity.value = 0;

    cassetteOpacity.value = withTiming(1, { duration: 400 });
    cassetteX.value = withTiming(0, {
      duration: 900,
      easing: Easing.out(Easing.exp),
    });

    setTimeout(
      () => playSfx(require("@/assets/sfx/tape-cassette-insert.mp3")),
      250
    );
    setTimeout(() => play(), 1000);
  }, [cassetteOpacity, cassetteX, play]);

  const ejectCassette = useCallback(
    async (callback?: () => void) => {
      cassetteX.value = withTiming(500, {
        duration: 700,
        easing: Easing.in(Easing.exp),
      });
      setTimeout(
        () => playSfx(require("@/assets/sfx/cassette-eject.mp3")),
        200
      );
      setTimeout(() => {
        if (callback) runOnJS(callback)();
      }, 700);
    },
    [cassetteX]
  );

  // initial mount
  useEffect(() => {
    slideInCassette();
  }, [slideInCassette]);

  // detect song change
  useEffect(() => {
    if (song.title !== currentSong.current) {
      currentSong.current = song.title;
      ejectCassette(slideInCassette);
    }
  }, [ejectCassette, slideInCassette, song.title]);

  const handlePress = (action: "play" | "pause" | "stop") => {
    pressY.value = withSpring(3, {}, () => (pressY.value = withSpring(0)));
    if (action === "play") play();
    if (action === "pause" || action === "stop") pause();
  };

  return (
    <View style={styles.container}>
      {/* LED Indicator */}
      <View
        style={[
          styles.led,
          { backgroundColor: isPlaying ? "#FF3B30" : "#222" },
        ]}
      />

      <View style={styles.deck}>
        <Animated.View style={[cassetteStyle]}>
          <Cassette
            color={song.color}
            album={song.album}
            title={song.title}
            artist={song.artist}
          />
        </Animated.View>
      </View>

      <View style={styles.controls}>
        <Animated.View style={pressStyle}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isPlaying ? "#4CAF50" : "#444" },
            ]}
            onPress={() => handlePress("play")}
          >
            <Text style={styles.btnText}>▶</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={pressStyle}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#555" }]}
            onPress={() => handlePress("pause")}
          >
            <Text style={styles.btnText}>⏸</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={pressStyle}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#555" }]}
            onPress={() => handlePress("stop")}
          >
            <Text style={styles.btnText}>⏹</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  led: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 10,
    shadowColor: "#FF3B30",
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  deck: {
    backgroundColor: "#222",
    borderRadius: 20,
    padding: 20,
    width: 330,
    height: 260,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    overflow: "hidden",
  },
  controls: {
    flexDirection: "row",
    gap: 20,
    marginTop: 30,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#888",
  },
  btnText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
});
