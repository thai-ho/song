import { SongColor, WavePoint } from './types';

/**
 * Wave pattern generator for creating beautiful gradient backgrounds
 */
export class WaveGenerator {
  private width: number;
  private height: number;
  private colors: SongColor[];
  private intensity: number;
  private animationDuration: number;

  constructor(
    width: number,
    height: number,
    colors: SongColor[],
    intensity: number = 0.7,
    animationDuration: number = 20
  ) {
    this.width = width;
    this.height = height;
    this.colors = colors;
    this.intensity = intensity;
    this.animationDuration = animationDuration;
  }

  /**
   * Generate SVG wave pattern
   */
  generateSVGWaves(): string {
    const waves = this.generateWavePoints();
    const gradients = this.generateGradients();
    
    return `
      <svg width="100%" height="100%" viewBox="0 0 ${this.width} ${this.height}" 
           preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${gradients}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background gradient -->
        <rect width="100%" height="100%" fill="url(#backgroundGradient)"/>
        
        <!-- Wave layers -->
        ${waves.map((wave, index) => this.generateWaveLayer(wave, index)).join('')}
        
        <!-- Animated wave styles -->
        <style>
          <![CDATA[
            ${this.generateWaveAnimations()}
          ]]>
        </style>
      </svg>
    `;
  }

  /**
   * Generate wave points for multiple layers
   */
  private generateWavePoints(): WavePoint[][] {
    const waveCount = Math.min(this.colors.length + 2, 5);
    const waves: WavePoint[][] = [];

    for (let i = 0; i < waveCount; i++) {
      const points: WavePoint[] = [];
      const frequency = 0.01 + (i * 0.005);
      const amplitude = (this.height * 0.1) + (i * this.height * 0.05);
      const baseY = this.height * (0.3 + i * 0.15);
      
      // Generate points along the width
      for (let x = 0; x <= this.width; x += 20) {
        points.push({
          x,
          y: baseY,
          amplitude: amplitude * this.intensity,
          frequency,
          phase: (i * Math.PI) / 3
        });
      }
      
      waves.push(points);
    }

    return waves;
  }

  /**
   * Generate SVG gradients from extracted colors
   */
  private generateGradients(): string {
    let gradients = '';

    // Background gradient
    const bgColors = this.colors.length >= 2 ? 
      [this.colors[0], this.colors[1]] : 
      [this.colors[0] || { r: 147, g: 51, b: 234, hex: '#9333ea' }, this.generateComplementaryColor(this.colors[0] || { r: 147, g: 51, b: 234, hex: '#9333ea' })];

    gradients += `
      <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColors[0].hex};stop-opacity:0.8"/>
        <stop offset="100%" style="stop-color:${bgColors[1].hex};stop-opacity:0.6"/>
      </linearGradient>
    `;

    // Wave gradients
    this.colors.forEach((color, index) => {
      const lighterColor = this.lightenColor(color, 0.3);
      const darkerColor = this.darkenColor(color, 0.2);
      
      gradients += `
        <radialGradient id="waveGradient${index}" cx="50%" cy="50%">
          <stop offset="0%" style="stop-color:${lighterColor.hex};stop-opacity:0.7"/>
          <stop offset="70%" style="stop-color:${color.hex};stop-opacity:0.4"/>
          <stop offset="100%" style="stop-color:${darkerColor.hex};stop-opacity:0.1"/>
        </radialGradient>
      `;
    });

    return gradients;
  }

  /**
   * Generate individual wave layer
   */
  private generateWaveLayer(points: WavePoint[], layerIndex: number): string {
    const colorIndex = layerIndex % this.colors.length;
    const pathData = this.generateWavePath(points, layerIndex);
    
    return `
      <path 
        d="${pathData}" 
        fill="url(#waveGradient${colorIndex})" 
        filter="url(#glow)"
        class="wave-layer-${layerIndex}"
        opacity="0.6">
      </path>
    `;
  }

  /**
   * Generate SVG path for wave
   */
  private generateWavePath(points: WavePoint[], layerIndex: number): string {
    if (points.length === 0) return '';

    let path = `M 0 ${this.height}`;
    
    // Move to first point
    path += ` L 0 ${points[0].y}`;
    
    // Create smooth curve through points
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate control points for smooth curve
      const cp1x = current.x + (next.x - current.x) * 0.5;
      const cp1y = current.y;
      const cp2x = current.x + (next.x - current.x) * 0.5;
      const cp2y = next.y;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    
    // Close the path
    path += ` L ${this.width} ${this.height} Z`;
    
    return path;
  }

  /**
   * Generate CSS animations for waves
   */
  private generateWaveAnimations(): string {
    let animations = '';
    
    for (let i = 0; i < 5; i++) {
      const duration = this.animationDuration + (i * 2);
      const direction = i % 2 === 0 ? 'normal' : 'reverse';
      
      animations += `
        .wave-layer-${i} {
          animation: waveMove${i} ${duration}s ease-in-out infinite ${direction};
          transform-origin: center;
        }
        
        @keyframes waveMove${i} {
          0%, 100% {
            transform: translateX(0) scaleY(1);
          }
          25% {
            transform: translateX(-10px) scaleY(1.1);
          }
          50% {
            transform: translateX(5px) scaleY(0.9);
          }
          75% {
            transform: translateX(-5px) scaleY(1.05);
          }
        }
      `;
    }
    
    return animations;
  }

  /**
   * Lighten a color
   */
  private lightenColor(color: SongColor, amount: number): SongColor {
    const r = Math.min(255, Math.floor(color.r + (255 - color.r) * amount));
    const g = Math.min(255, Math.floor(color.g + (255 - color.g) * amount));
    const b = Math.min(255, Math.floor(color.b + (255 - color.b) * amount));
    
    return {
      r, g, b,
      hex: this.rgbToHex(r, g, b)
    };
  }

  /**
   * Darken a color
   */
  private darkenColor(color: SongColor, amount: number): SongColor {
    const r = Math.floor(color.r * (1 - amount));
    const g = Math.floor(color.g * (1 - amount));
    const b = Math.floor(color.b * (1 - amount));
    
    return {
      r, g, b,
      hex: this.rgbToHex(r, g, b)
    };
  }

  /**
   * Generate complementary color
   */
  private generateComplementaryColor(color: SongColor): SongColor {
    const r = 255 - color.r;
    const g = 255 - color.g;
    const b = 255 - color.b;
    
    return {
      r, g, b,
      hex: this.rgbToHex(r, g, b)
    };
  }

  /**
   * Convert RGB to HEX
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Update dimensions
   */
  updateDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * Update colors
   */
  updateColors(colors: SongColor[]): void {
    this.colors = colors;
  }
}
