import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:5000';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
