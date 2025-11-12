import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@react-navigation/native";
import type { ReplayThemeType } from "@/constants/replay-theme";
import { useLibraryStore } from "@/src/store/libraryStore";
import { usePlayerStore } from "@/src/store/playerStore";
import CassetteCard from "@/components/CassetteCard";
import type { Cassette } from "@/src/store/libraryStore";
import { getAvailableMP3Tracks } from "@/src/utils/mp3Loader";
import type { Track } from "@/src/types/audio";

const { width } = Dimensions.get("window");
const CASSETTE_COLORS = [
  "#FF7E57", // Orange
  "#7E57FF", // Purple
  "#D62D2D", // Red
  "#00F5FF", // Cyan
  "#FFDD57", // Amber
  "#FF4E9C", // Rose
  "#4CAF50", // Green
  "#2196F3", // Blue
];

export default function LibraryScreen() {
  const theme = useTheme() as ReplayThemeType;
  const {
    cassettes,
    loadCassette,
    removeCassette,
    renameCassette,
    getLastPlayedCassette,
    activeCassetteId,
  } = useLibraryStore();
  const { loadPlaylist, loadTrack, currentTrack, playlist: currentPlaylist } = usePlayerStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCassetteName, setNewCassetteName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CASSETTE_COLORS[0]);
  const [editingCassette, setEditingCassette] = useState<Cassette | null>(null);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);

  const lastPlayedCassette = getLastPlayedCassette();

  // Playback Resume Logic: Auto-load last played cassette on mount
  useEffect(() => {
    if (lastPlayedCassette && !activeCassetteId) {
      handleLoadCassette(lastPlayedCassette.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadCassette = (cassetteId: string) => {
    const cassette = loadCassette(cassetteId);
    if (cassette) {
      // Set active cassette in both stores
      useLibraryStore.getState().setActiveCassette(cassetteId);
      usePlayerStore.getState().setActiveCassetteId(cassetteId);
      
      // Load tracks into player
      loadPlaylist(cassette.tracks);

      // Resume playback if there's a saved position
      if (cassette.lastPlayed && cassette.position !== undefined) {
        const lastTrack = cassette.tracks.find(
          (t) => t.id === cassette.lastPlayed
        );
        if (lastTrack) {
          loadTrack(lastTrack);
          // Seek to saved position
          setTimeout(() => {
            usePlayerStore.getState().seekTo(cassette.position || 0);
          }, 500);
        }
      } else if (cassette.tracks.length > 0) {
        // Load first track if no saved position
        loadTrack(cassette.tracks[0]);
      }

      // Navigate to player
      router.push("/player");
    }
  };

  const handleCreateCassette = () => {
    if (!newCassetteName.trim()) {
      Alert.alert("Error", "Please enter a cassette name");
      return;
    }

    // Use selected tracks if available, otherwise use current playlist
    const currentPlaylist = usePlayerStore.getState().playlist;
    const tracksToSave = selectedTracks.length > 0 
      ? selectedTracks 
      : currentPlaylist.length > 0 
        ? currentPlaylist 
        : [];

    if (tracksToSave.length === 0) {
      Alert.alert(
        "No Tracks",
        "Please select tracks from MP3 files or add tracks to your playlist first!",
        [
          {
            text: "Select MP3 Files",
            onPress: () => setShowTrackSelector(true),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
      return;
    }

    useLibraryStore.getState().addCassette({
      name: newCassetteName.trim(),
      tracks: tracksToSave,
      color: selectedColor,
    });

    setNewCassetteName("");
    setSelectedColor(CASSETTE_COLORS[0]);
    setSelectedTracks([]);
    setShowAddModal(false);
    setShowTrackSelector(false);
  };

  const handleToggleTrack = (track: Track) => {
    setSelectedTracks((prev) => {
      const isSelected = prev.some((t) => t.id === track.id);
      if (isSelected) {
        return prev.filter((t) => t.id !== track.id);
      } else {
        return [...prev, track];
      }
    });
  };

  const handleEditCassette = (cassette: Cassette) => {
    setEditingCassette(cassette);
    setNewCassetteName(cassette.name);
    setSelectedColor(cassette.color);
    setShowAddModal(true);
  };

  const handleUpdateCassette = () => {
    if (!editingCassette || !newCassetteName.trim()) {
      Alert.alert("Error", "Please enter a cassette name");
      return;
    }

    renameCassette(editingCassette.id, newCassetteName.trim());
    useLibraryStore.getState().updateCassette(editingCassette.id, {
      color: selectedColor,
    });

    setEditingCassette(null);
    setNewCassetteName("");
    setSelectedColor(CASSETTE_COLORS[0]);
    setShowAddModal(false);
  };

  const handleDeleteCassette = (cassette: Cassette) => {
    Alert.alert(
      "Delete Cassette",
      `Are you sure you want to delete "${cassette.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeCassette(cassette.id),
        },
      ]
    );
  };

  const renderCassette = ({ item }: { item: Cassette }) => {
    const isActive = activeCassetteId === item.id;
    const isLastPlayed = lastPlayedCassette?.id === item.id;

    return (
      <View style={styles.cassetteWrapper}>
        <CassetteCard
          cassette={item}
          onPress={() => handleLoadCassette(item.id)}
          onEdit={() => handleEditCassette(item)}
          isActive={isActive}
          isLastPlayed={isLastPlayed}
        />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCassette(item)}
        >
          <Text style={styles.deleteButtonText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.header, { color: theme.colors.primary }]}>
        📼 Cassette Library
      </Text>

      {cassettes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Cassettes Yet
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
            Create your first cassette mix from your current playlist!
          </Text>
        </View>
      ) : (
      <FlatList
          data={cassettes}
        keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={renderCassette}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingCassette(null);
          setNewCassetteName("");
          setSelectedColor(CASSETTE_COLORS[0]);
          setShowAddModal(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Cassette Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: theme.colors.primary }]}
            >
              {editingCassette ? "Edit Cassette" : "Create New Cassette"}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Cassette name..."
              placeholderTextColor={theme.colors.secondaryText}
              value={newCassetteName}
              onChangeText={setNewCassetteName}
              autoFocus
            />

            <Text style={[styles.colorLabel, { color: theme.colors.text }]}>
              Choose Color:
            </Text>
            <View style={styles.colorGrid}>
              {CASSETTE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderColor:
                        selectedColor === color ? "#00F5FF" : "transparent",
                      borderWidth: selectedColor === color ? 3 : 0,
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            {/* Track Selection Section */}
            {!editingCassette && (
              <>
                <TouchableOpacity
                  style={[styles.selectTracksButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setShowTrackSelector(!showTrackSelector)}
                >
                  <Text style={styles.selectTracksButtonText}>
                    {showTrackSelector ? "Hide" : "Select"} MP3 Files
                    {selectedTracks.length > 0 && ` (${selectedTracks.length} selected)`}
                  </Text>
                </TouchableOpacity>

                {showTrackSelector && (
                  <View style={styles.trackSelectorContainer}>
                    <Text style={[styles.trackSelectorTitle, { color: theme.colors.text }]}>
                      Available MP3 Files:
                    </Text>
                    <FlatList
                      data={getAvailableMP3Tracks()}
                      keyExtractor={(item) => item.id}
                      style={styles.trackList}
                      renderItem={({ item }) => {
                        const isSelected = selectedTracks.some((t) => t.id === item.id);
                        return (
                          <TouchableOpacity
                            style={[
                              styles.trackItem,
                              {
                                backgroundColor: isSelected 
                                  ? theme.colors.primary 
                                  : theme.colors.background,
                                borderColor: theme.colors.border,
                              },
                            ]}
                            onPress={() => handleToggleTrack(item)}
                          >
                            <Text
                              style={[
                                styles.trackItemText,
                                {
                                  color: isSelected 
                                    ? theme.colors.background 
                                    : theme.colors.text,
                                },
                              ]}
                            >
                              {item.title} - {item.artist}
                            </Text>
                            {isSelected && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </View>
                )}

                {selectedTracks.length === 0 && (
                  <Text style={[styles.hintText, { color: theme.colors.secondaryText }]}>
                    Or use your current playlist ({currentPlaylist.length} tracks)
                  </Text>
                )}
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingCassette(null);
                  setSelectedTracks([]);
                  setShowTrackSelector(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={
                  editingCassette ? handleUpdateCassette : handleCreateCassette
                }
              >
                <Text style={styles.saveButtonText}>
                  {editingCassette ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  cassetteWrapper: {
    position: "relative",
  },
  deleteButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  deleteButtonText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#00F5FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00F5FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#00D4E6",
  },
  fabText: {
    color: "#000",
    fontSize: 32,
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "#00F5FF",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#444",
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#00F5FF",
    borderWidth: 1,
    borderColor: "#00D4E6",
  },
  saveButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  selectTracksButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  selectTracksButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
  trackSelectorContainer: {
    maxHeight: 200,
    marginTop: 12,
    marginBottom: 12,
  },
  trackSelectorTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  trackList: {
    maxHeight: 150,
  },
  trackItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  trackItemText: {
    fontSize: 14,
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    color: "#00F5FF",
    fontWeight: "bold",
  },
  hintText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});
