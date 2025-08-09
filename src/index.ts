/**
 * Sóng - Vietnamese for "waves"
 * Create flowing gradient backgrounds from images
 *
 * @author Your Name
 * @version 1.0.0
 * @license MIT
 */

// Export types
export type {
  ColorRGB,
  ExtractorOptions,
  WaveConfig,
  WaveResult,
  QuickWaveOptions,
} from "./types";

// Export core classes
export { ColorExtractor, WaveGenerator, Song } from "./core";

// Export utilities
export {
  rgbToHex,
  hexToRgb,
  calculateBrightness,
  calculateColorDifference,
  isColorUnique,
  analyzeColorMood,
  calculateHarmony,
  generateWaveCSS,
  getFallbackColors,
  getTransitionTiming,
  isBrowser,
} from "./utils";

// Import dependencies
import { Song } from "./core";
import { QuickWaveOptions } from "./types";
import { isBrowser } from "./utils";

/**
 * Quick setup function for simple use cases
 * Perfect for music players and lock screens
 */
export async function createWave(
  imageSource: string | HTMLImageElement,
  targetElement: HTMLElement | string,
  options: QuickWaveOptions = {}
): Promise<import("./types").WaveResult> {
  // Find target element
  const element =
    typeof targetElement === "string"
      ? isBrowser()
        ? (document.querySelector(targetElement) as HTMLElement)
        : null
      : targetElement;

  if (!element) {
    throw new Error("Sóng: Target element not found");
  }

  // Create Song instance with options
  const song = new Song(
    {},
    {
      direction: options.direction || "to bottom",
      transition: options.transition || "all 2s ease-out",
      intensity: options.intensity || "medium",
    }
  );

  try {
    const result = await song.createWaves(imageSource, element);
    return result;
  } finally {
    // Cleanup (but keep cache for performance)
    // song.destroy(); // Don't destroy immediately for better UX
  }
}

/**
 * Auto-detect and apply gradients to elements with data attributes
 * Perfect for zero-JavaScript setup
 */
export function autoInitialize(): void {
  if (!isBrowser()) return;

  document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll("[data-song-waves]");

    elements.forEach(async (element) => {
      const htmlElement = element as HTMLElement;
      const imageSource = htmlElement.dataset.songWaves;
      const direction = htmlElement.dataset.waveDirection || "to bottom right";
      const transition =
        htmlElement.dataset.waveTransition || "all 2s ease-out";
      const intensity =
        (htmlElement.dataset.waveIntensity as
          | "gentle"
          | "medium"
          | "energetic") || "medium";

      if (imageSource) {
        try {
          await createWave(imageSource, htmlElement, {
            direction,
            transition,
            intensity,
          });
        } catch (error) {
          console.error("Sóng auto-init failed:", error);
        }
      }
    });
  });
}

/**
 * Create a song instance for music players
 * Optimized for album artwork and audio visualization
 */
export function createMusicWaves(
  options: {
    extractorOptions?: import("./types").ExtractorOptions;
    waveConfig?: import("./types").WaveConfig;
  } = {}
): Song {
  return new Song(
    {
      canvasSize: 150,
      sampleRate: 32,
      precision: 25,
      ...options.extractorOptions,
    },
    {
      direction: "to bottom",
      transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
      flowSpeed: "medium",
      intensity: "medium",
      waveType: "linear",
      ...options.waveConfig,
    }
  );
}

/**
 * Create a song instance optimized for lock screens
 * Gentle, flowing waves perfect for mobile interfaces
 */
export function createLockScreenWaves(
  options: {
    extractorOptions?: import("./types").ExtractorOptions;
    waveConfig?: import("./types").WaveConfig;
  } = {}
): Song {
  return new Song(
    {
      canvasSize: 120, // Smaller for better mobile performance
      sampleRate: 40,
      ...options.extractorOptions,
    },
    {
      direction: "to bottom",
      transition: "all 3s ease-in-out",
      flowSpeed: "slow",
      intensity: "gentle",
      waveType: "linear",
      ...options.waveConfig,
    }
  );
}

// Auto-initialize if enabled
if (isBrowser() && (window as any).SONG_AUTO_INIT) {
  autoInitialize();
}

// Browser globals for script tag usage
if (isBrowser()) {
  (window as any).Song = {
    Song,
    ColorExtractor: import("./core").then((m) => m.ColorExtractor),
    WaveGenerator: import("./core").then((m) => m.WaveGenerator),
    createWave,
    createMusicWaves,
    createLockScreenWaves,
    autoInitialize,
  };
}

// Default export
export default Song;
