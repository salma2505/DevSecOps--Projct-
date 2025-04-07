# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Run database migrations
RUN npm run db:push

# Build app (backend + frontend if applicable)
RUN npm run build

# Stage 2: Production image
FROM node:20 AS production

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app /app

# Install only production dependencies
RUN npm install --omit=dev

# Expose port (change if different)
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]

