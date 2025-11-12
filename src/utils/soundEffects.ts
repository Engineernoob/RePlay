import { Audio } from "expo-audio";

/**
 * Sound Effects Manager
 * Handles all audio feedback for Walkman interactions
 */

// Pre-loaded sound effect players
let sfxPlayers: Record<string, any> = {};

/**
 * Initialize sound effects
 * Call this once when the app starts
 */
export async function initializeSoundEffects() {
  try {
    // Try to load sound effects if they exist
    // For now, we'll use haptics as fallback
    // In production, add actual sound files to assets/sfx/
  } catch (error) {
    console.warn("Sound effects initialization failed:", error);
  }
}

/**
 * Play a sound effect
 */
export async function playSoundEffect(name: "insert" | "eject" | "click" | "rewind" | "fastforward"): Promise<void> {
  try {
    // Use haptics as primary feedback since sound files may not exist
    const Haptics = await import("expo-haptics");
    
    switch (name) {
      case "insert":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Double tap for insert feel
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }, 100);
        break;
      case "eject":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "click":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "rewind":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "fastforward":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } catch (error) {
    // Silently fail - haptics not critical
    console.warn(`Sound effect ${name} failed:`, error);
  }
}

/**
 * Cleanup sound effects
 */
export function cleanupSoundEffects() {
  // Cleanup if needed
}

