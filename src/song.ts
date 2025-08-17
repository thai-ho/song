import { SongOptions, SongInstance, SongColor } from './types';
import { ColorExtractor } from './color-extractor';
import { WaveGenerator } from './wave-generator';

/**
 * Main Sóng class for creating dynamic wave backdrops
 */
export class Song implements SongInstance {
  private options: Required<SongOptions>;
  private currentColors: SongColor[] = [];
  private backdropElement: HTMLElement | null = null;
  private waveGenerator: WaveGenerator | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private isDestroyed = false;

  constructor(options: SongOptions) {
    this.options = this.mergeDefaultOptions(options);
    this.init();
  }

  /**
   * Merge user options with defaults
   */
  private mergeDefaultOptions(options: SongOptions): Required<SongOptions> {
    return {
      targetElementId: options.targetElementId,
      backdropContainerId: options.backdropContainerId || 'body',
      colorCount: options.colorCount || 3,
      waveIntensity: options.waveIntensity || 0.7,
      animationDuration: options.animationDuration || 20,
      autoUpdate: options.autoUpdate !== false,
      backdropClass: options.backdropClass || '',
      blurIntensity: options.blurIntensity || 8,
      backdropOpacity: options.backdropOpacity || 0.8
    };
  }

  /**
   * Initialize Sóng
   */
  private async init(): Promise<void> {
    try {
      await this.createBackdrop();
      await this.update();
      this.setupObservers();
    } catch (error) {
      console.error('Sóng initialization failed:', error);
    }
  }

  /**
   * Create backdrop element
   */
  private async createBackdrop(): Promise<void> {
    const container = this.getContainer();
    
    // Remove existing backdrop if any
    this.removeBackdrop();
    
    // Create new backdrop
    this.backdropElement = document.createElement('div');
    this.backdropElement.className = `song-backdrop ${this.options.backdropClass}`.trim();
    this.backdropElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      pointer-events: none;
      opacity: ${this.options.backdropOpacity};
      filter: blur(${this.options.blurIntensity}px);
      transition: opacity 0.8s ease, filter 0.8s ease;
    `;
    
    container.appendChild(this.backdropElement);
  }

  /**
   * Get container element
   */
  private getContainer(): HTMLElement {
    if (this.options.backdropContainerId === 'body') {
      return document.body;
    }
    
    const container = document.getElementById(this.options.backdropContainerId);
    if (!container) {
      console.warn(`Container #${this.options.backdropContainerId} not found, using body`);
      return document.body;
    }
    
    return container;
  }

  /**
   * Get target element
   */
  private getTargetElement(): HTMLElement | null {
    const element = document.getElementById(this.options.targetElementId);
    if (!element) {
      console.warn(`Target element #${this.options.targetElementId} not found`);
    }
    return element;
  }

  /**
   * Update backdrop with new colors or options
   */
  async update(newOptions?: Partial<SongOptions>): Promise<void> {
    if (this.isDestroyed) return;

    if (newOptions) {
      this.options = { ...this.options, ...newOptions };
    }

    try {
      const colors = await this.extractColors();
      if (colors.length > 0) {
        this.currentColors = colors;
        await this.generateAndApplyWaves();
      }
    } catch (error) {
      console.error('Sóng update failed:', error);
    }
  }

  /**
   * Extract colors from target element
   */
  async extractColors(): Promise<SongColor[]> {
    const targetElement = this.getTargetElement();
    if (!targetElement) {
      return [];
    }

    try {
      const colors = await ColorExtractor.extractFromElement(targetElement, this.options.colorCount);
      return colors;
    } catch (error) {
      console.error('Color extraction failed:', error);
      return [];
    }
  }

  /**
   * Generate and apply wave patterns
   */
  private async generateAndApplyWaves(): Promise<void> {
    if (!this.backdropElement || this.currentColors.length === 0) return;

    // Get viewport dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create or update wave generator
    if (!this.waveGenerator) {
      this.waveGenerator = new WaveGenerator(
        width,
        height,
        this.currentColors,
        this.options.waveIntensity,
        this.options.animationDuration
      );
    } else {
      this.waveGenerator.updateDimensions(width, height);
      this.waveGenerator.updateColors(this.currentColors);
    }

    // Generate SVG waves
    const svgContent = this.waveGenerator.generateSVGWaves();
    
    // Apply to backdrop
    this.backdropElement.innerHTML = svgContent;
  }

  /**
   * Setup observers for auto-update
   */
  private setupObservers(): void {
    if (!this.options.autoUpdate) return;

    // Observe window resize
    this.resizeObserver = new ResizeObserver(() => {
      this.debounce(() => this.generateAndApplyWaves(), 250);
    });
    this.resizeObserver.observe(document.body);

    // Observe target element changes
    const targetElement = this.getTargetElement();
    if (targetElement) {
      this.mutationObserver = new MutationObserver(() => {
        this.debounce(() => this.update(), 500);
      });
      
      this.mutationObserver.observe(targetElement, {
        childList: true,
        attributes: true,
        attributeFilter: ['src', 'style', 'class'],
        subtree: true
      });
    }
  }

  /**
   * Debounce utility
   */
  private debounce(func: Function, wait: number): void {
    const timeout = setTimeout(() => {
      func();
      clearTimeout(timeout);
    }, wait);
  }

  /**
   * Get current extracted colors
   */
  getCurrentColors(): SongColor[] {
    return [...this.currentColors];
  }

  /**
   * Regenerate waves with current colors
   */
  regenerateWaves(): void {
    if (!this.isDestroyed) {
      this.generateAndApplyWaves();
    }
  }

  /**
   * Remove backdrop element
   */
  private removeBackdrop(): void {
    if (this.backdropElement) {
      this.backdropElement.remove();
      this.backdropElement = null;
    }
  }

  /**
   * Destroy instance and cleanup
   */
  destroy(): void {
    this.isDestroyed = true;
    
    // Remove backdrop
    this.removeBackdrop();
    
    // Disconnect observers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    
    // Clear references
    this.waveGenerator = null;
    this.currentColors = [];
  }
}

/**
 * Create a new Sóng instance
 */
export function createSong(options: SongOptions): SongInstance {
  return new Song(options);
}

/**
 * Default export
 */
export default {
  create: createSong,
  Song
};
