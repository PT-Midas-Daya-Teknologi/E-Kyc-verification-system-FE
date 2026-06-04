import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@smithy/eventstream-serde-browser',
      '@smithy/eventstream-codec'
    ]
  },
  server: {
    port: 3000,
    // Proxy all /api requests to Spring Boot backend
    // This eliminates CORS issues completely in development
    proxy: {
      '/api': {
        target: 'http://localhost:8080/openapi/dev',
        changeOrigin: true,
        secure: false,
      },
      '/kyc': {
        target: 'http://localhost:8080/openapi/dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: { './runtimeConfig': './runtimeConfig.browser' },
  },
});
