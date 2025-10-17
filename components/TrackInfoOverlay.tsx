import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import type { WalkmanThemeType } from "@/constants/walkman-theme";
import { usePlayerStore } from "@/src/store/playerStore";

interface TrackMetadata {
  album?: string;
  year?: string;
  genre?: string;
  duration?: string;
  lyrics?: string;
}

export default function TrackInfoOverlay({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const theme = useTheme() as WalkmanThemeType;
  const { currentTrack } = usePlayerStore();
  const [metadata, setMetadata] = useState<TrackMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for now - can be replaced with API calls
  const mockMetadata: TrackMetadata = {
    album: "JAGUAR",
    year: "2023",
    genre: "R&B",
    duration: "3:29",
    lyrics: `[Verse 1]
I got my start in the South
Used to work, now I'm out
Mama told me: "Get a job"
Boy, I ain't trying to be a slob

On my mama, I got the sauce
I been cooking since I was lost
Now I'm winning at any cost
On my mama, I'm never gonna fall

[Chorus]
On my mama, I'm the one
On my mama, I been chosen
On my mama, I can't lose
On my mama, I'm too focused

*Note: Full lyrics would require licensing from music publishers*`,
  };

  useEffect(() => {
    if (visible && currentTrack) {
      setLoading(true);
      // Simulate API fetch
      setTimeout(() => {
        setMetadata(mockMetadata);
        setLoading(false);
      }, 1000);
    }
  }, [visible, currentTrack]);

  if (!currentTrack) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            🎵 Track Information
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: theme.colors.primary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Track Info */}
          <View style={styles.trackInfo}>
            <Text style={[styles.trackTitle, { color: theme.colors.text }]}>
              {currentTrack.title}
            </Text>
            <Text style={[styles.trackArtist, { color: theme.colors.text }]}>
              {currentTrack.artist}
            </Text>
          </View>

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                Loading track information...
              </Text>
            </View>
          ) : metadata ? (
            <>
              {/* Metadata Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  📀 Metadata
                </Text>
                <View style={styles.metadataGrid}>
                  <View style={styles.metadataItem}>
                    <Text style={[styles.metadataLabel, { color: theme.colors.text }]}>
                      Album
                    </Text>
                    <Text style={[styles.metadataValue, { color: theme.colors.text }]}>
                      {metadata.album}
                    </Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={[styles.metadataLabel, { color: theme.colors.text }]}>
                      Year
                    </Text>
                    <Text style={[styles.metadataValue, { color: theme.colors.text }]}>
                      {metadata.year}
                    </Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={[styles.metadataLabel, { color: theme.colors.text }]}>
                      Genre
                    </Text>
                    <Text style={[styles.metadataValue, { color: theme.colors.text }]}>
                      {metadata.genre}
                    </Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={[styles.metadataLabel, { color: theme.colors.text }]}>
                      Duration
                    </Text>
                    <Text style={[styles.metadataValue, { color: theme.colors.text }]}>
                      {metadata.duration}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Lyrics Section */}
              {metadata.lyrics && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                    📝 Lyrics
                  </Text>
                  <Text style={[styles.lyricsText, { color: theme.colors.text }]}>
                    {metadata.lyrics}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No additional information available
              </Text>
            </View>
          )}

          {/* Footer Note */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text }]}>
              💡 Tip: Full lyrics and extended metadata can be fetched from music APIs
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  trackInfo: {
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  trackArtist: {
    fontSize: 18,
    opacity: 0.8,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metadataItem: {
    width: "48%",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  metadataLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  lyricsText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "monospace",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  footer: {
    paddingVertical: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    fontStyle: "italic",
  },
});
