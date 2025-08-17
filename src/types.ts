export interface SongColor {
  r: number;
  g: number;
  b: number;
  hex: string;
}

export interface SongOptions {
  /** Target element ID to extract colors from */
  targetElementId: string;
  
  /** Container element ID where backdrop will be applied (defaults to body) */
  backdropContainerId?: string;
  
  /** Number of dominant colors to extract (default: 3) */
  colorCount?: number;
  
  /** Wave pattern intensity (0-1, default: 0.7) */
  waveIntensity?: number;
  
  /** Animation duration in seconds (default: 20) */
  animationDuration?: number;
  
  /** Whether to auto-update when target element changes (default: true) */
  autoUpdate?: boolean;
  
  /** Custom CSS class to apply to backdrop (optional) */
  backdropClass?: string;
  
  /** Blur intensity for backdrop (0-20, default: 8) */
  blurIntensity?: number;
  
  /** Opacity of the backdrop (0-1, default: 0.8) */
  backdropOpacity?: number;
}

export interface WavePoint {
  x: number;
  y: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

export interface SongInstance {
  /** Update the backdrop with new colors or options */
  update(options?: Partial<SongOptions>): Promise<void>;
  
  /** Manually extract colors from the target element */
  extractColors(): Promise<SongColor[]>;
  
  /** Destroy the instance and remove backdrop */
  destroy(): void;
  
  /** Get current extracted colors */
  getCurrentColors(): SongColor[];
  
  /** Regenerate waves with current colors */
  regenerateWaves(): void;
}
