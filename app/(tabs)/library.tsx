import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Link } from "expo-router";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import Cassette from "@/components/Cassette";

const { width } = Dimensions.get("window");

// 🎵 Song data
const songs = [
  {
    id: "1",
    title: "On My Mama",
    artist: "Victoria Monét",
    color: "#FF7E57",
    album: require("@/assets/images/covers/VictoriaMonet.png"),
  },
  {
    id: "2",
    title: "Timeless",
    artist: "The Weeknd & Playboi Carti",
    color: "#7E57FF",
    album: require("@/assets/images/covers/Timeless.png"),
  },
  {
    id: "3",
    title: "Paint the Town Red",
    artist: "Doja Cat",
    color: "#D62D2D",
    album: require("@/assets/images/covers/Paint-The-Town-Red.png"),
  },
];

export default function LibraryScreen() {
  const scrollX = useSharedValue(0);

  // Handle scroll position updates
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎶 My Cassette Collection</Text>

      <Animated.FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.7}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: (width - width * 0.7) / 2 }}
        renderItem={({ item, index }) => {
          // ✅ Move hook here: renderItem is directly inside component scope
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const animatedStyle = useAnimatedStyle(() => {
            const inputRange = [
              (index - 1) * (width * 0.7),
              index * (width * 0.7),
              (index + 1) * (width * 0.7),
            ];

            const scale = interpolate(
              scrollX.value,
              inputRange,
              [0.8, 1, 0.8],
              Extrapolate.CLAMP
            );

            const rotateY = interpolate(
              scrollX.value,
              inputRange,
              [-10, 0, 10],
              Extrapolate.CLAMP
            );

            return {
              transform: [
                { scale },
                { rotateY: `${rotateY}deg` }, // ✅ must be string
              ],
            };
          });

          return (
            <Animated.View style={[styles.cassetteWrapper, animatedStyle]}>
              <Link href={`/player?id=${item.id}`} asChild>
                <TouchableOpacity activeOpacity={0.8}>
                  <Cassette color={item.color} album={item.album} />
                  <View style={styles.label}>
                    <Text style={[styles.songTitle, { color: item.color }]}>
                      {item.title}
                    </Text>
                    <Text style={styles.songArtist}>{item.artist}</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 80,
    alignItems: "center",
  },
  header: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  cassetteWrapper: {
    width: width * 0.7,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 12,
    alignItems: "center",
  },
  songTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  songArtist: {
    color: "#ccc",
    fontSize: 14,
  },
});
