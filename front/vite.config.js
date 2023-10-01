import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3006,
    watch: {
      usePolling: true,
    }
  },
  define: {
    global: 'window'
  }
})
