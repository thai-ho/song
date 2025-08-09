import { ColorRGB, ExtractorOptions } from "../types";
import {
  calculateBrightness,
  isColorUnique,
  createHiddenCanvas,
  cleanupCanvas,
  isBrowser,
} from "../utils";

/**
 * ColorExtractor - Extracts dominant colors from images
 * Core engine of the Sóng library
 */
export class ColorExtractor {
  private canvas: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null;
  private options: Required<ExtractorOptions>;

  constructor(options: ExtractorOptions = {}) {
    this.options = {
      canvasSize: 150,
      sampleRate: 32,
      precision: 25,
      maxColors: 8,
      ...options,
    };

    // Initialize canvas for browser environment
    if (isBrowser()) {
      this.canvas = createHiddenCanvas();
      this.ctx = this.canvas?.getContext("2d") || null;

      if (!this.ctx) {
        console.warn("Sóng: Canvas 2D context not supported");
      }
    } else {
      this.canvas = null;
      this.ctx = null;
    }
  }

  /**
   * Extract dominant colors from an image source
   */
  async extractColors(
    imageSource: string | HTMLImageElement,
    count: number = 2
  ): Promise<ColorRGB[]> {
    if (!isBrowser() || !this.canvas || !this.ctx) {
      throw new Error(
        "Sóng: ColorExtractor requires browser environment with Canvas support"
      );
    }

    return new Promise((resolve, reject) => {
      const img =
        imageSource instanceof HTMLImageElement ? imageSource : new Image();

      const processImage = () => {
        try {
          if (!this.canvas || !this.ctx) {
            throw new Error("Canvas not available");
          }

          // Setup canvas dimensions
          this.canvas.width = this.options.canvasSize;
          this.canvas.height = this.options.canvasSize;

          // Draw image to canvas
          this.ctx.drawImage(
            img,
            0,
            0,
            this.options.canvasSize,
            this.options.canvasSize
          );

          // Extract pixel data
          const imageData = this.ctx.getImageData(
            0,
            0,
            this.options.canvasSize,
            this.options.canvasSize
          );
          const pixels = imageData.data;

          // Build color frequency map
          const colorMap = this.buildColorFrequencyMap(pixels);

          // Get dominant colors
          const dominantColors = this.getDominantColors(colorMap);

          // Filter and return best colors
          const filteredColors = this.filterColors(dominantColors, count);

          resolve(filteredColors);
        } catch (error) {
          reject(error);
        }
      };

      if (typeof imageSource === "string") {
        img.crossOrigin = "anonymous";
        img.onload = processImage;
        img.onerror = () =>
          reject(new Error(`Failed to load image: ${imageSource}`));
        img.src = imageSource;
      } else {
        processImage();
      }
    });
  }

  /**
   * Build frequency map of colors from pixel data
   */
  private buildColorFrequencyMap(
    pixels: Uint8ClampedArray
  ): Record<string, number> {
    const colorMap: Record<string, number> = {};

    // Sample pixels based on sample rate
    for (let i = 0; i < pixels.length; i += this.options.sampleRate) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const alpha = pixels[i + 3];

      // Skip transparent or nearly transparent pixels
      if (alpha < 100) continue;

      // Group similar colors by reducing precision
      const rGroup =
        Math.floor(r / this.options.precision) * this.options.precision;
      const gGroup =
        Math.floor(g / this.options.precision) * this.options.precision;
      const bGroup =
        Math.floor(b / this.options.precision) * this.options.precision;

      const colorKey = `${rGroup},${gGroup},${bGroup}`;
      colorMap[colorKey] = (colorMap[colorKey] || 0) + 1;
    }

    return colorMap;
  }

  /**
   * Get most frequent colors from color map
   */
  private getDominantColors(colorMap: Record<string, number>): ColorRGB[] {
    return Object.entries(colorMap)
      .sort(([, frequencyA], [, frequencyB]) => frequencyB - frequencyA)
      .slice(0, this.options.maxColors)
      .map(([colorKey]) => {
        const [r, g, b] = colorKey.split(",").map(Number);
        return { r, g, b };
      });
  }

  /**
   * Filter colors based on brightness and uniqueness
   */
  private filterColors(colors: ColorRGB[], targetCount: number): ColorRGB[] {
    const filtered: ColorRGB[] = [];

    for (const color of colors) {
      // Calculate brightness
      const brightness = calculateBrightness(color);

      // Skip colors that are too dark or too light
      if (brightness < 40 || brightness > 200) continue;

      // Check if color is unique enough
      if (isColorUnique(color, filtered, 80)) {
        filtered.push(color);
      }

      // Stop when we have enough colors
      if (filtered.length >= targetCount) break;
    }

    // Ensure we have minimum required colors with fallbacks
    while (filtered.length < targetCount) {
      if (filtered.length === 0) {
        filtered.push({ r: 107, g: 70, b: 193 }); // #6B46C1
      } else {
        filtered.push({ r: 236, g: 72, b: 153 }); // #EC4899
      }
    }

    return filtered.slice(0, targetCount);
  }

  /**
   * Get current extractor options
   */
  getOptions(): Required<ExtractorOptions> {
    return { ...this.options };
  }

  /**
   * Update extractor options
   */
  updateOptions(newOptions: Partial<ExtractorOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.canvas) {
      cleanupCanvas(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
  }
}
