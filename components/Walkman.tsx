import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { 
  usePlayerStore,
  usePlayerController
} from "@/src/store/playerStore";
import { 
  useProgress, 
  useFormattedTime, 
  useTrackMetadata,
} from "@/src/hooks/playerHooks";
import {
  SkipBackwardIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
} from "@/components/PlayerIcons";

export default function Walkman() {
  const {
    isPlaying,
    currentTime,
    duration,
    powerOn,
    play,
    pause,
    rewind,
    fastForward,
    restartTrack,
    currentTrack,
    playlist,
    isShuffle,
    toggleShuffle,
    repeatMode,
    setRepeatMode,
  } = usePlayerStore();

  // Initialize audio player
  usePlayerController(currentTrack);

  const progress = useProgress();
  const { formattedTime } = useFormattedTime();
  const { title, artist, hasTrack } = useTrackMetadata();

  // Reel rotation animations
  const leftReelRotation = useSharedValue(0);
  const rightReelRotation = useSharedValue(0);

  // Calculate remaining time
  const remainingTime = duration > 0 ? duration - currentTime : 0;
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);
  const remainingTimeStr = `-${remainingMinutes}:${remainingSeconds.toString().padStart(2, "0")}`;

  // Reel rotation logic
  useEffect(() => {
    if (isPlaying && powerOn && hasTrack) {
      const spinDuration = 2000;
      leftReelRotation.value = withRepeat(
        withTiming(360, { duration: spinDuration, easing: Easing.linear }),
        -1,
        false
      );
      rightReelRotation.value = withRepeat(
        withTiming(-360, { duration: spinDuration, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      leftReelRotation.value = withTiming(leftReelRotation.value % 360, { 
        duration: 800, 
        easing: Easing.out(Easing.quad) 
      });
      rightReelRotation.value = withTiming(rightReelRotation.value % 360, { 
        duration: 800, 
        easing: Easing.out(Easing.quad) 
      });
    }
  }, [isPlaying, powerOn, hasTrack]);

  const leftReelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leftReelRotation.value}deg` }],
  }));

  const rightReelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rightReelRotation.value}deg` }],
  }));

  const currentTrackIndex = playlist.findIndex(t => t.id === currentTrack?.id) + 1;
  const totalTracks = playlist.length || 1;

  // Calculate right reel tape size based on progress
  const rightReelTape1 = useMemo(() => ({
    width: Math.max(15, 50 * (1 - progress * 0.7)),
    height: Math.max(15, 50 * (1 - progress * 0.7)),
    opacity: Math.max(0.3, 1 - progress * 0.5),
  }), [progress]);

  const rightReelTape2 = useMemo(() => ({
    width: Math.max(12, 45 * (1 - progress * 0.7)),
    height: Math.max(12, 45 * (1 - progress * 0.7)),
    opacity: Math.max(0.2, (1 - progress * 0.5) * 0.8),
  }), [progress]);

  return (
    <View style={styles.container}>
      {/* Large Cassette Tape - Upper Half */}
      <View style={styles.cassetteContainer}>
        {hasTrack ? (
          <View style={styles.cassetteShell}>
            {/* Transparent cassette casing */}
            <View style={styles.cassetteFrame}>
              {/* Brand name vertically on left */}
              <View style={styles.brandVertical}>
                <Text style={styles.brandTextVertical}>CASSOFLOW</Text>
              </View>

              {/* Cassette Label - Orange and White */}
              <View style={styles.labelContainer}>
                {/* Orange section with CFT60 */}
                <View style={styles.labelOrange}>
                  <Text style={styles.cft60Text}>CFT60</Text>
                </View>
                
                {/* White section with track info */}
                <View style={styles.labelWhite}>
                  <Text style={styles.labelBrand}>CASSOFLOW</Text>
                  <Text style={styles.labelModel}>MODEL NO. CPM-001</Text>
                  <Text style={styles.labelType}>AUDIO CASSETTE PLAYER</Text>
                  <Text style={styles.labelBatt}>(BUILD-IN BATT)</Text>
                  <Text style={styles.labelStudio}>DESIGN STUDIO</Text>
                  
                  {/* Red dots pattern (level meter) */}
                  <View style={styles.levelMeter}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <View key={i} style={styles.levelColumn}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <View
                            key={j}
                            style={[
                              styles.levelDot,
                              {
                                opacity: isPlaying && j < 6 ? 1 : 0.3,
                              },
                            ]}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                  
                  {/* SIDE A triangle */}
                  <View style={styles.sideIndicator}>
                    <View style={styles.sideTriangle} />
                    <Text style={styles.sideText}>SIDE A</Text>
                  </View>
                </View>
              </View>

              {/* Reels */}
              <View style={styles.reelsContainer}>
                {/* Left Reel - Full (tape wound) */}
                <Animated.View style={[styles.reel, styles.reelLeft, leftReelStyle]}>
                  <View style={styles.reelHub} />
                  {/* Multiple tape layers to show fullness */}
                  <View style={[styles.reelTape, { width: 50, height: 50 }]} />
                  <View style={[styles.reelTape, { width: 45, height: 45, opacity: 0.8 }]} />
                  <View style={[styles.reelTape, { width: 40, height: 40, opacity: 0.6 }]} />
                </Animated.View>

                {/* Right Reel - Less full (shows progress) */}
                <Animated.View style={[styles.reel, styles.reelRight, rightReelStyle]}>
                  <View style={styles.reelHub} />
                  {/* Tape amount decreases as progress increases */}
                  <View style={[styles.reelTape, rightReelTape1]} />
                  <View style={[styles.reelTape, rightReelTape2]} />
                </Animated.View>
              </View>

              {/* Screws */}
              <View style={styles.screwTopLeft} />
              <View style={styles.screwTopRight} />
              <View style={styles.screwBottomLeft} />
              <View style={styles.screwBottomRight} />
              
              {/* DO NOT INSERT warning */}
              <Text style={styles.warningText}>DO NOT INSERT</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noCassette}>
            <Text style={styles.noCassetteText}>NO CASSETTE</Text>
          </View>
        )}

        {/* Yellow tape head line */}
        {hasTrack && <View style={styles.tapeHeadLine} />}
      </View>

      {/* Controls and Display - Lower Half */}
      <View style={styles.bottomSection}>
        {/* Control Buttons Row */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, !powerOn && styles.buttonDisabled]}
            onPress={() => rewind(5)}
            disabled={!powerOn || !hasTrack}
          >
            <SkipBackwardIcon size={28} color={!powerOn || !hasTrack ? "#666" : "#FFF"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !powerOn && styles.buttonDisabled]}
            onPress={() => {
              if (isPlaying) pause();
              else play();
            }}
            disabled={!powerOn || !hasTrack}
          >
            {isPlaying ? (
              <PauseIcon size={28} color={!powerOn || !hasTrack ? "#666" : "#FFF"} />
            ) : (
              <PlayIcon size={28} color={!powerOn || !hasTrack ? "#666" : "#FFF"} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !powerOn && styles.buttonDisabled]}
            onPress={() => {
              pause();
              restartTrack();
            }}
            disabled={!powerOn || !hasTrack}
          >
            <StopIcon size={28} color={!powerOn || !hasTrack ? "#666" : "#FFF"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !powerOn && styles.buttonDisabled]}
            onPress={() => fastForward(5)}
            disabled={!powerOn || !hasTrack}
          >
            <SkipForwardIcon size={28} color={!powerOn || !hasTrack ? "#666" : "#FFF"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.settingsButton]}
            onPress={() => {
              const nextMode = repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none";
              setRepeatMode(nextMode);
            }}
            disabled={!powerOn}
          >
            <Text style={[styles.controlIcon, { color: !powerOn ? "#666" : "#FFF" }]}>
              {repeatMode === "all" ? "🔁" : repeatMode === "one" ? "🔂" : "↻"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Blue Display Panel */}
        <View style={styles.displayPanel}>
          <View style={styles.displayHeader}>
            <Text style={styles.programNumber}>
              PGM NO. {currentTrackIndex}/{totalTracks}
            </Text>
          </View>

          <View style={styles.displayContent}>
            <Text style={styles.songTitle}>{title || "NO TRACK"}</Text>
            <Text style={styles.artistName}>{artist || "---"}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.displayFooter}>
            <TouchableOpacity
              style={styles.shuffleButton}
              onPress={toggleShuffle}
              disabled={!powerOn}
            >
              <Text style={[styles.shuffleIcon, isShuffle && styles.shuffleActive]}>
                ⇄
              </Text>
            </TouchableOpacity>
            <Text style={styles.remainingTime}>{remainingTimeStr}</Text>
            <TouchableOpacity style={styles.soundEffectButton}>
              <Text style={styles.soundEffectText}>SOUND EFFECT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2A2A2A", // Dark grey textured background
    padding: 20,
  },
  cassetteContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  cassetteShell: {
    width: "90%",
    maxWidth: 400,
    aspectRatio: 1.6,
    position: "relative",
  },
  cassetteFrame: {
    flex: 1,
    backgroundColor: "rgba(220, 220, 220, 0.4)", // Transparent plastic casing
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#999",
    padding: 16,
    position: "relative",
    overflow: "hidden",
    // Glass effect
    borderTopColor: "#CCC",
    borderLeftColor: "#CCC",
    borderRightColor: "#888",
    borderBottomColor: "#888",
  },
  brandVertical: {
    position: "absolute",
    left: 8,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    width: 30,
  },
  brandTextVertical: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
    transform: [{ rotate: "-90deg" }],
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  labelContainer: {
    flexDirection: "row",
    height: "50%",
    marginLeft: 40,
    marginRight: 20,
    borderRadius: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  labelOrange: {
    width: "30%",
    backgroundColor: "#FF7E57",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  cft60Text: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
  labelWhite: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 8,
    position: "relative",
  },
  labelBrand: {
    fontSize: 8,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  labelModel: {
    fontSize: 7,
    color: "#333",
    marginBottom: 1,
  },
  labelType: {
    fontSize: 7,
    color: "#333",
    marginBottom: 1,
  },
  labelBatt: {
    fontSize: 7,
    color: "#666",
    marginBottom: 1,
  },
  labelStudio: {
    fontSize: 7,
    color: "#666",
    marginBottom: 4,
  },
  levelMeter: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  levelColumn: {
    flexDirection: "column",
    gap: 1,
  },
  levelDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#D62D2D",
  },
  sideIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  sideTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#D62D2D",
    marginRight: 2,
  },
  sideText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#D62D2D",
  },
  reelsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  reel: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1A1A1A",
    borderWidth: 3,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  reelLeft: {
    // Left reel appears full
  },
  reelRight: {
    // Right reel shows less tape as progress increases
  },
  reelHub: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: "#333",
    borderWidth: 2,
    borderColor: "#555",
  },
  reelTape: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1A1A1A",
    borderWidth: 3,
    borderColor: "#333",
    // Tape layers effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  screwTopLeft: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
    borderWidth: 1,
    borderColor: "#888",
  },
  screwTopRight: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
    borderWidth: 1,
    borderColor: "#888",
  },
  screwBottomLeft: {
    position: "absolute",
    bottom: 4,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
    borderWidth: 1,
    borderColor: "#888",
  },
  screwBottomRight: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
    borderWidth: 1,
    borderColor: "#888",
  },
  warningText: {
    position: "absolute",
    bottom: 8,
    left: "50%",
    transform: [{ translateX: -40 }],
    fontSize: 6,
    color: "#666",
    fontFamily: "monospace",
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  tapeHeadLine: {
    width: "90%",
    maxWidth: 400,
    height: 3,
    backgroundColor: "#FFDD57",
    marginTop: 8,
    borderRadius: 2,
  },
  noCassette: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noCassetteText: {
    color: "#666",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 2,
  },
  bottomSection: {
    paddingTop: 20,
    backgroundColor: "#2A2A2A", // Dark grey textured surface
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  controlIcon: {
    fontSize: 24,
    color: "#FFF",
  },
  settingsButton: {
    width: 50,
    height: 50,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
    marginLeft: "auto",
  },
  displayPanel: {
    backgroundColor: "#00BFFF", // Bright cyan-blue like in image
    borderRadius: 12,
    padding: 16,
    borderWidth: 3,
    borderColor: "#0099CC",
    shadowColor: "#00BFFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    // Inner glow
    borderTopColor: "#33CCFF",
    borderLeftColor: "#33CCFF",
    borderRightColor: "#0088BB",
    borderBottomColor: "#0088BB",
  },
  displayHeader: {
    marginBottom: 8,
  },
  programNumber: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
    fontFamily: "monospace",
  },
  displayContent: {
    marginBottom: 12,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: "#000",
    opacity: 0.8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 2,
  },
  displayFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shuffleButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  shuffleIcon: {
    fontSize: 20,
    color: "#000",
    opacity: 0.6,
  },
  shuffleActive: {
    opacity: 1,
    fontWeight: "bold",
  },
  remainingTime: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    fontFamily: "monospace",
  },
  soundEffectButton: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.3)",
  },
  soundEffectText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.5,
  },
});
