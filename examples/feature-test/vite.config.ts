import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: 'public',
  server: {
    watch: {
      ignored: ['!**/like/**', '!**/like-scene/**']
    }
  },
  optimizeDeps: {
    exclude: ['@like2d/like', '@like2d/scene']
  }
});
