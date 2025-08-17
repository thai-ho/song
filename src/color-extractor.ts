import { SongColor } from './types';

/**
 * Color extraction utilities using canvas
 */
export class ColorExtractor {
  private static canvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;

  private static getCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    if (!ColorExtractor.canvas) {
      ColorExtractor.canvas = document.createElement('canvas');
      ColorExtractor.ctx = ColorExtractor.canvas.getContext('2d')!;
    }
    return { canvas: ColorExtractor.canvas, ctx: ColorExtractor.ctx };
  }

  /**
   * Extract dominant colors from an HTML element
   */
  static async extractFromElement(element: HTMLElement, colorCount: number = 3): Promise<SongColor[]> {
    // Check if element contains an image
    const img = element.querySelector('img') as HTMLImageElement;
    if (img && img.complete) {
      return this.extractFromImage(img, colorCount);
    }

    // Extract from background image if present
    const computedStyle = window.getComputedStyle(element);
    const backgroundImage = computedStyle.backgroundImage;
    
    if (backgroundImage && backgroundImage !== 'none') {
      const imageUrl = backgroundImage.slice(4, -1).replace(/["']/g, '');
      return this.extractFromImageUrl(imageUrl, colorCount);
    }

    // Extract from element's background color or child elements
    return this.extractFromElementColors(element, colorCount);
  }

  /**
   * Extract colors from an image element
   */
  static async extractFromImage(img: HTMLImageElement, colorCount: number = 3): Promise<SongColor[]> {
    const { canvas, ctx } = this.getCanvas();
    
    // Set canvas size (smaller for performance)
    const size = 100;
    canvas.width = size;
    canvas.height = size;

    // Draw image to canvas
    ctx.drawImage(img, 0, 0, size, size);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, size, size);
    return this.analyzeImageData(imageData, colorCount);
  }

  /**
   * Extract colors from image URL
   */
  static async extractFromImageUrl(url: string, colorCount: number = 3): Promise<SongColor[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          const colors = await this.extractFromImage(img, colorCount);
          resolve(colors);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  /**
   * Extract colors from element's computed styles and child elements
   */
  private static extractFromElementColors(element: HTMLElement, colorCount: number): SongColor[] {
    const colors: SongColor[] = [];
    const computedStyle = window.getComputedStyle(element);
    
    // Get background color
    const bgColor = computedStyle.backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      const color = this.parseColor(bgColor);
      if (color) colors.push(color);
    }

    // Get text color
    const textColor = computedStyle.color;
    if (textColor) {
      const color = this.parseColor(textColor);
      if (color) colors.push(color);
    }

    // If we don't have enough colors, generate complementary ones
    while (colors.length < colorCount) {
      if (colors.length === 0) {
        // Default to a nice purple if no colors found
        colors.push({ r: 147, g: 51, b: 234, hex: '#9333ea' });
      } else {
        // Generate complementary color
        const baseColor = colors[0];
        const complementary = this.generateComplementaryColor(baseColor, colors.length);
        colors.push(complementary);
      }
    }

    return colors.slice(0, colorCount);
  }

  /**
   * Analyze image data to find dominant colors
   */
  private static analyzeImageData(imageData: ImageData, colorCount: number): SongColor[] {
    const data = imageData.data;
    const colorMap = new Map<string, { count: number; r: number; g: number; b: number }>();

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Skip transparent pixels
      if (a < 128) continue;

      // Reduce color precision for grouping
      const reducedR = Math.floor(r / 32) * 32;
      const reducedG = Math.floor(g / 32) * 32;
      const reducedB = Math.floor(b / 32) * 32;

      const key = `${reducedR},${reducedG},${reducedB}`;
      
      if (colorMap.has(key)) {
        colorMap.get(key)!.count++;
      } else {
        colorMap.set(key, { count: 1, r: reducedR, g: reducedG, b: reducedB });
      }
    }

    // Sort by frequency and get top colors
    const sortedColors = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, colorCount);

    return sortedColors.map(color => ({
      r: color.r,
      g: color.g,
      b: color.b,
      hex: this.rgbToHex(color.r, color.g, color.b)
    }));
  }

  /**
   * Parse CSS color string to SongColor
   */
  private static parseColor(colorString: string): SongColor | null {
    const div = document.createElement('div');
    div.style.color = colorString;
    document.body.appendChild(div);
    
    const computedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);

    const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return {
        r,
        g,
        b,
        hex: this.rgbToHex(r, g, b)
      };
    }

    return null;
  }

  /**
   * Generate complementary color
   */
  private static generateComplementaryColor(baseColor: SongColor, index: number): SongColor {
    const hsl = this.rgbToHsl(baseColor.r, baseColor.g, baseColor.b);
    
    // Rotate hue based on index
    const hueShift = (index * 120) % 360;
    const newHue = (hsl.h + hueShift) % 360;
    
    // Vary saturation and lightness slightly
    const newSaturation = Math.max(0.3, Math.min(0.9, hsl.s + (index * 0.1 - 0.2)));
    const newLightness = Math.max(0.2, Math.min(0.8, hsl.l + (index * 0.15 - 0.3)));
    
    const rgb = this.hslToRgb(newHue, newSaturation, newLightness);
    
    return {
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      hex: this.rgbToHex(rgb.r, rgb.g, rgb.b)
    };
  }

  /**
   * Convert RGB to HEX
   */
  private static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Convert RGB to HSL
   */
  private static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }

      h /= 6;
    }

    return { h: h * 360, s, l };
  }

  /**
   * Convert HSL to RGB
   */
  private static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
}
