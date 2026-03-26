import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'public',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./public', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: false,
  },
});
