(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Song = {}));
})(this, (function (exports) { 'use strict';

    /**
     * Color extraction utilities using canvas
     */
    class ColorExtractor {
        static getCanvas() {
            if (!ColorExtractor.canvas) {
                ColorExtractor.canvas = document.createElement('canvas');
                ColorExtractor.ctx = ColorExtractor.canvas.getContext('2d');
            }
            return { canvas: ColorExtractor.canvas, ctx: ColorExtractor.ctx };
        }
        /**
         * Extract dominant colors from an HTML element
         */
        static async extractFromElement(element, colorCount = 3) {
            // Check if element contains an image
            const img = element.querySelector('img');
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
        static async extractFromImage(img, colorCount = 3) {
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
        static async extractFromImageUrl(url, colorCount = 3) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = async () => {
                    try {
                        const colors = await this.extractFromImage(img, colorCount);
                        resolve(colors);
                    }
                    catch (error) {
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
        static extractFromElementColors(element, colorCount) {
            const colors = [];
            const computedStyle = window.getComputedStyle(element);
            // Get background color
            const bgColor = computedStyle.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                const color = this.parseColor(bgColor);
                if (color)
                    colors.push(color);
            }
            // Get text color
            const textColor = computedStyle.color;
            if (textColor) {
                const color = this.parseColor(textColor);
                if (color)
                    colors.push(color);
            }
            // If we don't have enough colors, generate complementary ones
            while (colors.length < colorCount) {
                if (colors.length === 0) {
                    // Default to a nice purple if no colors found
                    colors.push({ r: 147, g: 51, b: 234, hex: '#9333ea' });
                }
                else {
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
        static analyzeImageData(imageData, colorCount) {
            const data = imageData.data;
            const colorMap = new Map();
            // Sample every 4th pixel for performance
            for (let i = 0; i < data.length; i += 16) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                // Skip transparent pixels
                if (a < 128)
                    continue;
                // Reduce color precision for grouping
                const reducedR = Math.floor(r / 32) * 32;
                const reducedG = Math.floor(g / 32) * 32;
                const reducedB = Math.floor(b / 32) * 32;
                const key = `${reducedR},${reducedG},${reducedB}`;
                if (colorMap.has(key)) {
                    colorMap.get(key).count++;
                }
                else {
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
        static parseColor(colorString) {
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
        static generateComplementaryColor(baseColor, index) {
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
        static rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        }
        /**
         * Convert RGB to HSL
         */
        static rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s;
            const l = (max + min) / 2;
            if (max === min) {
                h = s = 0;
            }
            else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                    default: h = 0;
                }
                h /= 6;
            }
            return { h: h * 360, s, l };
        }
        /**
         * Convert HSL to RGB
         */
        static hslToRgb(h, s, l) {
            h /= 360;
            const hue2rgb = (p, q, t) => {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            }
            else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        }
    }

    /**
     * Wave pattern generator for creating beautiful gradient backgrounds
     */
    class WaveGenerator {
        constructor(width, height, colors, intensity = 0.7, animationDuration = 20) {
            this.width = width;
            this.height = height;
            this.colors = colors;
            this.intensity = intensity;
            this.animationDuration = animationDuration;
        }
        /**
         * Generate SVG wave pattern
         */
        generateSVGWaves() {
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
        generateWavePoints() {
            const waveCount = Math.min(this.colors.length + 2, 5);
            const waves = [];
            for (let i = 0; i < waveCount; i++) {
                const points = [];
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
        generateGradients() {
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
        generateWaveLayer(points, layerIndex) {
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
        generateWavePath(points, layerIndex) {
            if (points.length === 0)
                return '';
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
        generateWaveAnimations() {
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
        lightenColor(color, amount) {
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
        darkenColor(color, amount) {
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
        generateComplementaryColor(color) {
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
        rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        }
        /**
         * Update dimensions
         */
        updateDimensions(width, height) {
            this.width = width;
            this.height = height;
        }
        /**
         * Update colors
         */
        updateColors(colors) {
            this.colors = colors;
        }
    }

    /**
     * Main Sóng class for creating dynamic wave backdrops
     */
    class Song {
        constructor(options) {
            this.currentColors = [];
            this.backdropElement = null;
            this.waveGenerator = null;
            this.resizeObserver = null;
            this.mutationObserver = null;
            this.isDestroyed = false;
            this.options = this.mergeDefaultOptions(options);
            this.init();
        }
        /**
         * Merge user options with defaults
         */
        mergeDefaultOptions(options) {
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
        async init() {
            try {
                await this.createBackdrop();
                await this.update();
                this.setupObservers();
            }
            catch (error) {
                console.error('Sóng initialization failed:', error);
            }
        }
        /**
         * Create backdrop element
         */
        async createBackdrop() {
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
        getContainer() {
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
        getTargetElement() {
            const element = document.getElementById(this.options.targetElementId);
            if (!element) {
                console.warn(`Target element #${this.options.targetElementId} not found`);
            }
            return element;
        }
        /**
         * Update backdrop with new colors or options
         */
        async update(newOptions) {
            if (this.isDestroyed)
                return;
            if (newOptions) {
                this.options = { ...this.options, ...newOptions };
            }
            try {
                const colors = await this.extractColors();
                if (colors.length > 0) {
                    this.currentColors = colors;
                    await this.generateAndApplyWaves();
                }
            }
            catch (error) {
                console.error('Sóng update failed:', error);
            }
        }
        /**
         * Extract colors from target element
         */
        async extractColors() {
            const targetElement = this.getTargetElement();
            if (!targetElement) {
                return [];
            }
            try {
                const colors = await ColorExtractor.extractFromElement(targetElement, this.options.colorCount);
                return colors;
            }
            catch (error) {
                console.error('Color extraction failed:', error);
                return [];
            }
        }
        /**
         * Generate and apply wave patterns
         */
        async generateAndApplyWaves() {
            if (!this.backdropElement || this.currentColors.length === 0)
                return;
            // Get viewport dimensions
            const width = window.innerWidth;
            const height = window.innerHeight;
            // Create or update wave generator
            if (!this.waveGenerator) {
                this.waveGenerator = new WaveGenerator(width, height, this.currentColors, this.options.waveIntensity, this.options.animationDuration);
            }
            else {
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
        setupObservers() {
            if (!this.options.autoUpdate)
                return;
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
        debounce(func, wait) {
            const timeout = setTimeout(() => {
                func();
                clearTimeout(timeout);
            }, wait);
        }
        /**
         * Get current extracted colors
         */
        getCurrentColors() {
            return [...this.currentColors];
        }
        /**
         * Regenerate waves with current colors
         */
        regenerateWaves() {
            if (!this.isDestroyed) {
                this.generateAndApplyWaves();
            }
        }
        /**
         * Remove backdrop element
         */
        removeBackdrop() {
            if (this.backdropElement) {
                this.backdropElement.remove();
                this.backdropElement = null;
            }
        }
        /**
         * Destroy instance and cleanup
         */
        destroy() {
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
    function createSong(options) {
        return new Song(options);
    }

    // Export all types
    // Export individual functions for named imports
    const create = createSong;
    // Default export with clean API
    var index = {
        create: createSong,
        Song: Song,
        createSong: createSong
    };

    exports.ColorExtractor = ColorExtractor;
    exports.Song = Song;
    exports.WaveGenerator = WaveGenerator;
    exports.create = create;
    exports.createSong = createSong;
    exports.default = index;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
