import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useTheme } from "@react-navigation/native";
import type { ReplayThemeType } from "@/constants/replay-theme";
import { AVAILABLE_TRACKS } from "@/src/data/tracks";
import type { Track } from "@/src/types/audio";

const { width } = Dimensions.get("window");

function CassetteCard({
  item,
  onPress,
}: {
  item: Track;
  onPress: () => void;
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
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
          { backgroundColor: item.color, shadowColor: item.color },
        ]}
      >
        <Image source={item.album} style={styles.cover} />
        <View style={styles.textBox}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.artist}>{item.artist}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const theme = useTheme() as ReplayThemeType;

  const openPlayer = (item: Track) => {
    router.push({
      pathname: "/player",
      params: {
        id: item.id,
        title: item.title,
        artist: item.artist,
        color: item.color,
      },
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.header, { color: theme.colors.primary }]}>
        My Cassette Shelf 🎶
      </Text>

      <FlatList
        data={AVAILABLE_TRACKS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <CassetteCard item={item} onPress={() => openPlayer(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No tracks available
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
    alignItems: "center",
    paddingTop: 50,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    width: width * 0.9,
    height: 130,
    borderRadius: 14,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 12,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cover: {
    width: 90,
    height: 90,
    borderRadius: 6,
    marginRight: 15,
  },
  textBox: {
    flexShrink: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  artist: {
    fontSize: 14,
    marginTop: 4,
    color: "#DDD",
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
  },
});
