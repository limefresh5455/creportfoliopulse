import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['axios', 'react-toastify']
        }
      }
    }
  },
  server: {
    historyApiFallback: {
      rewrites: [
        { from: /\/Admin/, to: '/index.html' },
        { from: /\/Admin\/.*/, to: '/index.html' }
      ]
    }
  }
})