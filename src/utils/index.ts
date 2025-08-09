import { ColorRGB } from "../types/index";

/**
 * Utility functions for Sóng library
 */

/**
 * Convert RGB color to hex string
 */
export function rgbToHex(rgb: ColorRGB): string {
  const toHex = (n: number): string => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.padStart(2, "0");
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert hex string to RGB object
 */
export function hexToRgb(hex: string): ColorRGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate brightness of a color using luminance formula
 */
export function calculateBrightness(color: ColorRGB): number {
  return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
}

/**
 * Calculate color difference between two RGB colors
 */
export function calculateColorDifference(
  color1: ColorRGB,
  color2: ColorRGB
): number {
  return (
    Math.abs(color1.r - color2.r) +
    Math.abs(color1.g - color2.g) +
    Math.abs(color1.b - color2.b)
  );
}

/**
 * Check if a color is unique among existing colors
 */
export function isColorUnique(
  color: ColorRGB,
  existingColors: ColorRGB[],
  threshold: number = 80
): boolean {
  return !existingColors.some(
    (existing) => calculateColorDifference(color, existing) < threshold
  );
}

/**
 * Analyze color mood based on HSL values
 */
export function analyzeColorMood(colors: ColorRGB[]): string {
  if (colors.length === 0) return "neutral";

  let totalSaturation = 0;
  let totalBrightness = 0;

  colors.forEach((color) => {
    const brightness = calculateBrightness(color);
    // Simple saturation approximation
    const max = Math.max(color.r, color.g, color.b);
    const min = Math.min(color.r, color.g, color.b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    totalSaturation += saturation;
    totalBrightness += brightness;
  });

  const avgSaturation = totalSaturation / colors.length;
  const avgBrightness = totalBrightness / colors.length;

  if (avgBrightness > 180 && avgSaturation > 0.5) return "energetic";
  if (avgBrightness < 80 && avgSaturation < 0.3) return "calm";
  if (avgSaturation > 0.7) return "vibrant";
  if (avgBrightness > 150) return "bright";
  if (avgBrightness < 100) return "dark";

  return "balanced";
}

/**
 * Calculate harmony score between colors
 */
export function calculateHarmony(colors: ColorRGB[]): number {
  if (colors.length < 2) return 1;

  let harmonyScore = 0;
  let comparisons = 0;

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const diff = calculateColorDifference(colors[i], colors[j]);
      // Ideal difference is around 100-200 for harmony
      const idealDiff = 150;
      const score = 1 - Math.abs(diff - idealDiff) / idealDiff;
      harmonyScore += Math.max(0, score);
      comparisons++;
    }
  }

  return comparisons > 0 ? harmonyScore / comparisons : 1;
}

/**
 * Generate CSS gradient based on wave configuration
 */
export function generateWaveCSS(
  colors: string[],
  direction: string = "to bottom right",
  waveType: string = "linear"
): string {
  if (colors.length < 2) {
    colors = [...colors, "#6B46C1", "#EC4899"].slice(0, 2);
  }

  switch (waveType) {
    case "radial":
      return `radial-gradient(circle, ${colors.join(", ")})`;
    case "conic":
      return `conic-gradient(${colors.join(", ")})`;
    default:
      return `linear-gradient(${direction}, ${colors.join(", ")})`;
  }
}

/**
 * Create fallback colors based on intensity
 */
export function getFallbackColors(intensity: string = "medium"): string[] {
  switch (intensity) {
    case "gentle":
      return ["#E8E3F3", "#F3E8FF"]; // Soft purples
    case "energetic":
      return ["#FF6B6B", "#4ECDC4"]; // Vibrant
    default:
      return ["#6B46C1", "#EC4899"]; // Balanced
  }
}

/**
 * Apply transition timing based on flow speed
 */
export function getTransitionTiming(flowSpeed: string = "medium"): string {
  switch (flowSpeed) {
    case "slow":
      return "all 3s cubic-bezier(0.4, 0, 0.2, 1)";
    case "fast":
      return "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    default:
      return "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
  }
}

/**
 * Detect if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Create a hidden canvas element (browser only)
 */
export function createHiddenCanvas(): HTMLCanvasElement | null {
  if (!isBrowser()) return null;

  const canvas = document.createElement("canvas");
  canvas.style.display = "none";
  document.body.appendChild(canvas);
  return canvas;
}

/**
 * Cleanup canvas element
 */
export function cleanupCanvas(canvas: HTMLCanvasElement | null): void {
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
}
