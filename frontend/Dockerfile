FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Imagen final ----
# nginx:alpine ya corre workers como usuario 'nginx' (uid 101)
# El proceso maestro necesita root para bind al puerto 80,
# pero los workers corren como nginx por configuracion interna.
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Permisos correctos sobre los archivos del sitio
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
