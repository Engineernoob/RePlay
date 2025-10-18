import React, { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ImageBackground } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
// import LinearGradient from "react-native-linear-gradient"; // Temporarily removed
import { 
  usePlayerStore
} from "@/src/store/playerStore";
import { 
  useProgress, 
  useFormattedTime, 
  useTrackMetadata,
  useLEDStatus,
  usePowerState 
} from "@/src/hooks/playerHooks";

/* ────────────────────────────────
   COMPONENT: Physical Walkman Interface
──────────────────────────────── */
export default function Walkman() {
  // Store state
  const {
    isPlaying,
    currentTime,
    duration,
    powerOn,
    play,
    pause,
    togglePlayPause,
    rewind,
    fastForward,
    restartTrack,
    setPowerState,
    playSfx,
    currentTrack,
  } = usePlayerStore();

  // Visual hooks
  const progress = useProgress();
  const { formattedTime } = useFormattedTime();
  const { title, artist, hasTrack, color: trackColor } = useTrackMetadata();
  const { brightness: ledBrightness, isAnimating: ledIsAnimating } = useLEDStatus();
  const { isOn: powerIsOn, indicatorColor: powerIndicatorColor } = usePowerState();

  // Animation values
  const leftReelRotation = useSharedValue(0);
  const rightReelRotation = useSharedValue(0);
  const cassetteY = useSharedValue(0);
  const ledOpacity = useSharedValue(0);
  const scanlineOffset = useSharedValue(0);
  const wobbleX = useSharedValue(0);
  const wobbleY = useSharedValue(0);

  // Button press animations
  const playButtonScale = useSharedValue(1);
  const pauseButtonScale = useSharedValue(1);
  const rewindButtonScale = useSharedValue(1);
  const fastForwardButtonScale = useSharedValue(1);
  const stopButtonScale = useSharedValue(1);
  const ejectButtonScale = useSharedValue(1);
  const powerSwitchX = useSharedValue(powerOn ? 20 : 0);

  // LED glow animation
  const ledAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(ledBrightness, { duration: 300 }),
    shadowColor: powerIndicatorColor,
    shadowOpacity: ledBrightness * 0.8,
    shadowRadius: ledBrightness * 15,
  }));

  // Reel rotation animations
  const leftReelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leftReelRotation.value}deg` }],
  }));

  const rightReelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rightReelRotation.value}deg` }],
  }));

  // Cassette wobble animation
  const cassetteStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: cassetteY.value },
      { translateX: wobbleX.value },
      { translateY: wobbleY.value },
    ],
  }));

  // Scanline animation
  const scanlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanlineOffset.value }],
  }));

  // Power switch animation
  const powerSwitchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: powerSwitchX.value }],
  }));

  // Button press helpers
  const createButtonPress = (scaleRef: Animated.SharedValue<number>, callback: () => void) => {
    return () => {
      scaleRef.value = withSpring(0.95, {}, () => {
        scaleRef.value = withSpring(1);
      });
      runOnJS(callback)();
      runOnJS(playSfx)("click");
    };
  };

  // Reel rotation logic
  useEffect(() => {
    if (isPlaying && powerOn && hasTrack) {
      const spinDuration = 2000; // 2 seconds per full rotation
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

      // Add subtle wobble
      wobbleX.value = withRepeat(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      wobbleY.value = withRepeat(
        withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      // Stop rotation smoothly
      leftReelRotation.value = withTiming(leftReelRotation.value % 360, { 
        duration: 600, 
        easing: Easing.out(Easing.ease) 
      });
      rightReelRotation.value = withTiming(rightReelRotation.value % 360, { 
        duration: 600, 
        easing: Easing.out(Easing.ease) 
      });
      
      // Stop wobble
      wobbleX.value = withTiming(0, { duration: 300 });
      wobbleY.value = withTiming(0, { duration: 300 });
    }
  }, [isPlaying, powerOn, hasTrack]);

  // Power state effects
  useEffect(() => {
    if (powerOn) {
      ledOpacity.value = withTiming(1, { duration: 500 });
      cassetteY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.back) });
      setTimeout(() => playSfx("insert"), 200);
    } else {
      ledOpacity.value = withTiming(0.2, { duration: 300 });
      cassetteY.value = withTiming(10, { duration: 400 });
    }
    powerSwitchX.value = withTiming(powerOn ? 20 : 0, { duration: 200 });
  }, [powerOn]);

  // Scanline animation
  useEffect(() => {
    if (powerOn) {
      scanlineOffset.value = withRepeat(
        withTiming(-10, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [powerOn]);

  // Button handlers
  const handlePlay = createButtonPress(playButtonScale, () => {
    if (powerOn && hasTrack) play();
  });

  const handlePause = createButtonPress(pauseButtonScale, () => {
    if (powerOn) pause();
  });

  const handleRewind = createButtonPress(rewindButtonScale, () => {
    if (powerOn && hasTrack) rewind(5);
  });

  const handleFastForward = createButtonPress(fastForwardButtonScale, () => {
    if (powerOn && hasTrack) fastForward(5);
  });

  const handleStop = createButtonPress(stopButtonScale, () => {
    if (powerOn && hasTrack) {
      pause();
      restartTrack();
    }
  });

  const handleEject = createButtonPress(ejectButtonScale, () => {
    if (powerOn) {
      playSfx("eject");
      cassetteY.value = withTiming(-50, { duration: 600 }, () => {
        cassetteY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.back) });
      });
    }
  });

  const handlePowerToggle = () => {
    setPowerState(!powerOn);
  };

  // Button animated styles
  const createButtonStyle = (scaleRef: Animated.SharedValue<number>, disabled = false) => {
    return useAnimatedStyle(() => ({
      transform: [{ scale: scaleRef.value }],
      opacity: disabled ? 0.5 : 1,
    }));
  };

  const playButtonStyle = createButtonStyle(playButtonScale, !powerOn || !hasTrack);
  const pauseButtonStyle = createButtonStyle(pauseButtonScale, !powerOn || !hasTrack);
  const rewindButtonStyle = createButtonStyle(rewindButtonScale, !powerOn || !hasTrack);
  const fastForwardButtonStyle = createButtonStyle(fastForwardButtonScale, !powerOn || !hasTrack);
  const stopButtonStyle = createButtonStyle(stopButtonScale, !powerOn || !hasTrack);
  const ejectButtonStyle = createButtonStyle(ejectButtonScale, !powerOn);

  const playbackStatus = isPlaying ? "PLAY" : powerOn ? "PAUSE" : "OFF";

  return (
    <View style={styles.container}>
      <View style={styles.walkmanBody}>
        
        {/* LED Display Panel */}
        <View style={styles.ledPanel}>
          <Animated.View style={[styles.ledDisplay, ledAnimatedStyle]}>
            {/* Scanlines overlay */}
            <Animated.View style={[styles.scanlines, scanlineStyle]} />
            
            {/* Display content */}
            <View style={styles.displayContent}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {hasTrack ? title.toUpperCase() : "NO TAPE"}
              </Text>
              <Text style={styles.artistName} numberOfLines={1}>
                {hasTrack ? artist : "---"}
              </Text>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formattedTime}</Text>
                <Text style={styles.statusText}>{playbackStatus}</Text>
              </View>
            </View>
          </Animated.View>
          
          {/* Power Indicator LED */}
          <Animated.View 
            style={[
              styles.powerLED, 
              { backgroundColor: powerIndicatorColor },
              ledAnimatedStyle
            ]} 
          />
        </View>

        {/* Cassette Window */}
        <View style={styles.cassetteWindow}>
          <View style={styles.windowFrame}>
            <Animated.View style={[styles.cassetteContainer, cassetteStyle]}>
              {hasTrack ? (
                <>
                  {/* Left Reel */}
                  <Animated.View style={[styles.reel, leftReelStyle]}>
                    <View style={[styles.reelCenter, { backgroundColor: trackColor }]} />
                    <View style={styles.reelSpokes} />
                  </Animated.View>
                  
                  {/* Center Label */}
                  <View style={styles.cassetteLabel}>
                    <ImageBackground
                      source={currentTrack?.album || null}
                      style={styles.albumArt}
                      imageStyle={styles.albumArtImage}
                    >
                      <View style={styles.albumOverlay} />
                      <Text style={styles.labelText} numberOfLines={2}>
                        {title}
                      </Text>
                      <Text style={styles.labelArtist} numberOfLines={1}>
                        {artist}
                      </Text>
                    </ImageBackground>
                  </View>
                  
                  {/* Right Reel */}
                  <Animated.View style={[styles.reel, rightReelStyle]}>
                    <View style={[styles.reelCenter, { backgroundColor: trackColor }]} />
                    <View style={styles.reelSpokes} />
                  </Animated.View>
                  
                  {/* Tape Progress */}
                  <View style={styles.tapeWindow}>
                    <View style={[styles.tapeProgress, { width: `${progress * 100}%` }]} />
                  </View>
                </>
              ) : (
                <View style={styles.noTapeContainer}>
                  <Text style={styles.noTapeText}>INSERT CASSETTE</Text>
                </View>
              )}
            </Animated.View>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <View style={styles.buttonRow}>
            <Animated.View style={playButtonStyle}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePlay}
                disabled={!powerOn || !hasTrack}
              >
                <Text style={styles.buttonText}>▶</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={pauseButtonStyle}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePause}
                disabled={!powerOn || !hasTrack}
              >
                <Text style={styles.buttonText}>⏸</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={stopButtonStyle}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleStop}
                disabled={!powerOn || !hasTrack}
              >
                <Text style={styles.buttonText}>⏹</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.buttonRow}>
            <Animated.View style={rewindButtonStyle}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleRewind}
                disabled={!powerOn || !hasTrack}
              >
                <Text style={styles.buttonText}>⏮</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={fastForwardButtonStyle}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleFastForward}
                disabled={!powerOn || !hasTrack}
              >
                <Text style={styles.buttonText}>⏭</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={ejectButtonStyle}>
              <TouchableOpacity
                style={[styles.controlButton, styles.ejectButton]}
                onPress={handleEject}
                disabled={!powerOn}
              >
                <Text style={styles.buttonText}>⏏</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Power Switch */}
        <View style={styles.powerSwitchContainer}>
          <TouchableOpacity style={styles.powerSwitchTrack} onPress={handlePowerToggle}>
            <Animated.View style={[styles.powerSwitchKnob, powerSwitchStyle]} />
          </TouchableOpacity>
          <Text style={styles.powerLabel}>POWER</Text>
        </View>

      </View>
    </View>
  );
}

/* ────────────────────────────────
   STYLES
──────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  walkmanBody: {
    width: 350,
    height: 500,
    borderRadius: 25,
    padding: 20,
    backgroundColor: "#0A0F1C", // Base gradient color
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: "#2A3036",
    position: "relative",
  },
  ledPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  ledDisplay: {
    flex: 1,
    height: 80,
    backgroundColor: "#001122",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#003344",
    overflow: "hidden",
    marginRight: 10,
    position: "relative",
  },
  scanlines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: "rgba(0, 255, 255, 0.05)",
  },
  displayContent: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  trackTitle: {
    color: "#00F5FF",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  artistName: {
    color: "#FFDD57",
    fontSize: 10,
    fontFamily: "monospace",
    opacity: 0.8,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  timeText: {
    color: "#00F5FF",
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  statusText: {
    color: "#4CAF50",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  powerLED: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cassetteWindow: {
    flex: 1,
    marginBottom: 20,
  },
  windowFrame: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#333",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  cassetteContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  reel: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#444",
  },
  reelCenter: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    opacity: 0.8,
  },
  reelSpokes: {
    position: "absolute",
    width: 50,
    height: 2,
    backgroundColor: "#666",
  },
  cassetteLabel: {
    flex: 1,
    height: 70,
    marginHorizontal: 15,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  albumArt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  albumArtImage: {
    resizeMode: "cover",
  },
  albumOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  labelText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 4,
  },
  labelArtist: {
    color: "#FFF",
    fontSize: 8,
    textAlign: "center",
    marginTop: 4,
    opacity: 0.9,
    paddingHorizontal: 4,
  },
  tapeWindow: {
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
    height: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 2,
    overflow: "hidden",
  },
  tapeProgress: {
    height: "100%",
    backgroundColor: "#8B4513",
  },
  noTapeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTapeText: {
    color: "#666",
    fontSize: 14,
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  controlsContainer: {
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: "#444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  ejectButton: {
    backgroundColor: "#3A2A2A",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  powerSwitchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  powerSwitchTrack: {
    width: 50,
    height: 26,
    backgroundColor: "#2A2A2A",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#444",
    marginRight: 8,
  },
  powerSwitchKnob: {
    width: 22,
    height: 22,
    backgroundColor: "#FFDD57",
    borderRadius: 11,
    position: "absolute",
    top: 2,
    left: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  powerLabel: {
    color: "#AAA",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
});
