/**
 * Core type definitions for Sóng library
 */

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface ExtractorOptions {
  /**
   * Canvas size for color analysis (default: 150)
   */
  canvasSize?: number;

  /**
   * Pixel sampling rate - lower means more samples (default: 32)
   */
  sampleRate?: number;

  /**
   * Color grouping precision - lower means more precise (default: 25)
   */
  precision?: number;

  /**
   * Maximum colors to extract before filtering (default: 8)
   */
  maxColors?: number;
}

interface WaveConfig {
  /**
   * CSS gradient direction (default: 'to bottom right')
   */
  direction?: string;

  /**
   * CSS transition for smooth changes (default: 'all 1.5s ease-out')
   */
  transition?: string;

  /**
   * Colors used when extraction fails
   */
  fallbackColors?: string[];

  /**
   * Number of colors to return (default: 2)
   */
  colorCount?: number;

  /**
   * How quickly colors change
   */
  flowSpeed?: "slow" | "medium" | "fast";

  /**
   * Wave intensity/contrast
   */
  intensity?: "gentle" | "medium" | "energetic";

  /**
   * Type of gradient waves
   */
  waveType?: "linear" | "radial" | "conic";
}

interface WaveResult {
  /**
   * Extracted wave colors in hex format
   */
  colors: string[];

  /**
   * Complete CSS gradient string
   */
  css: string;

  /**
   * RGB color objects
   */
  rgb: ColorRGB[];

  /**
   * Detected intensity level
   */
  intensity: string;

  /**
   * Color harmony score (0-1)
   */
  harmony: number;

  /**
   * Detected mood from colors
   */
  mood: string;

  /**
   * Whether extraction succeeded
   */
  isFlowing: boolean;

  /**
   * Error message if failed
   */
  error?: string;
}

interface QuickWaveOptions {
  /**
   * Wave direction
   */
  direction?: string;

  /**
   * Transition timing
   */
  transition?: string;

  /**
   * Wave intensity
   */
  intensity?: "gentle" | "medium" | "energetic";
}

export { ColorRGB, ExtractorOptions, WaveConfig, WaveResult, QuickWaveOptions };
