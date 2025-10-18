import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import type { WalkmanThemeType } from "@/constants/walkman-theme";
import { usePlayerStore } from "@/src/store/playerStore";

// ✅ Individual Bar Component (safe for Hooks)
function MeterBar({
  color,
  isPlaying,
  delay = 0,
}: {
  color: string;
  isPlaying: boolean;
  delay?: number;
}) {
  const level = useSharedValue(0.2);

  useEffect(() => {
    if (isPlaying) {
      // More realistic music-reactive animation
      level.value = withRepeat(
        withSequence(
          // Quick spike up
          withTiming(0.3 + Math.random() * 0.7, { duration: 100 + delay }),
          // Decay to medium level
          withTiming(0.2 + Math.random() * 0.3, { duration: 200 + delay }),
          // Small secondary spike
          withTiming(0.4 + Math.random() * 0.4, { duration: 150 + delay }),
          // Final decay
          withTiming(0.1 + Math.random() * 0.2, { duration: 250 + delay })
        ),
        -1,
        false // Don't reverse for more natural movement
      );
    } else {
      level.value = withTiming(0.05, { duration: 500 });
    }
  }, [delay, isPlaying, level]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: level.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        style,
        {
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
    />
  );
}

// ✅ Main Component
export default function VUMeter({ barCount = 12, height = 40 }) {
  const theme = useTheme() as WalkmanThemeType;
  const { isPlaying } = usePlayerStore();

  return (
    <View style={[styles.container, { height }]}>
      {Array.from({ length: barCount }).map((_, i) => (
        <MeterBar
          key={i}
          color={theme.colors.lcdCyan}
          isPlaying={isPlaying}
          delay={i * 30}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
  },
  bar: {
    width: 5,
    height: "100%",
    borderRadius: 2,
    shadowOpacity: 0.7,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
});
