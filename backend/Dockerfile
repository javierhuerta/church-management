FROM node:20-alpine AS builder

WORKDIR /app

# Herramientas de compilacion para modulos nativos (sharp, better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Imagen final ----
FROM node:20-alpine

# Usuario no-root para produccion
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# sharp necesita libvips en runtime
RUN apk add --no-cache vips

COPY package*.json ./

# Instalar dependencias de produccion (compilacion nativa requerida para sharp)
RUN apk add --no-cache python3 make g++ \
    && npm ci --omit=dev \
    && apk del python3 make g++

COPY --from=builder /app/dist ./dist
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# Directorio de uploads con permisos correctos
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main"]
