import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@axzr/ptml': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 3018,
    open: true,
  },
});
