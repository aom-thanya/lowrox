import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { lineAuthDev } from './scripts/line-auth-dev'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), lineAuthDev()],
  // LINE Login's registered dev callback is http://localhost:5173/auth/line/callback.
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  }
})
