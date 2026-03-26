import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Aumentar el umbral de advertencia para evitar warnings muy agresivos
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // Agrupar librerías de PDF/HTML instaladas (jspdf, html2canvas, autotable)
            if (
              id.includes('jspdf') ||
              id.includes('html2canvas') ||
              id.includes('jspdf-autotable')
            )
              return 'pdf-vendors'
            // Íconos/graphics
            if (id.includes('lucide-react')) return 'icons'
            // Librerías grandes comunes
            return 'vendor'
          }
        },
      },
    },
  },
})
