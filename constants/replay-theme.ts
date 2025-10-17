import { Theme } from "@react-navigation/native";

// 🎧 Extend React Navigation's Theme with Walkman-specific tokens
export interface ReplayThemeType extends Theme {
  colors: Theme["colors"] & {
    secondaryText: string;
    success: string;
    warning: string;
    lcdCyan: string;
  };
  fonts: Theme["fonts"] & {
    display: {
      fontFamily: string;
      fontWeight: string;
    };
  };
  shadows: {
    glow: string;
    deckDepth: string;
    ledGlow: string;
  };
  meta: {
    name: string;
    version: string;
    mood: string;
  };
}

// 🎨 The Walkman Theme — tuned for retro-digital warmth
export const ReplayTheme: ReplayThemeType = {
  dark: true,

  colors: {
    // Base palette
    primary: "#FFDD57", // Amber LED display
    background: "#0C2233", // Deep Walkman navy
    card: "#151A1E", // Matte deck casing
    border: "#2A3036", // Brushed metal trim
    text: "#E5E5E5", // Main label text
    notification: "#FF3B30", // Record/Stop LED red

    // Extended tones
    secondaryText: "#B8C2CC", // Subtitle / labels
    success: "#4CAF50", // Play indicator
    warning: "#FFB74D", // Dolby/Bass LED
    lcdCyan: "#00FFFF", // LCD digital glow
  },

  fonts: {
    regular: {
      fontFamily: "Dank Mono, monospace",
      fontWeight: "400",
    },
    medium: {
      fontFamily: "Dank Mono, monospace",
      fontWeight: "500",
    },
    bold: {
      fontFamily: "Dank Mono, monospace",
      fontWeight: "700",
    },
    heavy: {
      fontFamily: "Dank Mono, monospace",
      fontWeight: "700",
    },
    display: {
      fontFamily: "Digital", // LCD display font
      fontWeight: "700",
    },
  },

  // Depth & glow layers for realism
  shadows: {
    glow: "0 0 15px rgba(255, 221, 87, 0.3)",
    deckDepth: "0 6px 14px rgba(0, 0, 0, 0.6)",
    ledGlow: "0 0 12px rgba(255, 59, 48, 0.8)",
  },

  // Metadata for styling consistency or display
  meta: {
    name: "Sony Walkman WM-DD90",
    version: "1.0",
    mood: "Retro Analog Digital",
  },
};
