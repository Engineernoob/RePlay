import { Tabs } from 'expo-router';
import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#D62D2D",
        tabBarInactiveTintColor: "#666",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#2A2A2A",
          borderTopWidth: 2,
          borderTopColor: "#333",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          fontFamily: "monospace",
          letterSpacing: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'PLAYER',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color, opacity: focused ? 1 : 0.6 }]}>▶</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'EXPLORE',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color, opacity: focused ? 1 : 0.6 }]}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'LIBRARY',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color, opacity: focused ? 1 : 0.6 }]}>📼</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
