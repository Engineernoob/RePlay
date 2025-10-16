import { Theme } from "@react-navigation/native";

export const WalkmanTheme: Theme = {
  dark: true,
  colors: {
    primary: "#FFDD57", // amber LED glow
    background: "#0C2233", // Walkman navy
    card: "#1D1F22", // deck casing
    text: "#E0E0E0", // label text
    border: "#2F353A", // metallic divider
    notification: "#FF6B6B", // red button glow
  },
  fonts: {
    regular: {
      fontFamily: "Dank Mono, monospace",
      fontWeight: "bold",
    },
    medium: {
      fontFamily: "Dank Mono, monospace",
      fontWeight: "bold",
    },
    bold: {
      fontFamily: "Dank Mono, monospace",
      fontWeight: "bold",
    },
    heavy: {
      fontFamily: "",
      fontWeight: "bold",
    },
  },
};
