import { WaveConfig } from "../types";
import {
  generateWaveCSS,
  getFallbackColors,
  getTransitionTiming,
  isBrowser,
} from "../utils";

/**
 * WaveGenerator - Creates flowing gradients and applies them to elements
 * Handles the visual wave effects of Sóng
 */
export class WaveGenerator {
  private config: Required<WaveConfig>;

  constructor(config: WaveConfig = {}) {
    this.config = {
      direction: "to bottom right",
      transition: "all 1.5s ease-out",
      fallbackColors: ["#6B46C1", "#EC4899"],
      colorCount: 2,
      flowSpeed: "medium",
      intensity: "medium",
      waveType: "linear",
      ...config,
    };

    // Update transition timing based on flow speed
    if (!config.transition) {
      this.config.transition = getTransitionTiming(this.config.flowSpeed);
    }

    // Update fallback colors based on intensity
    if (!config.fallbackColors) {
      this.config.fallbackColors = getFallbackColors(this.config.intensity);
    }
  }

  /**
   * Generate CSS gradient string from colors
   */
  generateCSS(colors: string[]): string {
    const waveColors = this.ensureMinimumColors(colors);
    return generateWaveCSS(
      waveColors,
      this.config.direction,
      this.config.waveType
    );
  }

  /**
   * Apply wave gradient to a single element
   */
  applyToElement(element: HTMLElement, colors: string[]): void {
    if (!isBrowser()) {
      console.warn("Sóng: Cannot apply waves in non-browser environment");
      return;
    }

    const gradient = this.generateCSS(colors);
    element.style.background = gradient;
    element.style.transition = this.config.transition;

    // Add wave-specific styling
    this.addWaveEffects(element);
  }

  /**
   * Apply wave gradient to multiple elements
   */
  applyToElements(elements: HTMLElement[], colors: string[]): void {
    if (!isBrowser()) {
      console.warn("Sóng: Cannot apply waves in non-browser environment");
      return;
    }

    elements.forEach((element) => this.applyToElement(element, colors));
  }

  /**
   * Generate CSS custom properties for wave effects
   */
  generateCSSVariables(
    colors: string[],
    prefix: string = "wave"
  ): Record<string, string> {
    const waveColors = this.ensureMinimumColors(colors);
    const css = this.generateCSS(waveColors);

    const variables: Record<string, string> = {
      [`--${prefix}-css`]: css,
      [`--${prefix}-transition`]: this.config.transition,
      [`--${prefix}-direction`]: this.config.direction,
      [`--${prefix}-type`]: this.config.waveType,
    };

    // Add individual color variables
    waveColors.forEach((color, index) => {
      variables[`--${prefix}-color-${index + 1}`] = color;
    });

    return variables;
  }

  /**
   * Apply CSS variables to document root
   */
  applyCSSVariables(colors: string[], prefix: string = "wave"): void {
    if (!isBrowser()) return;

    const variables = this.generateCSSVariables(colors, prefix);

    Object.entries(variables).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }

  /**
   * Create wave animation keyframes
   */
  createWaveAnimation(name: string = "songWave"): string {
    return `
      @keyframes ${name} {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
  }

  /**
   * Enable wave animation on element
   */
  enableWaveAnimation(element: HTMLElement, duration: string = "10s"): void {
    if (!isBrowser()) return;

    // Inject animation keyframes if not already present
    if (!document.querySelector("#song-wave-animation")) {
      const style = document.createElement("style");
      style.id = "song-wave-animation";
      style.textContent = this.createWaveAnimation();
      document.head.appendChild(style);
    }

    // Apply animation
    element.style.backgroundSize = "200% 200%";
    element.style.animation = `songWave ${duration} ease-in-out infinite`;
  }

  /**
   * Disable wave animation on element
   */
  disableWaveAnimation(element: HTMLElement): void {
    if (!isBrowser()) return;

    element.style.animation = "";
    element.style.backgroundSize = "";
  }

  /**
   * Get current wave configuration
   */
  getConfig(): Required<WaveConfig> {
    return { ...this.config };
  }

  /**
   * Update wave configuration
   */
  updateConfig(newConfig: Partial<WaveConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update dependent properties
    if (newConfig.flowSpeed && !newConfig.transition) {
      this.config.transition = getTransitionTiming(newConfig.flowSpeed);
    }

    if (newConfig.intensity && !newConfig.fallbackColors) {
      this.config.fallbackColors = getFallbackColors(newConfig.intensity);
    }
  }

  /**
   * Ensure minimum number of colors with fallbacks
   */
  private ensureMinimumColors(colors: string[]): string[] {
    if (colors.length >= this.config.colorCount) {
      return colors.slice(0, this.config.colorCount);
    }

    const result = [...colors];
    const fallbacks = [...this.config.fallbackColors];

    while (result.length < this.config.colorCount && fallbacks.length > 0) {
      result.push(fallbacks.shift()!);
    }

    return result.slice(0, this.config.colorCount);
  }

  /**
   * Add wave-specific visual effects to element
   */
  private addWaveEffects(element: HTMLElement): void {
    // Add subtle wave properties based on intensity
    switch (this.config.intensity) {
      case "gentle":
        element.style.opacity = "0.8";
        break;
      case "energetic":
        element.style.filter = "saturate(1.2)";
        break;
      default:
        // medium - no additional effects
        break;
    }

    // Add wave type specific effects
    if (this.config.waveType === "radial") {
      element.style.backgroundSize = "150% 150%";
    }
  }
}
