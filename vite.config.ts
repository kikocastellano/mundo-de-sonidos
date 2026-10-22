import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { target: 'es2019', outDir: 'dist', sourcemap: false },
  server: { port: 5174 },
  preview: { port: 4174 },
});
