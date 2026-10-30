import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create separate chunks for major libraries
          if (id.includes('node_modules')) {
            // Icons library
            if (id.includes('lucide')) {
              return 'icons'
            }
            // Chart libraries
            if (id.includes('chart') || id.includes('recharts')) {
              return 'charts'
            }
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'animation'
            }
            // Keep React and most vendor libs together to avoid circular deps
            return 'vendor'
          }
        }
      }
    },
    // Disable source maps for production (smaller files)
    sourcemap: false
  },
  // Optimize dependencies during development
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
