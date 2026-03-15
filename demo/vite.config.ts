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
        find: /^like2d\/callback$/,
        replacement: path.resolve(__dirname, '../packages/like2d/src/adapters/callback/index.ts')
      },
      {
        find: /^like2d\/scene$/,
        replacement: path.resolve(__dirname, '../packages/like2d/src/adapters/scene/index.ts')
      },
      {
        find: /^like2d$/,
        replacement: path.resolve(__dirname, '../packages/like2d/src/index.ts')
      },
    ],
  },
});
