import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// GitHub Pages specific Vite configuration
export default defineConfig({
  plugins: [react()],
  base: '/ChatbotAI/', // Your GitHub repository name
  root: 'client',
  build: {
    outDir: '../docs', // GitHub Pages can serve from docs folder
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'client/index.github.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
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