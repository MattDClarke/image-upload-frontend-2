import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "ritza-jo",
    project: "sentry-ai-code-review-frontend"
  })],

  build: {
    sourcemap: true
  }
})