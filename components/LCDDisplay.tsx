import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import type { WalkmanThemeType } from "@/constants/walkman-theme";
import { usePlayerStore } from "@/src/store/playerStore";

export default function LCDDisplay() {
  const theme = useTheme() as WalkmanThemeType;
  const { isPlaying, currentTime, duration } = usePlayerStore();

  // format timer like 01:23
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // simulate subtle LCD flicker
  const flicker = useSharedValue(1);
  useEffect(() => {
    flicker.value = withRepeat(withTiming(0.9, { duration: 800 }), -1, true);
  }, [flicker]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: flicker.value,
  }));

  const displayText = isPlaying
    ? `▶ PLAY   ${formatTime(currentTime)} / ${formatTime(duration)}`
    : `⏸ PAUSE  ${formatTime(currentTime)} / ${formatTime(duration)}`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: "#042A2E",
          borderColor: theme.colors.primary,
          shadowColor: theme.colors.lcdCyan,
        },
      ]}
    >
      <Animated.Text
        style={[
          styles.text,
          animatedStyle,
          {
            color: theme.colors.lcdCyan,
            fontFamily: theme.fonts.display.fontFamily,
            textShadowColor: theme.colors.lcdCyan,
          },
        ]}
      >
        {displayText}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 60,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  text: {
    fontSize: 20,
    letterSpacing: 1,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
