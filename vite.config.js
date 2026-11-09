import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/NetDrop-Web/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        comoFunciona: resolve(__dirname, 'como-funciona.html'),
        docs: resolve(__dirname, 'docs.html'),
      },
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  }
});
