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
        let filePath = path.join(WEBSITE_DIR, rel)

        // Evitar path traversal fuera de WEBSITE_DIR.
        if (!filePath.startsWith(WEBSITE_DIR)) return next()

        let stat: fs.Stats | null = null
        try {
          stat = fs.statSync(filePath)
        } catch {
          stat = null
        }

        // SPA fallback: si la ruta no corresponde a un archivo real del sitio
        // público (p.ej. /holasd, /ruta-inexistente), servimos su index.html.
        // El sitio público usa hash routing, así que cargará la página de inicio
        // en vez de mostrar el error de base URL de Vite.
        if (!stat || !stat.isFile()) {
          // No interceptar peticiones de assets concretos (con extensión) que
          // no existen: que sigan al 404 natural.
          if (path.extname(pathname)) return next()
          filePath = path.join(WEBSITE_DIR, 'index.html')
          try {
            stat = fs.statSync(filePath)
          } catch {
            return next()
          }
        }

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
