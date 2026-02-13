import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
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
