import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { usePlayerStore } from "@/src/store/playerStore";
import type { WalkmanThemeType } from "@/constants/walkman-theme";
import { useTheme } from "@react-navigation/native";

export default function ErrorDisplay() {
  const theme = useTheme() as WalkmanThemeType;
  const { error, loadTrack, currentTrack } = usePlayerStore();

  if (!error) return null;

  const handleRetry = () => {
    if (currentTrack) {
      loadTrack(currentTrack);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.errorBox, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.errorIcon, { color: theme.colors.notification }]}>
          ⚠️
        </Text>
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
          Playback Error
        </Text>
        <Text style={[styles.errorMessage, { color: theme.colors.secondaryText }]}>
          {error.message}
        </Text>
        {currentTrack && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleRetry}
          >
            <Text style={[styles.retryText, { color: theme.colors.background }]}>
              Retry
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  errorBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FF3B30",
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

