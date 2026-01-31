# Build stage
FROM node:20-alpine AS builder

ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove lock file to force fresh install with updated versions
RUN rm -f package-lock.json

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Build Next.js application
RUN NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files from builder
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm install --legacy-peer-deps --omit=dev

# Copy built application from builder
COPY --from=builder /app/.next ./.next

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start application
CMD ["npm", "start"]
