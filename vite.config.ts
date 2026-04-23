import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  envDir: path.resolve(__dirname, '..'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['greenly-bioptic-ione.ngrok-free.dev'],
    watch: {
      usePolling: true,
      interval: 1000,
    },
    headers: {
      'Permissions-Policy': 'camera=*, microphone=*, display-capture=*, fullscreen=*, clipboard-read=*, clipboard-write=*, geolocation=*',
    },
    proxy: {
      '/api': {
        // Usamos 127.0.0.1 explícito para evitar problemas
        // con resoluciones IPv6 (::1) en algunos entornos.
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/generated-assets': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
