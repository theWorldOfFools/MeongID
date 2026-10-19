import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Dev lokal tanpa Docker: API & foto diteruskan ke backend Express.
    proxy: {
      '/api': 'http://localhost:3005',
      '/uploads': 'http://localhost:3005',
    },
  },
  preview: { port: 80, host: true },
});
