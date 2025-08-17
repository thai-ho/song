# 🌊 Sóng - Integration Guide

This guide shows you how to integrate Sóng into your existing projects.

## Quick Integration Examples

### For Music Players

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Music Player</title>
    <script src="https://unpkg.com/song-waves/dist/song.js"></script>
</head>
<body>
    <!-- Your album art -->
    <img id="current-album" src="album1.jpg" alt="Current Song">
    
    <!-- Your player controls -->
    <div class="player-controls">
        <button onclick="playPause()">⏯️</button>
        <button onclick="nextSong()">⏭️</button>
    </div>

    <script>
        // Initialize Sóng
        const musicBackdrop = Song.create({
            targetElementId: 'current-album',
            waveIntensity: 0.9,
            animationDuration: 25
        });

        // When changing songs
        function nextSong() {
            const albumArt = document.getElementById('current-album');
            albumArt.src = 'new-album.jpg';
            // Sóng automatically updates the backdrop!
        }
    </script>
</body>
</html>
```

### For Image Galleries

```html
<!-- Gallery item -->
<div class="gallery-item">
    <img id="featured-photo" src="photo1.jpg" alt="Featured Photo">
</div>

<script>
    const galleryBackdrop = Song.create({
        targetElementId: 'featured-photo',
        colorCount: 5,
        blurIntensity: 10,
        backdropOpacity: 0.6
    });

    // When user clicks on different photos
    function showPhoto(photoSrc) {
        document.getElementById('featured-photo').src = photoSrc;
        // Backdrop updates automatically!
    }
</script>
```

### For React Apps

```jsx
import { useEffect, useRef } from 'react';
import Song from 'song-waves';

function MusicPlayer({ currentTrack }) {
    const albumRef = useRef(null);
    const songInstance = useRef(null);

    useEffect(() => {
        // Initialize Sóng
        songInstance.current = Song.create({
            targetElementId: 'album-art',
            waveIntensity: 0.8
        });

        return () => {
            // Cleanup
            if (songInstance.current) {
                songInstance.current.destroy();
            }
        };
    }, []);

    return (
        <div>
            <img 
                id="album-art"
                ref={albumRef}
                src={currentTrack.albumArt}
                alt={currentTrack.title}
            />
            {/* Your player UI */}
        </div>
    );
}
```

### For Vue.js Apps

```vue
<template>
    <div>
        <img 
            id="hero-image" 
            :src="heroImageSrc" 
            alt="Hero"
        />
        <!-- Your content -->
    </div>
</template>

<script>
import Song from 'song-waves';

export default {
    data() {
        return {
            heroImageSrc: 'hero1.jpg',
            songInstance: null
        };
    },
    mounted() {
        this.songInstance = Song.create({
            targetElementId: 'hero-image',
            colorCount: 4,
            waveIntensity: 0.7
        });
    },
    beforeUnmount() {
        if (this.songInstance) {
            this.songInstance.destroy();
        }
    }
};
</script>
```

## Advanced Integration Patterns

### Multiple Sections

```javascript
// Different backdrops for different page sections
const sections = [
    { elementId: 'header-image', containerId: 'header' },
    { elementId: 'main-image', containerId: 'main' },
    { elementId: 'footer-image', containerId: 'footer' }
];

sections.forEach(({ elementId, containerId }) => {
    Song.create({
        targetElementId: elementId,
        backdropContainerId: containerId,
        waveIntensity: 0.6,
        blurIntensity: 8
    });
});
```

### Dynamic Theme Switching

```javascript
const backdrop = Song.create({
    targetElementId: 'theme-image',
    autoUpdate: false
});

function switchTheme(intensity, opacity) {
    backdrop.update({
        waveIntensity: intensity,
        backdropOpacity: opacity,
        blurIntensity: intensity * 10
    });
}

// Usage
switchTheme(0.3, 0.4); // Subtle theme
switchTheme(0.9, 0.8); // Intense theme
```

### Performance Optimization

```javascript
// For performance-critical applications
const backdrop = Song.create({
    targetElementId: 'main-image',
    autoUpdate: false,        // Disable auto-updates
    animationDuration: 60,    // Slower animations
    colorCount: 3            // Fewer colors to process
});

// Manual updates only when needed
document.getElementById('update-btn').addEventListener('click', () => {
    backdrop.update();
});
```

## Common Patterns

### Loading States

```javascript
const backdrop = Song.create({
    targetElementId: 'content-image'
});

// Show loading, then update backdrop
async function loadNewContent(imageSrc) {
    showLoading();
    
    const img = document.getElementById('content-image');
    img.onload = () => {
        hideLoading();
        // Backdrop updates automatically
    };
    img.src = imageSrc;
}
```

### Error Handling

```javascript
try {
    const backdrop = Song.create({
        targetElementId: 'my-image'
    });
} catch (error) {
    console.error('Failed to initialize backdrop:', error);
    // Fallback to static background
    document.body.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)';
}
```

### Responsive Design

```javascript
const backdrop = Song.create({
    targetElementId: 'responsive-image'
});

// Adjust settings based on screen size
function updateResponsiveSettings() {
    const isMobile = window.innerWidth < 768;
    
    backdrop.update({
        waveIntensity: isMobile ? 0.5 : 0.8,
        blurIntensity: isMobile ? 4 : 8,
        animationDuration: isMobile ? 40 : 25
    });
}

window.addEventListener('resize', updateResponsiveSettings);
```

## Tips & Best Practices

1. **Use appropriate image sizes** - Sóng works best with images that are at least 200x200px
2. **Consider performance** - Reduce `colorCount` and increase `animationDuration` for better performance
3. **Test on mobile** - Lower settings generally work better on mobile devices
4. **Cleanup instances** - Always call `destroy()` when removing components
5. **Handle errors gracefully** - Provide fallback backgrounds for when Sóng fails to initialize

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## Need Help?

- Check the [demo examples](./demo/) for working code
- Open an issue on [GitHub](https://github.com/thai-ho/song)
- Read the full [API documentation](./README.md)
