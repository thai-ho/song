// Export all types
export * from './types';

// Export main classes
export { Song, createSong } from './song';
export { ColorExtractor } from './color-extractor';
export { WaveGenerator } from './wave-generator';

// For global/UMD usage, expose a simple API
import { createSong, Song } from './song';

// Export individual functions for named imports
export const create = createSong;

// Default export with clean API
export default {
  create: createSong,
  Song: Song,
  createSong: createSong
};
