import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// GitHub Pages specific Vite configuration
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/', // Replace with your GitHub repository name
  root: 'client',
  build: {
    outDir: '../docs', // GitHub Pages can serve from docs folder
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'client/index.github.html'),
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})