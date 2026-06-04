import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// Directorio del sitio público (diseño standalone React UMD + Babel-en-navegador).
// Vive como carpeta hermana de frontend/ y se sirve tal cual, sin build.
const WEBSITE_DIR = path.resolve(__dirname, '../website')

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
}

/**
 * Sirve el sitio público (../website) en la raíz del dev server, mientras el
 * admin (esta app Vite) vive bajo /admin/. Reutiliza el proxy /api y /uploads.
 * Solo intercepta rutas cuyo archivo existe en website/, dejando pasar todo lo
 * de /admin, /api, /uploads y los internos de Vite.
 */
function serveWebsite(): Plugin {
  return {
    name: 'serve-public-website',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '/'
        const pathname = decodeURIComponent(url.split('?')[0])

        if (
          pathname.startsWith('/admin') ||
          pathname.startsWith('/api') ||
          pathname.startsWith('/uploads')
        ) {
          return next()
        }

        const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
        const filePath = path.join(WEBSITE_DIR, rel)

        // Evitar path traversal fuera de WEBSITE_DIR.
        if (!filePath.startsWith(WEBSITE_DIR)) return next()

        let stat: fs.Stats
        try {
          stat = fs.statSync(filePath)
        } catch {
          return next()
        }
        if (!stat.isFile()) return next()

        const ext = path.extname(filePath).toLowerCase()
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
        res.setHeader('Content-Length', stat.size)
        fs.createReadStream(filePath).pipe(res)
      })
    },
  }
}

export default defineConfig({
  base: '/admin/',
  plugins: [serveWebsite(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@react-pdf') || id.includes('react-pdf')) {
            return 'vendor-react-pdf'
          }
          if (id.includes('@tiptap')) {
            return 'vendor-tiptap'
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react'
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
