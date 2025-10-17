import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import type { WalkmanThemeType } from "@/constants/walkman-theme";
import { usePlayerStore } from "@/src/store/playerStore";
import Cassette from "@/components/Cassette";

export default function PlaylistManager({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const theme = useTheme() as WalkmanThemeType;
  const {
    playlist,
    currentTrackIndex,
    playNext,
    playPrevious,
    jumpToTrack,
    removeFromPlaylist,
    clearPlaylist,
    isShuffle,
    toggleShuffle,
    repeatMode,
    setRepeatMode,
  } = usePlayerStore();

  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);

  const handleTrackPress = (index: number) => {
    jumpToTrack(index);
    setSelectedTrack(index);
  };

  const handleRemoveTrack = (trackId: string) => {
    Alert.alert(
      "Remove Track",
      "Are you sure you want to remove this track from the playlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFromPlaylist(trackId),
        },
      ]
    );
  };

  const handleClearPlaylist = () => {
    Alert.alert(
      "Clear Playlist",
      "Are you sure you want to clear the entire playlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearPlaylist();
            onClose();
          },
        },
      ]
    );
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return "🔂";
      case "all":
        return "🔁";
      default:
        return "🔀";
    }
  };

  const renderPlaylistItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[
      styles.playlistItem,
      index === currentTrackIndex && styles.currentTrack,
    ]}>
      <TouchableOpacity
        style={styles.trackInfo}
        onPress={() => handleTrackPress(index)}
      >
        <View style={styles.trackDetails}>
          <Text
            style={[
              styles.trackTitle,
              { color: index === currentTrackIndex ? theme.colors.primary : "#FFF" }
            ]}
            numberOfLines={1}
          >
            {index + 1}. {item.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <Text style={styles.currentPlaying}>
          {index === currentTrackIndex && "▶️"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveTrack(item.id)}
      >
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

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
            🎧 Playlist ({playlist.length})
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: theme.colors.primary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isShuffle && styles.activeControl]}
            onPress={toggleShuffle}
          >
            <Text style={styles.controlText}>🔀 Shuffle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.activeControl]}
            onPress={() => {
              const nextMode = repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none";
              setRepeatMode(nextMode);
            }}
          >
            <Text style={styles.controlText}>
              {getRepeatIcon()} {repeatMode === "none" ? "Repeat" : repeatMode}
            </Text>
          </TouchableOpacity>

          {playlist.length > 0 && (
            <TouchableOpacity
              style={[styles.controlButton, styles.dangerControl]}
              onPress={handleClearPlaylist}
            >
              <Text style={styles.controlText}>🗑️ Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Playlist */}
        {playlist.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No tracks in playlist
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.text }]}>
              Add tracks from the library to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlist}
            keyExtractor={(item) => item.id}
            renderItem={renderPlaylistItem}
            style={styles.playlist}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Mini Cassette Display */}
        {playlist.length > 0 && playlist[currentTrackIndex] && (
          <View style={styles.miniCassette}>
            <Cassette
              color={playlist[currentTrackIndex].color}
              album={playlist[currentTrackIndex].album}
              title={playlist[currentTrackIndex].title}
              artist={playlist[currentTrackIndex].artist}
            />
          </View>
        )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "700",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#333",
    borderWidth: 2,
    borderColor: "#555",
  },
  activeControl: {
    backgroundColor: "#007AFF",
    borderColor: "#0056CC",
  },
  dangerControl: {
    backgroundColor: "#FF3B30",
    borderColor: "#CC2E26",
  },
  controlText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  playlist: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  currentTrack: {
    backgroundColor: "#007AFF",
    borderColor: "#0056CC",
  },
  trackInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    opacity: 0.7,
    color: "#CCC",
  },
  currentPlaying: {
    fontSize: 20,
    marginRight: 16,
  },
  removeButton: {
    padding: 8,
  },
  removeText: {
    color: "#FF3B30",
    fontSize: 18,
    fontWeight: "600",
  },
  miniCassette: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
});
