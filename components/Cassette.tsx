import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { usePlayerStore } from "@/src/store/playerStore";

interface CassetteProps {
  color: string;
  album: any;
}

export default function Cassette({ color, album }: CassetteProps) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const rotation = useSharedValue(0);
  const spinSpeed = 3000; // full rotation every 3 seconds

  useEffect(() => {
    if (isPlaying) {
      // Start continuous rotation
      rotation.value = withRepeat(
        withTiming(360, {
          duration: spinSpeed,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      // Stop with smooth ease-out
      cancelAnimation(rotation);
      const normalized = rotation.value % 360; // keep current position
      rotation.value = withTiming(normalized, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [isPlaying, rotation]);

  // Animated rotation style
  const reelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      {/* Cassette base */}
      <Image
        source={require("@/assets/images/cassette-base-1.png")}
        style={[styles.cassetteImage, { tintColor: color }]}
      />

      {/* Album cover */}
      <Image source={album} style={styles.albumCover} />

      {/* Spinning reels */}
      <Animated.View style={[styles.reel, reelStyle, { left: 50 }]} />
      <Animated.View style={[styles.reel, reelStyle, { right: 50 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  cassetteImage: {
    width: 260,
    height: 150,
    resizeMode: "contain",
  },
  albumCover: {
    position: "absolute",
    top: 45,
    width: 110,
    height: 65,
    borderRadius: 4,
  },
  reel: {
    position: "absolute",
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: "#222",
    top: 65,
  },
});
