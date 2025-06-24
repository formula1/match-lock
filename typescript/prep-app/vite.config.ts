import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
        {
      name: 'markdown-as-raw',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('.md')) {
          return `export default ${JSON.stringify(code)}`
        }
      },
    },
  ],
  base: './', // Use relative paths for Electron
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Optimize for Electron
    target: 'chrome120', // Match Electron's Chromium version
    rollupOptions: {
      // Ensure assets are properly handled
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
    commonjsOptions: {
      // Include the shared module for CommonJS transformation
      include: [/node_modules/, /shared/],
    },
  },
  server: {
    port: 5173,
    strictPort: true, // Don't try other ports if 5173 is busy
  },
})
