import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/ziraat-api': {
        target: 'https://www.ziraatbank.com.tr',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/ziraat-api/, '')
      }
    }
  }
})
