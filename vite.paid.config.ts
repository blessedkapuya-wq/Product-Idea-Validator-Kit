import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/private/paid-assets'),
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, 'src/paid/index.tsx'),
      formats: ['iife'],
      name: 'BiasharaPaidKitBundle',
      fileName: () => 'paid-kit.js',
      cssFileName: 'paid-kit',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
