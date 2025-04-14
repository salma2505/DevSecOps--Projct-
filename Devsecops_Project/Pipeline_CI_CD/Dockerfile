# Use Node.js LTS base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install necessary packages globally (like typescript, ts-node, tsx)
RUN npm install -g typescript ts-node tsx

# Copy package files and install dependencies
COPY ../App_code/IncidentManager/package*.json ./
RUN npm install

# Copy .env file into the container
COPY App_code/IncidentManager/.env ./

# Install drizzle-kit locally (make sure it's available for migration)
RUN npm install drizzle-kit

# Copy drizzle config and schema files
COPY App_code/IncidentManager/drizzle.config.ts ./drizzle.config.ts
COPY App_code/IncidentManager/shared/schema.ts ./shared/schema.ts
COPY ../App_code/IncidentManager/meta ./meta


# Copy the rest of the app
COPY ../App_code/IncidentManager ./

# Ensure binaries like vite and esbuild are executable
RUN chmod +x ./node_modules/.bin/vite && chmod +x ./node_modules/.bin/esbuild

# Build the app (if applicable)
RUN npm run build

# Expose the port your app runs on (default 3000)
EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]

