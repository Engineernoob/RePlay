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
    title: "On my Mama",
    artist: "Victoria Monét",
    file: require("@/assets/mp3s/OnMyMama.mp3"),
    cover: require("@/assets/images/covers/VictoriaMonèt.png"),
  },
  {
    id: "2",
    title: "Timeless",
    artist: "The Weeknd feat Playboy Carti",
    file: require("@/assets/mp3s/Timeless.mp3"),
    cover: require("@/assets/images/covers/Timeless.png"),
  },
  {
    id: "3",
    title: "Paint the Town Red",
    artist: "Doja Cat",
    file: require("@/assets/mp3s/PainttheTownRed.mp3"),
    cover: require("@/assets/images/covers/Paint-The-Town-Red.png"),
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
