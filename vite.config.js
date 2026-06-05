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
    port: 3000
  },
  resolve: {
    alias: { './runtimeConfig': './runtimeConfig.browser' },
  },
});
