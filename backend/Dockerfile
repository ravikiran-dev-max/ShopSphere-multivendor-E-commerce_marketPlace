# Production Dockerfile for ShopSphere Backend API
FROM node:20-alpine AS base

# Install curl for healthcheck probe
RUN apk add --no-cache curl

WORKDIR /app

# Install dependencies first to optimize build cache
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose backend listening port
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Standard container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Launch application
CMD ["npm", "start"]
