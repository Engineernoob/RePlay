import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
} from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import type { WalkmanThemeType } from "@/constants/walkman-theme";
import {
  usePlayerController,
  usePlayerStore,
  playSfx,
} from "@/src/store/playerStore";
import Cassette from "@/components/Cassette";
import LCDDisplay from "@/components/LCDDisplay";
import VUMeter from "@/components/VUMeter";
import TrackInfoOverlay from "@/components/TrackInfoOverlay";

const songs: Record<
  string,
  { audio: any; album: any; color: string; artist: string; title: string }
> = {
  "1": {
    title: "On My Mama",
    artist: "Victoria Monét",
    audio: require("@/assets/mp3s/OnMyMama.mp3"),
    album: require("@/assets/images/covers/VictoriaMonet.png"),
    color: "#FF7E57",
  },
  "2": {
    title: "Timeless",
    artist: "The Weeknd & Playboi Carti",
    audio: require("@/assets/mp3s/Timeless.mp3"),
    album: require("@/assets/images/covers/Timeless.png"),
    color: "#7E57FF",
  },
  "3": {
    title: "Paint the Town Red",
    artist: "Doja Cat",
    audio: require("@/assets/mp3s/PaintTheTownRed.mp3"),
    album: require("@/assets/images/covers/Paint-The-Town-Red.png"),
    color: "#D62D2D",
  },
};

export default function PlayerScreen() {
  const { id = "1" } = useLocalSearchParams<{ id?: string }>();
  const song = songs[id];
  const theme = useTheme() as WalkmanThemeType;
  const { play, pause, isPlaying } = usePlayerStore();
  const router = useRouter();

  usePlayerController(song.audio);

  // play insert sound when entering
  useEffect(() => {
    playSfx(require("@/assets/sfx/tape-cassette-insert.mp3"), 200);
  }, []);

  // shared value for cassette Y position
  const cassetteY = useSharedValue(150);

  // blinking LED for play indicator
  const ledOpacity = useSharedValue(0.3);

  // sync cassette position with play state
  useEffect(() => {
    cassetteY.value = withTiming(isPlaying ? 0 : 150, { duration: 700 });
  }, [isPlaying, cassetteY]);

  // LED blinking animation
  useEffect(() => {
    if (isPlaying) {
      ledOpacity.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 600 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        true
      );
    } else {
      ledOpacity.value = withTiming(0.3, { duration: 300 });
    }
  }, [isPlaying, ledOpacity]);

  const cassetteAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: cassetteY.value }],
  }));

  const ledAnim = useAnimatedStyle(() => ({
    opacity: ledOpacity.value,
  }));

  const buttonScale = useSharedValue(1);
  const [showTrackInfo, setShowTrackInfo] = useState(false);

  const handleEject = async () => {
    playSfx(require("@/assets/sfx/cassette-eject.mp3"), 0);
    cassetteY.value = withSequence(
      withTiming(-120, { duration: 400 }),
      withTiming(300, { duration: 400 })
    );
    setTimeout(() => router.back(), 700);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.displaySection}>
        <LCDDisplay title={song.title} artist={song.artist} />
        <VUMeter barCount={12} height={35} />
        <View style={styles.topButtons}>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowTrackInfo(true)}
          >
            <Text style={styles.infoButtonText}>📋</Text>
          </TouchableOpacity>
          <Animated.View style={[styles.ledIndicator, ledAnim]}>
            <View style={[styles.ledInner, isPlaying && styles.ledActive]} />
          </Animated.View>
        </View>
      </View>

      
      
      <Animated.View style={[cassetteAnim]}>
        <Cassette 
          color={song.color} 
          album={song.album} 
          sharedTransitionTag={`cassette-${id}`}
        />
      </Animated.View>

      <View style={styles.controls}>
        <View style={styles.buttonRow}>
          <Button 
            label="⏪" 
            onPress={() => {}} 
            soundEffect={require("@/assets/sfx/button-click.mp3")}
          />
          <Button
            label={isPlaying ? "⏸" : "▶️"}
            onPress={() => (isPlaying ? pause() : play())}
            soundEffect={require("@/assets/sfx/button-click.mp3")}
          />
          <Button 
            label="⏩" 
            onPress={() => {}} 
            soundEffect={require("@/assets/sfx/button-click.mp3")}
          />
        </View>

        <TouchableOpacity style={styles.ejectButton} onPress={handleEject}>
          <Animated.Text style={styles.ejectText}>⏏ Eject</Animated.Text>
        </TouchableOpacity>
      </View>

      <TrackInfoOverlay
        visible={showTrackInfo}
        onClose={() => setShowTrackInfo(false)}
      />
    </View>
  );
}

function Button({ 
  label, 
  onPress, 
  soundEffect 
}: { 
  label: string; 
  onPress: () => void; 
  soundEffect?: any;
}) {
  const buttonScale = useSharedValue(1);

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
    if (soundEffect) {
      playSfx(soundEffect, 0);
    }
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.btnOuter}>
      <View style={styles.btnInner}>
        <Animated.View 
          style={animatedStyle}
          onTouchStart={handlePressIn}
          onTouchEnd={handlePressOut}
        >
          <Animated.Text style={styles.btnLabel}>{label}</Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "space-around",
    backgroundColor: "#0A0A0A",
  },
  displaySection: { alignItems: "center", marginTop: 40 },
  topButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 5,
  },
  infoButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#333",
    borderWidth: 2,
    borderColor: "#555",
  },
  infoButtonText: {
    fontSize: 16,
    color: "#FFDD57",
  },
  controls: { marginBottom: 40, alignItems: "center" },
  buttonRow: { flexDirection: "row", gap: 25 },
  btnOuter: {
    backgroundColor: "#4A4A4A",
    borderRadius: 12,
    padding: 8,
    borderWidth: 3,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  btnInner: {
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  btnLabel: { 
    fontSize: 20, 
    color: "#FFDD57",
    fontWeight: "700",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ejectButton: {
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#FFDD57",
    backgroundColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  ejectText: { 
    color: "#FFDD57", 
    fontWeight: "700", 
    fontSize: 16,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ledIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#222",
    borderWidth: 2,
    borderColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  ledInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
  },
  ledActive: {
    backgroundColor: "#FF8C00",
    shadowColor: "#FF8C00",
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
