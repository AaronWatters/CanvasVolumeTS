import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  minify: false,
  platform: 'browser',
  target: 'es2020',
  noExternal: () => true, // bundle all dependencies
  globalName: 'CanvasVolumeTS',
});
