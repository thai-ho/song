import typescript from '@rollup/plugin-typescript';

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/song.esm.js',
      format: 'es'
    },
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist'
      })
    ]
  },
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/song.js',
      format: 'umd',
      name: 'Song'
    },
    plugins: [
      typescript()
    ]
  }
];
