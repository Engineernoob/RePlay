import React from "react";
import LottieView from "lottie-react-native";
import { View, StyleSheet } from "react-native";
import { usePlayerStore } from "@/src/store/playerStore";

export default function Cassette() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/cassette.json")}
        autoPlay={isPlaying}
        loop={isPlaying}
        style={{ width: 280, height: 160 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
