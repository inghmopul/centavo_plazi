import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/centavo_plazi/',
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/transactions': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
});
