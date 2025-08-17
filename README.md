# 🌊 Sóng

**Sóng** /sóːŋ/ - Vietnamese for "waves"

Imagine standing by a riverbank, watching gentle waves carry the sky's reflection across the water - that stunning interplay of color and light. **Sóng** brings this same magic to your interfaces.

Extract colors from any image and transform them into beautiful flowing gradient backgrounds. Perfect for music players where album artwork becomes a living, breathing backdrop that pulses with your music's essence.

## ✨ Features

- 🎨 **Smart Color Extraction** - Automatically extracts dominant colors from images, background images, or any HTML element
- 🌊 **Dynamic Wave Patterns** - Generates beautiful, animated wave gradients based on extracted colors  
- 📱 **Responsive Design** - Adapts perfectly to any screen size and device orientation
- ⚡ **Zero Dependencies** - Pure TypeScript/JavaScript with no external libraries
- 🔄 **Auto-Updates** - Automatically regenerates backdrops when your content changes
- 🎛️ **Highly Configurable** - Customize colors, wave intensity, animation speed, and more
- 🚀 **Performance Optimized** - Efficient color sampling and smooth animations

## 🚀 Quick Start

### Installation

```bash
npm install song-waves
```

Or include directly in your HTML:

```html
<script src="https://unpkg.com/song-waves/dist/song.js"></script>
```

### Basic Usage

```javascript
// Initialize Sóng on any element with an ID
const backdrop = Song.create({
    targetElementId: 'my-image'
});

// That's it! The backdrop automatically updates based on your image
```

```html
<img id="my-image" src="album-art.jpg" alt="Album Art">
```

## 📖 API Reference

### `Song.create(options)`

Creates a new Sóng instance with the specified options.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `targetElementId` | `string` | **required** | ID of the element to extract colors from |
| `backdropContainerId` | `string` | `'body'` | ID of container where backdrop will be applied |
| `colorCount` | `number` | `3` | Number of dominant colors to extract (1-8) |
| `waveIntensity` | `number` | `0.7` | Wave animation intensity (0-1) |
| `animationDuration` | `number` | `20` | Animation duration in seconds |
| `autoUpdate` | `boolean` | `true` | Auto-update when target element changes |
| `backdropClass` | `string` | `''` | Custom CSS class for backdrop |
| `blurIntensity` | `number` | `8` | Backdrop blur intensity (0-20) |
| `backdropOpacity` | `number` | `0.8` | Backdrop opacity (0-1) |

#### Methods

| Method | Description |
|--------|-------------|
| `update(options?)` | Update backdrop with new options |
| `extractColors()` | Manually extract colors from target element |
| `getCurrentColors()` | Get currently extracted colors |
| `regenerateWaves()` | Regenerate waves with current colors |
| `destroy()` | Remove backdrop and cleanup |

## 🎯 Use Cases

### Music Player

Perfect for creating immersive music experiences where the album art drives the entire visual theme:

```javascript
const musicBackdrop = Song.create({
    targetElementId: 'album-cover',
    colorCount: 4,
    waveIntensity: 0.9,
    animationDuration: 30
});

// Backdrop automatically updates when you change songs!
```

### Photo Gallery

Create dynamic backgrounds that complement your photos:

```javascript
const galleryBackdrop = Song.create({
    targetElementId: 'featured-image',
    blurIntensity: 12,
    backdropOpacity: 0.6
});
```

### Landing Pages

Add visual depth to hero sections:

```javascript
const heroBackdrop = Song.create({
    targetElementId: 'hero-image',
    waveIntensity: 0.5,
    animationDuration: 40
});
```

## 🎨 Advanced Examples

### Custom Wave Patterns

```javascript
const customWaves = Song.create({
    targetElementId: 'artwork',
    colorCount: 5,
    waveIntensity: 1.0,
    animationDuration: 15,
    blurIntensity: 4,
    backdropOpacity: 0.9
});
```

### Multiple Instances

```javascript
// Different backdrops for different sections
const headerBackdrop = Song.create({
    targetElementId: 'header-image',
    backdropContainerId: 'header-section'
});

const mainBackdrop = Song.create({
    targetElementId: 'main-image',
    backdropContainerId: 'main-content'
});
```

### Dynamic Updates

```javascript
const backdrop = Song.create({
    targetElementId: 'dynamic-image',
    autoUpdate: false // Disable auto-update
});

// Manually update when needed
document.getElementById('update-btn').addEventListener('click', () => {
    backdrop.update({
        waveIntensity: 0.8,
        colorCount: 6
    });
});
```

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/thai-ho/song.git
cd song

# Install dependencies
npm install

# Build the library
npm run build

# Run demo
npm run demo
```

### Project Structure

```
src/
├── index.ts           # Main entry point
├── song.ts           # Core Sóng class
├── color-extractor.ts # Color extraction utilities
├── wave-generator.ts  # Wave pattern generation
└── types.ts          # TypeScript definitions

demo/
├── index.html        # Comprehensive demo
└── simple.html       # Simple usage example

dist/
├── song.js           # UMD build
├── song.esm.js       # ES module build
└── song.d.ts         # TypeScript definitions
```

## 🌊 How It Works

1. **Color Extraction**: Sóng analyzes your target element (images, backgrounds, etc.) and extracts the most dominant colors using advanced color sampling algorithms.

2. **Wave Generation**: Based on the extracted colors, it creates multiple layers of flowing wave patterns using SVG animations and gradients.

3. **Dynamic Backdrop**: The generated waves are applied as a full-screen backdrop that responds to your content and screen size.

4. **Smart Updates**: When your content changes (new image, different colors), Sóng automatically regenerates the backdrop to match.

## 🎵 Inspiration

Inspired by modern music apps like Spotify and Apple Music, where the album artwork creates an immersive visual experience. Sóng brings this same magic to any web application.

## 📄 License

MIT License - feel free to use Sóng in your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Created with 🌊 by [Thai Ho](https://github.com/thai-ho)*
