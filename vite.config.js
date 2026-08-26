import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // PayHere sandbox credentials are approved for the localhost hostname.
    // The API proxy remains pinned to IPv4 below to avoid Windows IPv6 issues.
    host: 'localhost',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        // Use IPv4 explicitly. On Windows, "localhost" can resolve to IPv6
        // while the backend is listening on IPv4, which makes form requests
        // appear to hang or fail in the browser preview.
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
