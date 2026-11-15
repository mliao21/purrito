import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development the Go API runs on :8080 and Vite proxies /api to it.
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 }, // three.js is big; that's expected
  server: {
    proxy: { '/api': 'http://localhost:8080' },
  },
})
