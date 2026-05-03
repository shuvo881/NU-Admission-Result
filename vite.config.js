import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/NU-Admission-Result/',
  plugins: [react()],
  server: {
    proxy: {
      '/nu-web': {
        target: 'http://app55.nu.edu.bd',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
