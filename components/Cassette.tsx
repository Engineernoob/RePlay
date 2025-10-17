import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

interface CassetteProps {
  color: string;
  album: any;
}

export default function Cassette({ color, album }: CassetteProps) {
  // reel spin animation
  const rotation = withTiming("360deg", { duration: 3000 });

  const reelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: rotation }],
  }));

  return (
    <View style={[styles.container]}>
      {/* Cassette base */}
      <Image
        source={require("@/assets/images/cassette-base.png")}
        style={[styles.cassetteImage, { tintColor: color }]}
      />

      {/* Album cover on label */}
      <Image source={album} style={styles.albumCover} />

      {/* Optional spinning reels */}
      <Animated.View style={[styles.reel, reelStyle]} />
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
    left: 50,
    top: 65,
  },
});

