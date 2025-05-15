# Use Node.js LTS base image
FROM node:18-alpine

#Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY ../App_code/IncidentManager/package*.json ./

# Copy .env file into the container
COPY App_code/IncidentManager/.env ./

RUN npm install

COPY ../App_code/IncidentManager ./

RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Build the app as non-root (works if permissions are fixed)
RUN npm run build

# Expose the port your app runs on (default 5000)
EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]










