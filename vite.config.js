import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/github': {
        target: 'https://api.github.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/github/, ''),
        headers: {
          'User-Agent': 'sanziv9999-portfolio',
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req) => {
            const path = (req.url || '').split('?')[0]
            const allowed =
              /^\/users\/[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(
                path,
              ) ||
              /^\/users\/[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?\/repos$/.test(
                path,
              ) ||
              /^\/repos\/[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?\/[a-zA-Z0-9._-]{1,100}\/contributors$/.test(
                path,
              )
            if (!allowed) {
              _proxyReq.destroy()
            }
          })
        },
      },
    },
  },
})
