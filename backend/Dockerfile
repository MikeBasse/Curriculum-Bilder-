# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with reduced memory usage
RUN npm ci --maxsockets 1

# Generate Prisma client first
RUN npx prisma generate

# Copy source files
COPY tsconfig.json ./
COPY src ./src/

# Build TypeScript
RUN npx tsc

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Generate Prisma client for production
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads exports && chown -R nodejs:nodejs uploads exports

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application
CMD ["npm", "start"]
