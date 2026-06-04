import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  preview: {
    host: true,
    port: 3000,
    allowedHosts: [
      'nird.jrcan.dev'
    ]
  }
})