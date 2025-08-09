import { ExtractorOptions, WaveConfig, WaveResult } from "../types";
import { ColorExtractor } from "./color-extractor";
import { WaveGenerator } from "./wave-extractor";
import {
  rgbToHex,
  analyzeColorMood,
  calculateHarmony,
  isBrowser,
} from "../utils";

/**
 * Song - Main class for the Sóng library
 * Creates flowing wave gradients from images like gentle waves on water
 */
export class Song {
  private extractor: ColorExtractor;
  private generator: WaveGenerator;
  private cache: Map<string, string[]>;

  constructor(
    extractorOptions: ExtractorOptions = {},
    waveConfig: WaveConfig = {}
  ) {
    this.extractor = new ColorExtractor(extractorOptions);
    this.generator = new WaveGenerator(waveConfig);
    this.cache = new Map();
  }

  /**
   * Main method: Create flowing waves from an image
   */
  async createWaves(
    imageSource: string | HTMLImageElement,
    element?: HTMLElement
  ): Promise<WaveResult> {
    try {
      // Check cache first
      const cacheKey =
        typeof imageSource === "string" ? imageSource : imageSource.src;
      if (this.cache.has(cacheKey)) {
        const cachedColors = this.cache.get(cacheKey)!;
        const result = this.buildWaveResult(cachedColors, true);

        if (element) {
          this.generator.applyToElement(element, cachedColors);
        }

        return result;
      }

      // Extract colors from image
      const rgbColors = await this.extractor.extractColors(imageSource, 2);
      const hexColors = rgbColors.map((rgb) => rgbToHex(rgb));

      // Cache the result
      this.cache.set(cacheKey, hexColors);

      // Apply to element if provided
      if (element) {
        this.generator.applyToElement(element, hexColors);
      }

      return this.buildWaveResult(hexColors, true, rgbColors);
    } catch (error) {
      // Handle errors gracefully with fallback
      const fallbackColors = this.generator.getConfig().fallbackColors;

      if (element) {
        this.generator.applyToElement(element, fallbackColors);
      }

      return this.buildWaveResult(
        fallbackColors,
        false,
        undefined,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * Apply waves to multiple elements
   */
  async flowToElements(
    imageSource: string | HTMLImageElement,
    elements: HTMLElement[]
  ): Promise<WaveResult> {
    const result = await this.createWaves(imageSource);

    if (isBrowser()) {
      this.generator.applyToElements(elements, result.colors);
    }

    return result;
  }

  /**
   * Generate CSS custom properties for waves
   */
  async generateWaveCSS(
    imageSource: string | HTMLImageElement,
    prefix: string = "song"
  ): Promise<Record<string, string>> {
    const result = await this.createWaves(imageSource);
    return this.generator.generateCSSVariables(result.colors, prefix);
  }

  /**
   * Apply CSS variables to document root
   */
  async applyGlobalWaves(
    imageSource: string | HTMLImageElement,
    prefix: string = "song"
  ): Promise<WaveResult> {
    const result = await this.createWaves(imageSource);

    if (isBrowser()) {
      this.generator.applyCSSVariables(result.colors, prefix);
    }

    return result;
  }

  /**
   * Enable flowing wave animation on element
   */
  enableFlowAnimation(element: HTMLElement, duration: string = "15s"): void {
    if (isBrowser()) {
      this.generator.enableWaveAnimation(element, duration);
    }
  }

  /**
   * Disable wave animation on element
   */
  disableFlowAnimation(element: HTMLElement): void {
    if (isBrowser()) {
      this.generator.disableWaveAnimation(element);
    }
  }

  /**
   * Update extractor options
   */
  updateExtractorOptions(options: Partial<ExtractorOptions>): void {
    this.extractor.updateOptions(options);
    this.clearCache(); // Clear cache when options change
  }

  /**
   * Update wave configuration
   */
  updateWaveConfig(config: Partial<WaveConfig>): void {
    this.generator.updateConfig(config);
  }

  /**
   * Get current extractor options
   */
  getExtractorOptions(): Required<ExtractorOptions> {
    return this.extractor.getOptions();
  }

  /**
   * Get current wave configuration
   */
  getWaveConfig(): Required<WaveConfig> {
    return this.generator.getConfig();
  }

  /**
   * Clear the color cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Preload colors for an image (useful for performance)
   */
  async preloadColors(
    imageSource: string | HTMLImageElement
  ): Promise<string[]> {
    const result = await this.createWaves(imageSource);
    return result.colors;
  }

  /**
   * Destroy the Song instance and cleanup resources
   */
  destroy(): void {
    this.extractor.destroy();
    this.clearCache();
  }

  /**
   * Build a complete WaveResult object
   */
  private buildWaveResult(
    colors: string[],
    isFlowing: boolean,
    rgb?: import("../types").ColorRGB[],
    error?: string
  ): WaveResult {
    const rgbColors =
      rgb ||
      colors.map((hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 107, g: 70, b: 193 };
      });

    const mood = analyzeColorMood(rgbColors);
    const harmony = calculateHarmony(rgbColors);
    const css = this.generator.generateCSS(colors);

    // Detect intensity based on colors
    const avgBrightness =
      rgbColors.reduce(
        (sum, color) =>
          sum + (0.299 * color.r + 0.587 * color.g + 0.114 * color.b),
        0
      ) / rgbColors.length;

    let detectedIntensity = "medium";
    if (avgBrightness > 180) detectedIntensity = "energetic";
    else if (avgBrightness < 100) detectedIntensity = "gentle";

    return {
      colors,
      css,
      rgb: rgbColors,
      intensity: detectedIntensity,
      harmony,
      mood,
      isFlowing,
      error,
    };
  }
}
