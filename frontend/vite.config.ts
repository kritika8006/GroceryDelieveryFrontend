import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Is package ko bundle hone se bahar rakhein taaki syntax error na ho
    exclude: ['@icons-pack/react-simple-icons'] 
  }
})