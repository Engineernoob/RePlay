import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface CassetteProps {
  color: string;
  album: any;
}

export default function Cassette({ color, album }: CassetteProps) {
  // Shared value for reel rotation
  const rotation = useSharedValue(0);

  // Start continuous rotation
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000 }), // spin full circle in 3s
      -1, // infinite loop
      false // no reverse
    );
  }, [rotation]);

  // Animated style for spinning reels
  const reelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }], // ✅ must be a string
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
