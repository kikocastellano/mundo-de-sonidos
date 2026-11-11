import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const build = process.env.GITHUB_RUN_NUMBER;

export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version + (build ? ` (${build})` : '')) },
  build: { target: 'es2019', outDir: 'dist', sourcemap: false },
  server: { port: 5174 },
  preview: { port: 4174 },
});
