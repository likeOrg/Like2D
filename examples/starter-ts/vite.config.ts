import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: 'public',
  server: {
    watch: {
      ignored: ['!**/like/**']
    }
  },
  optimizeDeps: {
    exclude: ['like']
  }
});