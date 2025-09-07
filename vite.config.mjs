import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), svgr()],
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
    headers: {
      // Comment these during dev
      // 'Cross-Origin-Opener-Policy': 'same-origin',
      // 'Cross-Origin-Embedder-Policy': 'require-corp'      
    },
    proxy: {
      '/api/v1': {
        target: 'https://tww-service.up.railway.app',
        changeOrigin: true,
        secure: false
      }
    }
  }
})