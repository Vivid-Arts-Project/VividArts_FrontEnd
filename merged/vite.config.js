import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    // Fail instead of silently falling onto the next free port (3001,
    // which is reserved for the backend) if 3000 is already taken.
    strictPort: true,
  }
})