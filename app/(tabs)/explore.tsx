import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@react-navigation/native";
import type { ReplayThemeType } from "@/constants/replay-theme";
import { AVAILABLE_TRACKS, searchTracks, getTracksByGenre } from "@/src/data/tracks";
import { usePlayerStore } from "@/src/store/playerStore";
import type { Track } from "@/src/types/audio";

const GENRES = ["All", "R&B", "Hip-Hop", "Pop"];

export default function ExploreScreen() {
  const theme = useTheme() as ReplayThemeType;
  const { addToPlaylist, loadTrack } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const filteredTracks =
    selectedGenre === "All"
      ? searchQuery
        ? searchTracks(searchQuery)
        : AVAILABLE_TRACKS
      : getTracksByGenre(selectedGenre).filter((track) =>
          searchQuery
            ? track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              track.artist.toLowerCase().includes(searchQuery.toLowerCase())
            : true
        );

  const handleTrackPress = (track: Track) => {
    loadTrack(track);
    router.push({
      pathname: "/player",
      params: { id: track.id },
    });
  };

  const handleAddToPlaylist = (track: Track) => {
    addToPlaylist(track);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.header, { color: theme.colors.primary }]}>
        🔍 Explore Music
      </Text>

      {/* Search Bar */}
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Search tracks or artists..."
        placeholderTextColor={theme.colors.secondaryText}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Genre Filter */}
      <View style={styles.genreContainer}>
        {GENRES.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.genreButton,
              selectedGenre === genre && styles.genreButtonActive,
              {
                backgroundColor:
                  selectedGenre === genre
                    ? theme.colors.primary
                    : theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setSelectedGenre(genre)}
          >
            <Text
              style={[
                styles.genreText,
                {
                  color:
                    selectedGenre === genre
                      ? theme.colors.background
                      : theme.colors.text,
                },
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Track List */}
      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.trackCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
            onPress={() => handleTrackPress(item)}
          >
            <View style={styles.trackInfo}>
              <Text style={[styles.trackTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.trackArtist, { color: theme.colors.secondaryText }]}
              >
                {item.artist}
              </Text>
              {item.genre && (
                <Text
                  style={[styles.trackGenre, { color: theme.colors.secondaryText }]}
                >
                  {item.genre}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: item.color }]}
              onPress={() => handleAddToPlaylist(item)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {searchQuery
                ? "No tracks found matching your search"
                : "No tracks available"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  searchInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  genreContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  genreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreButtonActive: {
    opacity: 1,
  },
  genreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    marginBottom: 4,
  },
  trackGenre: {
    fontSize: 12,
    opacity: 0.7,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
});
