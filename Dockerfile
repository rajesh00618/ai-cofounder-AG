FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk upgrade --no-cache
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/server ./server
COPY --from=builder --chown=appuser:nodejs /app/package*.json ./
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/public ./public
USER appuser
EXPOSE 3001
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/api/health').then(r => process.exit(r.ok?0:1)).catch(() => process.exit(1))"
CMD ["node", "server/index.js"]
