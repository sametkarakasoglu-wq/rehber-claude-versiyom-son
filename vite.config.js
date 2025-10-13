import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        format: 'iife',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  plugins: [
    {
      name: 'remove-module-type',
      transformIndexHtml(html) {
        return html.replace(/type="module"/g, '');
      }
    }
  ],
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
