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

interface LCDDisplayProps {
  title?: string;
  artist?: string;
}

export default function LCDDisplay({ title, artist }: LCDDisplayProps) {
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

  const statusText = isPlaying ? "▶ PLAY" : "⏸ PAUSE";
  const timeText = `${formatTime(currentTime)} / ${formatTime(duration)}`;

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
      {/* Track and Artist Info */}
      {(title || artist) && (
        <Animated.Text
          style={[
            styles.trackText,
            animatedStyle,
            {
              color: theme.colors.lcdCyan,
              fontFamily: theme.fonts.display.fontFamily,
              textShadowColor: theme.colors.lcdCyan,
            },
          ]}
          numberOfLines={1}
        >
          {title && title.toUpperCase()}
          {title && artist && " • "}
          {artist && artist.toUpperCase()}
        </Animated.Text>
      )}
      
      {/* Status and Time */}
      <View style={styles.statusRow}>
        <Animated.Text
          style={[
            styles.statusText,
            animatedStyle,
            {
              color: theme.colors.lcdCyan,
              fontFamily: theme.fonts.display.fontFamily,
              textShadowColor: theme.colors.lcdCyan,
            },
          ]}
        >
          {statusText}
        </Animated.Text>
        
        <Animated.Text
          style={[
            styles.timeText,
            animatedStyle,
            {
              color: theme.colors.lcdCyan,
              fontFamily: theme.fonts.display.fontFamily,
              textShadowColor: theme.colors.lcdCyan,
            },
          ]}
        >
          {timeText}
        </Animated.Text>
      </View>
      
      {/* Mini VU-style level bars */}
      <View style={styles.miniVUMeter}>
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.miniBar,
              {
                opacity: isPlaying && Math.random() > 0.3 ? 0.8 + Math.random() * 0.2 : 0.3,
                backgroundColor: theme.colors.lcdCyan,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 80,
    borderWidth: 2,
    borderRadius: 4,
    padding: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  trackText: {
    fontSize: 12,
    letterSpacing: 0.5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    letterSpacing: 0.5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  timeText: {
    fontSize: 14,
    letterSpacing: 0.5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  miniVUMeter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 8,
    gap: 2,
  },
  miniBar: {
    width: 3,
    height: "100%",
    borderRadius: 1,
  },
});
