import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    https: {
      key: './secrets/private-key.pem',
      cert: './secrets/public-certificate.pem'
    },
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
