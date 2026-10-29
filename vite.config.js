import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages'te site /digitalpano/ altında yayınlanır.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/digitalpano/' : '/',
  plugins: [react()],
})
