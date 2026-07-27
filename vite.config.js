import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3002,
    // Fail instead of silently falling onto the next free port if the
    // configured port is already taken.
    strictPort: true,
  }
})