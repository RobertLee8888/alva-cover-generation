import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GH Pages serves the site at /alva-cover-generation/. Local dev uses '/'.
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  base: isProd ? '/alva-cover-generation/' : '/',
  resolve: {
    alias: {
      '@skill': new URL('../src', import.meta.url).pathname,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
