import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind explicitly to IPv4 and use Vite's standard development port.
    // Port 3000 is inside a Windows-reserved range on this machine.
    host: '127.0.0.1',
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
