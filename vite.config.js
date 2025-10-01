import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages: https://hamalfi-jp.github.io/cards_view/
  //base: '/cards_view/',
})
