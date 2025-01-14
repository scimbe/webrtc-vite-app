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
        onError: (err, req, res) => {
          console.error('Proxy error:', err);
        },
        onProxyReqWs: (proxyReq, req, socket, options, head) => {
          console.log('Proxying WebSocket request:', req.url);
        },
        onProxyRes: (proxyRes, req, res) => {
          console.log('Proxy response:', proxyRes.statusCode);
        }
      }
    }
  }
});