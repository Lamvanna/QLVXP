# Multi-stage build for NaCinema
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app

# Copy source code
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nacinema

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create uploads directory
RUN mkdir -p uploads && chown -R nacinema:nodejs uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Switch to non-root user
USER nacinema

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]