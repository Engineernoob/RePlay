import React from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";

const songs = [
  {
    id: "1",
    title: "Midnight City",
    artist: "M83",
    file: require("@/assets/mp3s/midnight.mp3"),
    cover: require("@/assets/images/tape1.png"),
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    file: require("@/assets/mp3s/blinding.mp3"),
    cover: require("@/assets/images/tape2.png"),
  },
  {
    id: "3",
    title: "Dreams",
    artist: "Fleetwood Mac",
    file: require("@/assets/mp3s/dreams.mp3"),
    cover: require("@/assets/images/tape3.png"),
  },
];

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 My Cassette Library</Text>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-around" }}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/player",
              params: { id: item.id, title: item.title },
            }}
            asChild
          >
            <TouchableOpacity style={styles.cassetteCard}>
              <Image source={item.cover} style={styles.cassetteImage} />
              <Text style={styles.cassetteTitle}>{item.title}</Text>
              <Text style={styles.cassetteArtist}>{item.artist}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", paddingTop: 60 },
  title: {
    color: "#FFDD57",
    fontSize: 26,
    textAlign: "center",
    marginBottom: 20,
  },
  cassetteCard: {
    alignItems: "center",
    marginVertical: 15,
  },
  cassetteImage: {
    width: 150,
    height: 100,
    resizeMode: "contain",
    marginBottom: 8,
  },
  cassetteTitle: { color: "#FFF", fontWeight: "600", fontSize: 16 },
  cassetteArtist: { color: "#aaa", fontSize: 12 },
});
