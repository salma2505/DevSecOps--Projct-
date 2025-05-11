# Use Node.js LTS base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

RUN npm install -g typescript ts-node tsx

# Copy package files and install dependencies
COPY ../App_code/IncidentManager/package*.json ./


# Copy .env file into the container
COPY App_code/IncidentManager/.env ./

# Install drizzle-kit locally 
RUN npm install drizzle-kit

# Copy drizzle config ,schema and meta  files
COPY App_code/IncidentManager/drizzle.config.ts ./drizzle.config.ts
COPY App_code/IncidentManager/shared/schema.ts ./shared/schema.ts
COPY ../App_code/IncidentManager/migrations/meta ./migrations/meta


# Copy the rest of the app
COPY ../App_code/IncidentManager ./

RUN chmod +x ./node_modules/.bin/vite && chmod +x ./node_modules/.bin/esbuild

# Build the app 
RUN npm run build

# Expose the port your app runs on (default 5000)
EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]

