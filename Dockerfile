# Build stage for React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build stage for Node.js backend
FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY backend/prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the backend files
COPY backend/ ./

# Copy the built frontend from the first stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose the internal port
EXPOSE 5000

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=5000
# Important: We map the database URL to the mounted volume in Fly
ENV DATABASE_URL="file:/data/dev.db"

# Start the server (includes Prisma migrations if needed, though they should be handled carefully in prod)
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
