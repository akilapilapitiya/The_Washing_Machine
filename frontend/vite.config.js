import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { PORT } from './src/configs/env'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: Number(PORT) || 5173,
  },
})
