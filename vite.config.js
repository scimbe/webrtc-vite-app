import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    cors: true,
    hmr: {
      port: 3000,
      overlay: false
    },
    proxy: {
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.url);
          });
          proxy.on('error', (err, _req, _res) => {
            console.warn('Proxy error:', err);
          });
        }
      }
    }
  }
});