import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { PORT } from './src/configs/env'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(PORT) || 5173,
  },
})
