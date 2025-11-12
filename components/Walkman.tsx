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
  usePlayerStore,
  usePlayerController
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

  // Initialize audio player with current track
  // This hook creates and manages the audio player instance
  usePlayerController(currentTrack);

  // Visual hooks
  const progress = useProgress();
  const { formattedTime } = useFormattedTime();
  const { title, artist, hasTrack, color: trackColor } = useTrackMetadata();
  const { brightness: ledBrightness, isAnimating: ledIsAnimating } = useLEDStatus();
  const { isOn: powerIsOn, indicatorColor: powerIndicatorColor } = usePowerState();
  const { volume } = usePlayerStore();

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

  // Reel rotation logic - matches playback progress
  useEffect(() => {
    if (isPlaying && powerOn && hasTrack && duration > 0) {
      // Calculate rotation speed based on track duration
      // Faster rotation for shorter tracks, slower for longer tracks
      // Base: 1 full rotation per 2 seconds of audio
      const baseRotationTime = 2000; // milliseconds per full rotation
      const spinDuration = Math.max(1500, Math.min(3000, baseRotationTime));
      
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

      // Add subtle wobble for realism
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
      // Stop rotation smoothly with deceleration
      const currentLeft = leftReelRotation.value % 360;
      const currentRight = rightReelRotation.value % 360;
      
      leftReelRotation.value = withTiming(currentLeft, { 
        duration: 800, 
        easing: Easing.out(Easing.quad) 
      });
      rightReelRotation.value = withTiming(currentRight, { 
        duration: 800, 
        easing: Easing.out(Easing.quad) 
      });
      
      // Stop wobble smoothly
      wobbleX.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) });
      wobbleY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) });
    }
  }, [isPlaying, powerOn, hasTrack, duration]);

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
  const tapeCounter = Math.floor((currentTime / duration) * 999) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.walkmanBody}>
        
        {/* Top Panel - Branding & Indicators */}
        <View style={styles.topPanel}>
          <View style={styles.branding}>
            <Text style={styles.brandText}>SONY</Text>
            <Text style={styles.modelText}>WM-DD90</Text>
          </View>
          <View style={styles.indicators}>
            {/* Dolby Indicator */}
            <View style={[styles.indicator, styles.dolbyIndicator]}>
              <Text style={styles.indicatorText}>DOLBY</Text>
              <View style={[styles.indicatorLED, { opacity: powerOn ? 0.6 : 0.2 }]} />
            </View>
            {/* Battery Indicator */}
            <View style={styles.batteryIndicator}>
              <View style={[styles.batteryLevel, { width: powerOn ? "80%" : "20%" }]} />
              <Text style={styles.batteryText}>BATT</Text>
            </View>
          </View>
        </View>

        {/* LED Display Panel - More Authentic 80s Style */}
        <View style={styles.ledPanel}>
          <Animated.View style={[styles.ledDisplay, ledAnimatedStyle]}>
            {/* Scanlines overlay for CRT effect */}
            <Animated.View style={[styles.scanlines, scanlineStyle]}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.scanline,
                    {
                      top: `${(i / 20) * 100}%`,
                      height: 1,
                    },
                  ]}
                />
              ))}
            </Animated.View>
            {/* Reflective glass effect */}
            <View style={styles.displayGlass} />
            
            {/* Display content */}
            <View style={styles.displayContent}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {hasTrack ? title.toUpperCase().padEnd(16, " ") : "NO TAPE INSERTED"}
              </Text>
              <Text style={styles.artistName} numberOfLines={1}>
                {hasTrack ? artist.toUpperCase().padEnd(16, " ") : "---"}
              </Text>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formattedTime}</Text>
                <Text style={styles.statusText}>{playbackStatus}</Text>
              </View>
              {/* Tape Counter */}
              <View style={styles.counterContainer}>
                <Text style={styles.counterLabel}>COUNTER</Text>
                <Text style={styles.counterValue}>{String(tapeCounter).padStart(3, "0")}</Text>
              </View>
            </View>
          </Animated.View>
          
          {/* Power Indicator LED with glow */}
          <Animated.View 
            style={[
              styles.powerLED, 
              { backgroundColor: powerIndicatorColor },
              ledAnimatedStyle
            ]} 
          >
            <View style={[styles.powerLEDGlow, { backgroundColor: powerIndicatorColor }]} />
          </Animated.View>
        </View>

        {/* Cassette Window - More Authentic Design */}
        <View style={styles.cassetteWindow}>
          {/* Window frame with beveled edges */}
          <View style={styles.windowFrame}>
            <View style={styles.windowBevel} />
            <Animated.View style={[styles.cassetteContainer, cassetteStyle]}>
              {hasTrack ? (
                <>
                  {/* Tape mechanism guides */}
                  <View style={styles.tapeGuides}>
                    <View style={styles.tapeGuide} />
                    <View style={styles.tapeGuide} />
                  </View>
                  
                  {/* Left Reel with more detail */}
                  <Animated.View style={[styles.reel, leftReelStyle]}>
                    <View style={styles.reelOuter} />
                    <View style={[styles.reelCenter, { backgroundColor: trackColor }]} />
                    <View style={styles.reelSpokes} />
                    <View style={styles.reelHub} />
                  </Animated.View>
                  
                  {/* Center Label with more authentic styling */}
                  <View style={styles.cassetteLabel}>
                    <ImageBackground
                      source={currentTrack?.album || null}
                      style={styles.albumArt}
                      imageStyle={styles.albumArtImage}
                    >
                      <View style={styles.albumOverlay} />
                      <View style={styles.labelBorder} />
                      <Text style={styles.labelText} numberOfLines={2}>
                        {title}
                      </Text>
                      <Text style={styles.labelArtist} numberOfLines={1}>
                        {artist}
                      </Text>
                      <View style={styles.labelDivider} />
                      <Text style={styles.labelSide}>SIDE A</Text>
                    </ImageBackground>
                  </View>
                  
                  {/* Right Reel with more detail */}
                  <Animated.View style={[styles.reel, rightReelStyle]}>
                    <View style={styles.reelOuter} />
                    <View style={[styles.reelCenter, { backgroundColor: trackColor }]} />
                    <View style={styles.reelSpokes} />
                    <View style={styles.reelHub} />
                  </Animated.View>
                  
                  {/* Tape Progress with more realistic appearance */}
                  <View style={styles.tapeWindow}>
                    <View style={styles.tapeBackground} />
                    <View style={[styles.tapeProgress, { width: `${progress * 100}%` }]} />
                    <View style={styles.tapeShine} />
                  </View>
                  
                  {/* Tape path visualization */}
                  <View style={styles.tapePath}>
                    <View style={styles.tapePathLine} />
                  </View>
                </>
              ) : (
                <View style={styles.noTapeContainer}>
                  <Text style={styles.noTapeText}>INSERT CASSETTE</Text>
                  <View style={styles.noTapeIcon}>
                    <Text style={styles.noTapeIconText}>⏏</Text>
                  </View>
                </View>
              )}
            </Animated.View>
            <View style={styles.windowBevelBottom} />
          </View>
        </View>

        {/* Control Buttons - More Authentic 80s Style */}
        <View style={styles.controlsContainer}>
          {/* Main Playback Controls */}
          <View style={styles.buttonRow}>
            <Animated.View style={rewindButtonStyle}>
              <TouchableOpacity
                style={[styles.controlButton, styles.rewindButton]}
                onPress={handleRewind}
                disabled={!powerOn || !hasTrack}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonSymbol}>⏪</Text>
                  <Text style={styles.buttonLabel}>REW</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={playButtonStyle}>
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton]}
                onPress={handlePlay}
                disabled={!powerOn || !hasTrack}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonSymbol}>▶</Text>
                  <Text style={styles.buttonLabel}>PLAY</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={fastForwardButtonStyle}>
              <TouchableOpacity
                style={[styles.controlButton, styles.ffButton]}
                onPress={handleFastForward}
                disabled={!powerOn || !hasTrack}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonSymbol}>⏩</Text>
                  <Text style={styles.buttonLabel}>FF</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Secondary Controls */}
          <View style={styles.buttonRow}>
            <Animated.View style={pauseButtonStyle}>
              <TouchableOpacity
                style={[styles.controlButton, styles.pauseButton]}
                onPress={handlePause}
                disabled={!powerOn || !hasTrack}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonSymbol}>⏸</Text>
                  <Text style={styles.buttonLabel}>PAUSE</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={stopButtonStyle}>
              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={handleStop}
                disabled={!powerOn || !hasTrack}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonSymbol}>⏹</Text>
                  <Text style={styles.buttonLabel}>STOP</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={ejectButtonStyle}>
              <TouchableOpacity
                style={[styles.controlButton, styles.ejectButton]}
                onPress={handleEject}
                disabled={!powerOn}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonSymbol}>⏏</Text>
                  <Text style={styles.buttonLabel}>EJECT</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Headphone Jack & Volume */}
        <View style={styles.bottomPanel}>
          <View style={styles.headphoneJack}>
            <View style={styles.jackHole} />
            <Text style={styles.jackLabel}>PHONES</Text>
          </View>
          <View style={styles.volumeControl}>
            <Text style={styles.volumeLabel}>VOL</Text>
            <View style={styles.volumeBar}>
              <View style={[styles.volumeLevel, { width: `${(volume || 1) * 100}%` }]} />
            </View>
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
    backgroundColor: "#0A0F1C", // Navy base
    // Gradient effect using multiple layers
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 2,
    borderColor: "#1A2332",
    position: "relative",
    // Inner shadow effect
    borderTopWidth: 1,
    borderTopColor: "#2A3036",
    borderBottomWidth: 3,
    borderBottomColor: "#050810",
  },
  // Top Panel with Branding
  topPanel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1A2332",
  },
  branding: {
    alignItems: "flex-start",
  },
  brandText: {
    color: "#FFDD57",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
    fontFamily: "monospace",
  },
  modelText: {
    color: "#00F5FF",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    fontFamily: "monospace",
    opacity: 0.8,
  },
  indicators: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  indicator: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#0F1620",
    borderWidth: 1,
    borderColor: "#1A2332",
  },
  dolbyIndicator: {
    borderColor: "#4A90E2",
  },
  indicatorText: {
    color: "#4A90E2",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: "monospace",
    marginBottom: 2,
  },
  indicatorLED: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A90E2",
  },
  batteryIndicator: {
    width: 30,
    height: 16,
    borderRadius: 2,
    backgroundColor: "#0F1620",
    borderWidth: 1,
    borderColor: "#1A2332",
    padding: 2,
    position: "relative",
  },
  batteryLevel: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 1,
    transition: "width 0.3s",
  },
  batteryText: {
    position: "absolute",
    top: -12,
    left: 0,
    right: 0,
    color: "#AAA",
    fontSize: 6,
    textAlign: "center",
    fontFamily: "monospace",
  },
  ledPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  ledDisplay: {
    flex: 1,
    height: 100,
    backgroundColor: "#001122",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#003344",
    overflow: "hidden",
    marginRight: 10,
    position: "relative",
    // Dark glass effect
    borderTopColor: "#004455",
    borderBottomColor: "#000811",
  },
  displayGlass: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 245, 255, 0.03)",
    pointerEvents: "none",
  },
  scanlines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  scanline: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 255, 255, 0.05)",
  },
  counterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 245, 255, 0.2)",
  },
  counterLabel: {
    color: "#00F5FF",
    fontSize: 8,
    fontFamily: "monospace",
    opacity: 0.7,
  },
  counterValue: {
    color: "#00F5FF",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  powerLEDGlow: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.4,
    top: -4,
    left: -4,
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
    borderColor: "#1A1A1A",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    position: "relative",
    // Beveled edges
    borderTopColor: "#2A2A2A",
    borderLeftColor: "#2A2A2A",
    borderRightColor: "#050505",
    borderBottomColor: "#050505",
  },
  windowBevel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  windowBevelBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  tapeGuides: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    zIndex: 1,
  },
  tapeGuide: {
    width: 4,
    height: 20,
    backgroundColor: "#333",
    borderRadius: 2,
    opacity: 0.5,
  },
  reelOuter: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#444",
    backgroundColor: "#1A1A1A",
  },
  reelHub: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#555",
  },
  labelBorder: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
  },
  labelDivider: {
    position: "absolute",
    bottom: 12,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  labelSide: {
    position: "absolute",
    bottom: 4,
    left: 0,
    right: 0,
    color: "#FFF",
    fontSize: 7,
    textAlign: "center",
    fontFamily: "monospace",
    opacity: 0.8,
    fontWeight: "600",
  },
  tapeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0A0A0A",
  },
  tapeShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  tapePath: {
    position: "absolute",
    top: "50%",
    left: 15,
    right: 15,
    height: 2,
    zIndex: 0,
  },
  tapePathLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(139, 69, 19, 0.3)",
    borderStyle: "dashed",
  },
  noTapeIcon: {
    marginTop: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(102, 102, 102, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  noTapeIconText: {
    fontSize: 24,
    color: "#666",
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
    width: 65,
    height: 55,
    backgroundColor: "#1A1F2E",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "#2A2F3E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    // Metallic gradient effect
    borderTopColor: "#3A3F4E",
    borderLeftColor: "#3A3F4E",
    borderRightColor: "#0A0F1E",
    borderBottomColor: "#0A0F1E",
  },
  buttonInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSymbol: {
    color: "#FFDD57",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  buttonLabel: {
    color: "#AAA",
    fontSize: 8,
    fontWeight: "600",
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  playButton: {
    backgroundColor: "#1A2F2E",
    borderColor: "#2A4F4E",
    borderTopColor: "#3A5F5E",
    borderLeftColor: "#3A5F5E",
  },
  pauseButton: {
    backgroundColor: "#2A1F2E",
    borderColor: "#3A2F3E",
  },
  stopButton: {
    backgroundColor: "#2E1A1A",
    borderColor: "#3E2A2A",
  },
  rewindButton: {
    backgroundColor: "#1F1A2E",
  },
  ffButton: {
    backgroundColor: "#1F1A2E",
  },
  ejectButton: {
    backgroundColor: "#2E1A1A",
    borderColor: "#4E2A2A",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  // Bottom Panel
  bottomPanel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1A2332",
  },
  headphoneJack: {
    alignItems: "center",
    justifyContent: "center",
  },
  jackHole: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0A0A0A",
    borderWidth: 2,
    borderColor: "#2A2A2A",
    marginBottom: 4,
    // Inner shadow
    borderTopColor: "#1A1A1A",
    borderLeftColor: "#1A1A1A",
    borderRightColor: "#050505",
    borderBottomColor: "#050505",
  },
  jackLabel: {
    color: "#AAA",
    fontSize: 8,
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  volumeControl: {
    flex: 1,
    marginLeft: 20,
    alignItems: "center",
  },
  volumeLabel: {
    color: "#AAA",
    fontSize: 8,
    fontFamily: "monospace",
    marginBottom: 4,
    letterSpacing: 1,
  },
  volumeBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#1A1A1A",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  volumeLevel: {
    height: "100%",
    backgroundColor: "#00F5FF",
    borderRadius: 3,
    // Glow effect
    shadowColor: "#00F5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  powerSwitchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  powerSwitchTrack: {
    width: 50,
    height: 26,
    backgroundColor: "#1A1F2E",
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#2A2F3E",
    marginRight: 8,
    // Metallic track
    borderTopColor: "#3A3F4E",
    borderLeftColor: "#3A3F4E",
    borderRightColor: "#0A0F1E",
    borderBottomColor: "#0A0F1E",
  },
  powerSwitchKnob: {
    width: 20,
    height: 20,
    backgroundColor: "#FFDD57",
    borderRadius: 10,
    position: "absolute",
    top: 3,
    left: 3,
    shadowColor: "#FFDD57",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    // Glossy effect
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.3)",
  },
  powerLabel: {
    color: "#AAA",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
});
