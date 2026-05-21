FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache vips-dev

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

RUN npm prune --omit=dev

# ---- Imagen final ----
FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

RUN apk add --no-cache vips

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY entrypoint.sh ./entrypoint.sh

RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app && chmod +x /app/entrypoint.sh

USER appuser

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main"]
