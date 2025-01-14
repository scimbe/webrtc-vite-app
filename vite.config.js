import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      }
    }
  },
  define: {
    'process.env': {
      VITE_WS_PORT: 3001,
      VITE_WS_HOST: 'localhost'
    }
  }
});