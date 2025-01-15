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
        secure: false,
        changeOrigin: true,
        onError: (err) => {
          console.error('WebSocket proxy error:', err);
        },
        onProxyReq: (proxyReq) => {
          console.log('Proxying WebSocket request:', proxyReq.path);
        },
        onProxyReqWs: (proxyReq) => {
          console.log('Proxying WebSocket upgrade:', proxyReq.path);
        }
      }
    }
  }
});