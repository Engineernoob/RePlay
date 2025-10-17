import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import type { WalkmanThemeType } from "@/constants/walkman-theme";
import Cassette from "@/components/Cassette";
import PlaylistManager from "@/components/PlaylistManager";
import { usePlayerStore } from "@/src/store/playerStore";

const songs = [
  {
    id: "1",
    title: "On My Mama",
    artist: "Victoria Monét",
    album: require("@/assets/images/covers/VictoriaMonet.png"),
    color: "#FF7E57",
  },
  {
    id: "2",
    title: "Timeless",
    artist: "The Weeknd & Playboi Carti",
    album: require("@/assets/images/covers/Timeless.png"),
    color: "#7E57FF",
  },
  {
    id: "3",
    title: "Paint the Town Red",
    artist: "Doja Cat",
    album: require("@/assets/images/covers/Paint-The-Town-Red.png"),
    color: "#D62D2D",
  },
];



function CassetteCard({
  item,
  onPress,
  onAddToPlaylist,
}: {
  item: (typeof songs)[0];
  onPress: () => void;
  onAddToPlaylist: () => void;
}) {
  const rotation = useSharedValue(0);
  const elevation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${rotation.value}deg` },
      { translateY: -elevation.value },
    ],
  }));

  const handlePressIn = () => {
    rotation.value = withSpring(-15, { damping: 8 });
    elevation.value = withSpring(8);
  };

  const handlePressOut = () => {
    rotation.value = withTiming(0, { duration: 200 });
    elevation.value = withTiming(0, { duration: 200 });
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      onLongPress={onAddToPlaylist}
      delayLongPress={500}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
        ]}
      >
        <Cassette
          color={item.color}
          album={item.album}
          title={item.title}
          artist={item.artist}
          sharedTransitionTag={`cassette-${item.id}`}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const theme = useTheme() as WalkmanThemeType;
  const { playlist, addToPlaylist, loadPlaylist } = usePlayerStore();
  const [showPlaylist, setShowPlaylist] = useState(false);

  const openPlayer = (id: string) => {
    router.push(`/player?id=${id}`);
  };

  const addTrackToPlaylist = (track: any) => {
    const isAlreadyInPlaylist = playlist.some((t: any) => t.id === track.id);
    
    if (isAlreadyInPlaylist) {
      Alert.alert(
        "Already in Playlist",
        "This track is already in your playlist!",
        [{ text: "OK" }]
      );
      return;
    }

    addToPlaylist(track);
    Alert.alert(
      "Added to Playlist",
      `${track.title} has been added to your playlist.`,
      [
        { text: "Keep Browsing", style: "cancel" },
        { 
          text: "View Playlist", 
          onPress: () => setShowPlaylist(true) 
        },
      ]
    );
  };

  const addAllToPlaylist = () => {
    Alert.alert(
      "Add All Tracks",
      "Add all tracks to your current playlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add All",
          onPress: () => {
            loadPlaylist(songs);
            Alert.alert(
              "Playlist Updated",
              "All tracks have been added to your playlist.",
              [
                { text: "OK" },
                { 
                  text: "View Playlist", 
                  onPress: () => setShowPlaylist(true) 
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerSection}>
        <Text style={[styles.header, { color: theme.colors.primary }]}>
          My Cassette Shelf 🎶
        </Text>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, styles.playlistButton]}
            onPress={() => setShowPlaylist(true)}
          >
            <Text style={styles.headerButtonText}>
              🎧 Playlist ({playlist.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.headerButton, styles.addAllButton]}
            onPress={addAllToPlaylist}
          >
            <Text style={styles.headerButtonText}>
              ➕ Add All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <CassetteCard 
            item={item} 
            onPress={() => openPlayer(item.id)}
            onAddToPlaylist={() => addTrackToPlaylist(item)}
          />
        )}
      />

      <PlaylistManager
        visible={showPlaylist}
        onClose={() => setShowPlaylist(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  playlistButton: {
    backgroundColor: "#007AFF",
    borderColor: "#0056CC",
  },
  addAllButton: {
    backgroundColor: "#34C759",
    borderColor: "#28A745",
  },
  headerButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

