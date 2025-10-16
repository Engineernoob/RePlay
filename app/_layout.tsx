import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { WalkmanTheme } from "@/constants/walkman-theme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Switch theme based on system mode or force Walkman style
  const theme = colorScheme === "dark" ? WalkmanTheme : WalkmanTheme;

  return (
    <ThemeProvider value={theme}>
      <Stack>
        {/* Main tabbed layout */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modal route (optional) */}
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>

      {/* Walkman amber LED status bar */}
      <StatusBar style="light" backgroundColor="#0C2233" />
    </ThemeProvider>
  );
}
