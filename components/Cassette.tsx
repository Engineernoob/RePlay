import React, { useEffect } from "react";
import { View, Image, StyleSheet, Text, Platform, TouchableWithoutFeedback } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { usePlayerStore } from "@/src/store/playerStore";

interface CassetteProps {
  color: string;
  album: any;
  title?: string;
  artist?: string;
  sharedTransitionTag?: string;
}

export default function Cassette({ color, album, title, artist, sharedTransitionTag }: CassetteProps) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const rotation = useSharedValue(0);
  const flip = useSharedValue(0);
  const spinSpeed = 3000;

  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(360, { duration: spinSpeed, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
      const normalized = rotation.value % 360;
      rotation.value = withTiming(normalized, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [isPlaying, rotation]);

  const reelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Flip style
  const flipStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 600 },
        { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
      ],
    };
  });

  const isDark = getLuminance(color) < 0.5;
  const textColor = isDark ? "#FFF" : "#000";

  const handleFlip = () => {
    flip.value = flip.value === 0
      ? withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      : withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) });
  };

  return (
    <TouchableWithoutFeedback onLongPress={handleFlip}>
      <Animated.View
        style={[styles.shell, { backgroundColor: color }, flipStyle]}
      >
        {/* FRONT SIDE */}
        <View style={[StyleSheet.absoluteFill, styles.front]}>
          <View style={styles.gloss} />
          <View style={[styles.label, { backgroundColor: isDark ? "#111" : "#EEE" }]}>
            <Image source={album} style={styles.albumArt} />
            <View style={styles.textArea}>
              <Text style={[styles.songTitle, { color: textColor }]} numberOfLines={1}>
                {title}
              </Text>
              <Text style={[styles.songArtist, { color: textColor }]} numberOfLines={1}>
                {artist}
              </Text>
              <Text style={[styles.side, { color: textColor }]}>Side A</Text>
            </View>
          </View>
          <View style={styles.window}>
            <Animated.View style={[styles.reel, reelStyle, { left: 55 }]} />
            <Animated.View style={[styles.reel, reelStyle, { right: 55 }]} />
            <View style={styles.tape} />
          </View>
        </View>

        {/* BACK SIDE */}
        <View style={[StyleSheet.absoluteFill, styles.back]}>
          <Text style={styles.backTitle}>Side B</Text>
          <Text style={styles.tracklist}>1. Instrumental\n2. Remix\n3. Message</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// Utility: brightness detection
function getLuminance(hex: string): number {
  const rgb = hex.replace("#", "").match(/.{1,2}/g)?.map((c) => parseInt(c, 16) / 255) || [0, 0, 0];
  const [r, g, b] = rgb.map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const styles = StyleSheet.create({
  shell: {
    width: 280,
    height: 160,
    borderRadius: 8,
    padding: 10,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === "ios" ? 0.3 : 0.8,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#222",
    position: "relative",
    overflow: "hidden",
    backfaceVisibility: "hidden",
  },
  front: { backfaceVisibility: "hidden" },
  back: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    backfaceVisibility: "hidden",
    transform: [{ rotateY: "180deg" }],
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  albumArt: {
    width: 55,
    height: 55,
    borderRadius: 3,
    marginRight: 8,
  },
  textArea: { flex: 1, justifyContent: "center" },
  songTitle: { fontSize: 14, fontWeight: "700", letterSpacing: 0.5 },
  songArtist: { fontSize: 12, opacity: 0.8 },
  side: { fontSize: 10, fontStyle: "italic", opacity: 0.7, marginTop: 4 },
  window: {
    height: 55,
    backgroundColor: "#111",
    borderRadius: 4,
    marginHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#444",
  },
  reel: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#666",
    backgroundColor: "#222",
  },
  tape: {
    width: 120,
    height: 2,
    backgroundColor: "#444",
    position: "absolute",
  },
  backTitle: {
    fontSize: 22,
    color: "#EEE",
    fontWeight: "700",
    marginBottom: 10,
  },
  tracklist: {
    color: "#AAA",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});

