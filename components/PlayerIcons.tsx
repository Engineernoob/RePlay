import React from "react";
import { View, StyleSheet } from "react-native";

interface IconProps {
  size?: number;
  color?: string;
}

// Previous/Rewind: Vertical bar + Left triangle
export function SkipBackwardIcon({ size = 24, color = "#000" }: IconProps) {
  const barWidth = size * 0.15;
  const barHeight = size * 0.7;
  const triangleSize = size * 0.5;
  
  return (
    <View style={[styles.iconContainer, { width: size * 1.2, height: size }]}>
      <View style={[styles.verticalBar, { 
        width: barWidth, 
        height: barHeight, 
        backgroundColor: color,
        borderRadius: 1,
      }]} />
      <View
        style={[
          styles.triangleLeft,
          {
            width: 0,
            height: 0,
            borderLeftWidth: triangleSize * 0.6,
            borderTopWidth: triangleSize * 0.35,
            borderBottomWidth: triangleSize * 0.35,
            borderLeftColor: color,
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
            borderRightColor: "transparent",
          },
        ]}
      />
    </View>
  );
}

// Stop: Square
export function StopIcon({ size = 24, color = "#000" }: IconProps) {
  return (
    <View
      style={[
        styles.stopSquare,
        {
          width: size * 0.7,
          height: size * 0.7,
          backgroundColor: color,
        },
      ]}
    />
  );
}

// Play: Right triangle
export function PlayIcon({ size = 24, color = "#000" }: IconProps) {
  const triangleSize = size * 0.7;
  
  return (
    <View
      style={[
        styles.triangleRight,
        {
          width: 0,
          height: 0,
          borderLeftWidth: triangleSize * 0.7,
          borderTopWidth: triangleSize * 0.4,
          borderBottomWidth: triangleSize * 0.4,
          borderLeftColor: color,
          borderTopColor: "transparent",
          borderBottomColor: "transparent",
          borderRightColor: "transparent",
        },
      ]}
    />
  );
}

// Pause: Two vertical bars
export function PauseIcon({ size = 24, color = "#000" }: IconProps) {
  const barWidth = size * 0.15;
  const barHeight = size * 0.7;
  const gap = size * 0.2;

  return (
    <View style={[styles.iconContainer, { width: barWidth * 2 + gap, height: size }]}>
      <View
        style={[
          styles.verticalBar,
          {
            width: barWidth,
            height: barHeight,
            backgroundColor: color,
            borderRadius: 1,
          },
        ]}
      />
      <View
        style={[
          styles.verticalBar,
          {
            width: barWidth,
            height: barHeight,
            backgroundColor: color,
            borderRadius: 1,
          },
        ]}
      />
    </View>
  );
}

// Next/Fast Forward: Right triangle + Vertical bar
export function SkipForwardIcon({ size = 24, color = "#000" }: IconProps) {
  const barWidth = size * 0.15;
  const barHeight = size * 0.7;
  const triangleSize = size * 0.5;
  
  return (
    <View style={[styles.iconContainer, { width: size * 1.2, height: size }]}>
      <View
        style={[
          styles.triangleRight,
          {
            width: 0,
            height: 0,
            borderLeftWidth: triangleSize * 0.6,
            borderTopWidth: triangleSize * 0.35,
            borderBottomWidth: triangleSize * 0.35,
            borderLeftColor: color,
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
            borderRightColor: "transparent",
          },
        ]}
      />
      <View style={[styles.verticalBar, { 
        width: barWidth, 
        height: barHeight, 
        backgroundColor: color,
        borderRadius: 1,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  verticalBar: {
    // Width and height set inline
  },
  stopSquare: {
    // Size set inline
  },
  triangleLeft: {
    // All properties set inline for triangles
  },
  triangleRight: {
    // All properties set inline for triangles
  },
});

