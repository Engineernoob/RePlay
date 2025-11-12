import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
  Easing,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
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
    volume,
    setVolume,
    repeatMode,
    setRepeatMode,
  } = usePlayerStore();

  // Initialize audio player
  usePlayerController(currentTrack);

  const progress = useProgress();
  const { formattedTime } = useFormattedTime();
  const { title, artist, hasTrack } = useTrackMetadata();
  const { isLoading } = usePlayerStore();

  // Cassette insertion/ejection animations
  const cassetteSlideY = useSharedValue(0);
  const cassetteScale = useSharedValue(1);
  const cassetteOpacity = useSharedValue(0);
  const [isCassetteInserting, setIsCassetteInserting] = useState(false);

  // Reel rotation animations
  const leftReelRotation = useSharedValue(0);
  const rightReelRotation = useSharedValue(0);
  
  // Tape loading animation
  const tapeLoadingProgress = useSharedValue(0);
  const tapeLoadingOpacity = useSharedValue(0);

  // Heart animation
  const heartScale = useSharedValue(1);

  // Cassette insertion animation
  useEffect(() => {
    if (hasTrack && !isCassetteInserting) {
      setIsCassetteInserting(true);
      usePlayerStore.getState().playSfx("insert");
      
      cassetteSlideY.value = withSpring(0, {
        damping: 15,
        stiffness: 200,
      });
      cassetteScale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      cassetteOpacity.value = withTiming(1, { duration: 300 });
      
      tapeLoadingOpacity.value = withTiming(1, { duration: 200 });
      tapeLoadingProgress.value = withTiming(1, { 
        duration: 1500,
        easing: Easing.inOut(Easing.ease)
      });
      
      setTimeout(() => {
        tapeLoadingOpacity.value = withTiming(0, { duration: 300 });
        setIsCassetteInserting(false);
      }, 1500);
    } else if (!hasTrack) {
      usePlayerStore.getState().playSfx("eject");
      cassetteSlideY.value = withTiming(200, { duration: 400 });
      cassetteScale.value = withTiming(0.8, { duration: 400 });
      cassetteOpacity.value = withTiming(0, { duration: 400 });
      tapeLoadingOpacity.value = 0;
      tapeLoadingProgress.value = 0;
    }
  }, [hasTrack]);

  // Reel rotation logic
  useEffect(() => {
    if (isPlaying && powerOn && hasTrack) {
      const baseSpeed = 2000;
      const speedVariation = 200;
      const spinDuration = baseSpeed + (Math.random() * speedVariation - speedVariation / 2);
      
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

  // Heart animation on play
  useEffect(() => {
    if (isPlaying) {
      heartScale.value = withRepeat(
        withSpring(1.2, { damping: 5 }),
        -1,
        true
      );
    } else {
      heartScale.value = withTiming(1, { duration: 300 });
    }
  }, [isPlaying]);

  const leftReelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leftReelRotation.value}deg` }],
  }));

  const rightReelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rightReelRotation.value}deg` }],
  }));

  const cassetteSlideStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: cassetteSlideY.value },
      { scale: cassetteScale.value },
    ],
    opacity: cassetteOpacity.value,
  }));

  const tapeLoadingStyle = useAnimatedStyle(() => ({
    opacity: tapeLoadingOpacity.value,
  }));
  
  const tapeLoadingBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: tapeLoadingProgress.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const currentTrackIndex = playlist.findIndex(t => t.id === currentTrack?.id) + 1;
  const totalTracks = playlist.length || 1;

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

  const handleVolumeUp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVolume(Math.min(1.0, volume + 0.1));
  };

  const handleVolumeDown = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVolume(Math.max(0, volume - 0.1));
  };

  return (
    <View style={styles.container}>
      {/* Top Screen Section */}
      <View style={styles.topScreen}>
        <View style={styles.screenContent}>
          <Text style={styles.screenText}>SONY PLAYER</Text>
          <View style={styles.screenIcons}>
            <Animated.View style={heartStyle}>
              <Text style={styles.heartIcon}>♥</Text>
            </Animated.View>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleShuffle();
              }}
            >
              <Text style={[styles.shuffleIcon, isShuffle && styles.shuffleActive]}>
                ⇄
              </Text>
            </TouchableOpacity>
          </View>
              </View>
            </View>

      {/* Middle Control Panel */}
      <View style={styles.controlPanel}>
        {/* Speaker Grille */}
        <View style={styles.speakerGrille}>
          <View style={styles.grilleHoles}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={styles.grilleHole} />
            ))}
          </View>
          <View style={[styles.indicatorLight, { opacity: powerOn ? 1 : 0.3 }]} />
        </View>

        {/* Volume Controls */}
        <View style={styles.volumeControls}>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={handleVolumeDown}
            disabled={!powerOn}
          >
            <Text style={styles.volumeButtonText}>VOL -</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={handleVolumeUp}
            disabled={!powerOn}
          >
            <Text style={styles.volumeButtonText}>VOL +</Text>
          </TouchableOpacity>
                  </View>
                  
        {/* Display Text */}
        <View style={styles.displayTextContainer}>
          <Text style={styles.displayText}>♥</Text>
          <Text style={styles.displayTextMain} numberOfLines={1}>
            {title || "MY LIFE IS GETTING BETTER"}
          </Text>
          <Text style={styles.displayText}>♥</Text>
        </View>

        {/* PLATEK Branding */}
        <Text style={styles.platekText}>PLATEK</Text>

        {/* Playback Controls */}
        <View style={styles.playbackControls}>
              <TouchableOpacity
            style={[styles.playButton, !powerOn && styles.buttonDisabled]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              usePlayerStore.getState().playSfx("click");
              if (isPlaying) pause();
              else play();
            }}
                disabled={!powerOn || !hasTrack}
              >
            {isPlaying ? (
              <PauseIcon size={32} color={!powerOn || !hasTrack ? "#666" : "#FFF"} />
            ) : (
              <PlayIcon size={32} color={!powerOn || !hasTrack ? "#666" : "#FFF"} />
            )}
              </TouchableOpacity>

          <View style={styles.secondaryControls}>
              <TouchableOpacity
              style={[styles.secondaryButton, !powerOn && styles.buttonDisabled]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                usePlayerStore.getState().playSfx("fastforward");
                fastForward(5);
              }}
                disabled={!powerOn || !hasTrack}
              >
              <SkipForwardIcon size={20} color={!powerOn || !hasTrack ? "#666" : "#FFF"} />
              </TouchableOpacity>
              <TouchableOpacity
              style={[styles.secondaryButton, !powerOn && styles.buttonDisabled]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                usePlayerStore.getState().playSfx("rewind");
                rewind(5);
              }}
                disabled={!powerOn || !hasTrack}
              >
              <SkipBackwardIcon size={20} color={!powerOn || !hasTrack ? "#666" : "#FFF"} />
              </TouchableOpacity>
          </View>

              <TouchableOpacity
            style={[styles.stopButton, !powerOn && styles.buttonDisabled]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              usePlayerStore.getState().playSfx("click");
              pause();
              restartTrack();
            }}
                disabled={!powerOn || !hasTrack}
              >
            <StopIcon size={24} color={!powerOn || !hasTrack ? "#666" : "#FFF"} />
              </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Cassette Compartment */}
      <View style={styles.cassetteCompartment}>
        {hasTrack ? (
          <Animated.View style={[styles.cassetteWindow, cassetteSlideStyle]}>
            <View style={styles.cassette}>
              {/* Maxell Branding */}
              <View style={styles.cassetteBrand}>
                <Text style={styles.maxellText}>maxell</Text>
                <View style={styles.bLogo}>
                  <Text style={styles.bLogoText}>B</Text>
                </View>
              </View>

              {/* Cassette Label */}
              <View style={styles.cassetteLabel}>
                <Text style={styles.labelText}>GREAT FOR EVERYDAY RECORDING</Text>
                <View style={styles.redLabel}>
                  <Text style={styles.redLabelText}>
                    {title?.substring(0, 2).toUpperCase() || "UR"}
                  </Text>
                </View>
              </View>

              {/* Reels */}
              <View style={styles.cassetteReels}>
                <Animated.View style={[styles.reel, styles.reelLeft, leftReelStyle]}>
                  <View style={styles.reelHub} />
                  <View style={[styles.reelTape, { width: 50, height: 50 }]} />
                  <View style={[styles.reelTape, { width: 45, height: 45, opacity: 0.8 }]} />
                  <View style={[styles.reelTape, { width: 40, height: 40, opacity: 0.6 }]} />
            </Animated.View>

                <Animated.View style={[styles.reel, styles.reelRight, rightReelStyle]}>
                  <View style={styles.reelHub} />
                  <View style={[styles.reelTape, rightReelTape1]} />
                  <View style={[styles.reelTape, rightReelTape2]} />
            </Animated.View>
              </View>

              {/* Loading Indicator */}
              <Animated.View style={[styles.tapeLoadingIndicator, tapeLoadingStyle]}>
                <View style={styles.tapeLoadingBarContainer}>
                  <Animated.View style={[styles.tapeLoadingBar, tapeLoadingBarStyle]} />
                </View>
              </Animated.View>
            </View>
            </Animated.View>
        ) : (
          <View style={styles.noCassette}>
            <Text style={styles.noCassetteText}>NO CASSETTE</Text>
          </View>
        )}

        {/* Music Panel */}
        <View style={styles.musicPanel}>
          <Text style={styles.musicText}>MUSIC</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  // Top Screen
  topScreen: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#333",
    padding: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  screenContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  screenIcons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  heartIcon: {
    color: "#D62D2D",
    fontSize: 16,
    fontWeight: "bold",
  },
  shuffleIcon: {
    color: "#FFF",
    fontSize: 16,
    opacity: 0.6,
  },
  shuffleActive: {
    opacity: 1,
    fontWeight: "bold",
  },
  // Control Panel
  controlPanel: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#333",
  },
  speakerGrille: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 4,
  },
  grilleHoles: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
    flex: 1,
  },
  grilleHole: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#333",
  },
  indicatorLight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D62D2D",
    shadowColor: "#D62D2D",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  volumeControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  volumeButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#333",
  },
  volumeButtonText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  displayTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: "#1A1A1A",
    borderRadius: 4,
  },
  displayText: {
    color: "#FFF",
    fontSize: 12,
    marginHorizontal: 4,
  },
  displayTextMain: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "monospace",
    flex: 1,
    textAlign: "center",
  },
  platekText: {
    color: "#666",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  playbackControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  secondaryControls: {
    flexDirection: "column",
    gap: 8,
  },
  secondaryButton: {
    width: 50,
    height: 30,
    backgroundColor: "#1A1A1A",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  stopButton: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  // Cassette Compartment
  cassetteCompartment: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#333",
    padding: 16,
    overflow: "hidden",
  },
  cassetteWindow: {
    width: "100%",
    height: 140,
    backgroundColor: "rgba(220, 220, 220, 0.3)",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#555",
    padding: 14,
    marginBottom: 12,
    position: "relative",
    // Glass effect
    borderTopColor: "#777",
    borderLeftColor: "#777",
    borderRightColor: "#444",
    borderBottomColor: "#444",
  },
  cassette: {
    flex: 1,
    position: "relative",
    backgroundColor: "rgba(200, 200, 200, 0.4)",
    borderRadius: 4,
    padding: 8,
  },
  cassetteBrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  maxellText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bLogo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  bLogoText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "900",
  },
  cassetteLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  labelText: {
    color: "#DDD",
    fontSize: 7,
    flex: 1,
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  redLabel: {
    backgroundColor: "#D62D2D",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#A00",
    shadowColor: "#D62D2D",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  redLabelText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  cassetteReels: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 8,
  },
  reel: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  reelLeft: {},
  reelRight: {},
  reelHub: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#555",
    zIndex: 2,
  },
  reelTape: {
    position: "absolute",
    borderRadius: 25,
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#333",
  },
  tapeLoadingIndicator: {
    position: "absolute",
    bottom: 4,
    left: 12,
    right: 12,
    height: 2,
  },
  tapeLoadingBarContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 1,
    overflow: "hidden",
  },
  tapeLoadingBar: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFDD57",
    borderRadius: 1,
  },
  noCassette: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  noCassetteText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  musicPanel: {
    backgroundColor: "#8B4513",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A0522D",
  },
  musicText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
