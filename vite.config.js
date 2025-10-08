import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 4000,
    host: true,
    open: false,
    hmr: {
      port: 4001
    },
    force: true,
    clearScreen: false
  },
  preview: {
    port: 3000,
    host: true,
    open: false
  }
});
