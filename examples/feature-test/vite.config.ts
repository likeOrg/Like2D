import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: 'public',
  resolve: {
    alias: [
      {
        find: /^like$/,
        replacement: path.resolve(__dirname, '../../like/src/index.ts')
      },
      {
        find: /^like\/(.+)$/,
        replacement: path.resolve(__dirname, '../../like/src/$1/index.ts')
      },
    ],
  },
  server: {
    watch: {
      ignored: ['!**/like/**']
    }
  },
  optimizeDeps: {
    exclude: ['like']
  }
});
