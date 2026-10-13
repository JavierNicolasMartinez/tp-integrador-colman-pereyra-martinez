import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Lee las variables VITE_* del .env de la raíz del repo (el mismo que usa docker compose).
  // En Docker la variable llega como argumento de build.
  envDir: '..',
  server: {
    port: 5173,
  },
})
