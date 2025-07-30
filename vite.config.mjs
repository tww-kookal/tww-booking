import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/tww-booking/',
  build: {
    outDir: 'dist',     // Custom output directory inside public
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify'
    }
  },
  server: {
    port: 5173,
    headers: {
      // Comment these during dev
      // 'Cross-Origin-Opener-Policy': 'same-origin',
      // 'Cross-Origin-Embedder-Policy': 'require-corp'      
    }
  }
})