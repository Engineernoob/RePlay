import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import type { Cassette } from "@/src/store/libraryStore";

interface CassetteCardProps {
  cassette: Cassette;
  onPress: () => void;
  onEdit?: () => void;
  isActive?: boolean;
  isLastPlayed?: boolean;
}

export default function CassetteCard({
  cassette,
  onPress,
  onEdit,
  isActive = false,
  isLastPlayed = false,
}: CassetteCardProps) {
  const rotation = useSharedValue(0);
  const elevation = useSharedValue(0);
  const glow = useSharedValue(isLastPlayed ? 1 : 0);

  // 3D tilt animation on press
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotation.value}deg` },
      { rotateX: `${interpolate(elevation.value, [0, 1], [0, -5])}deg` },
      { translateY: -elevation.value * 8 },
      { scale: 1 + elevation.value * 0.05 },
    ],
  }));

  // Glow effect for last played cassette
  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: cassette.color,
    shadowOpacity: glow.value * 0.6,
    shadowRadius: glow.value * 15,
    shadowOffset: { width: 0, height: 0 },
  }));

  const handlePressIn = () => {
    rotation.value = withSpring(-8, { damping: 10 });
    elevation.value = withSpring(1, { damping: 10 });
  };

  const handlePressOut = () => {
    rotation.value = withSpring(0, { damping: 10 });
    elevation.value = withSpring(0, { damping: 10 });
  };

  // Pulse glow for last played
  React.useEffect(() => {
    if (isLastPlayed) {
      glow.value = withTiming(1, { duration: 500 });
    } else {
      glow.value = withTiming(0, { duration: 300 });
    }
  }, [isLastPlayed, glow]);

  const trackCount = cassette.tracks.length;
  const firstTrack = cassette.tracks[0];

  return (
    <Animated.View style={[styles.container, animatedStyle, glowStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.card}
      >
        {/* Cassette Shell */}
        <View
          style={[
            styles.cassetteShell,
            { backgroundColor: cassette.color },
            isActive && styles.activeShell,
          ]}
        >
          {/* Glossy overlay */}
          <View style={styles.gloss} />

          {/* Label Area */}
          <View style={styles.labelArea}>
            {firstTrack?.album ? (
              <Image
                source={firstTrack.album}
                style={styles.albumArt}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.albumPlaceholder, { backgroundColor: cassette.color }]} />
            )}
            <View style={styles.labelTextArea}>
              <Text style={styles.cassetteName} numberOfLines={1}>
                {cassette.name.toUpperCase()}
              </Text>
              <Text style={styles.trackCount}>
                {trackCount} {trackCount === 1 ? "TRACK" : "TRACKS"}
              </Text>
            </View>
          </View>

          {/* Reel Window */}
          <View style={styles.reelWindow}>
            <View style={styles.reel} />
            <View style={styles.reel} />
            <View style={styles.tapePath} />
          </View>

          {/* Color Strip */}
          <View
            style={[styles.colorStrip, { backgroundColor: cassette.color }]}
          />

          {/* Last Played Indicator */}
          {isLastPlayed && (
            <View style={styles.memoryIndicator}>
              <Text style={styles.memoryText}>●</Text>
            </View>
          )}

          {/* Active Indicator */}
          {isActive && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeText}>▶</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={onPress}
          >
            <Text style={styles.actionButtonText}>▶</Text>
          </TouchableOpacity>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={onEdit}
            >
              <Text style={styles.actionButtonText}>✎</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginBottom: 20,
  },
  card: {
    alignItems: "center",
  },
  cassetteShell: {
    width: 160,
    height: 100,
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
    overflow: "hidden",
  },
  activeShell: {
    borderColor: "#00F5FF",
    borderWidth: 3,
    shadowColor: "#00F5FF",
    shadowOpacity: 0.5,
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
  },
  labelArea: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  albumPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 6,
    opacity: 0.5,
  },
  labelTextArea: {
    flex: 1,
  },
  cassetteName: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 2,
  },
  trackCount: {
    color: "#FFF",
    fontSize: 8,
    opacity: 0.8,
    fontFamily: "monospace",
  },
  reelWindow: {
    height: 30,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.5)",
  },
  reel: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#333",
    borderWidth: 2,
    borderColor: "#555",
  },
  tapePath: {
    position: "absolute",
    width: 60,
    height: 2,
    backgroundColor: "#666",
    top: "50%",
  },
  colorStrip: {
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  memoryIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 245, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00F5FF",
  },
  memoryText: {
    color: "#000",
    fontSize: 8,
    fontWeight: "bold",
  },
  activeIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 245, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00F5FF",
  },
  activeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  playButton: {
    backgroundColor: "#00F5FF",
    borderColor: "#00F5FF",
  },
  editButton: {
    backgroundColor: "#FFDD57",
    borderColor: "#FFDD57",
  },
  actionButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
});

