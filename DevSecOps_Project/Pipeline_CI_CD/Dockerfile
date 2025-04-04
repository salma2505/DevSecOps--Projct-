# Use the official Node.js image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy all remaining project files
COPY . .

# Build the application
RUN npm run build

# Install serve to run the app
RUN npm install -g serve

# Serve the built app
CMD ["serve", "-s", "dist"]

# Expose the port your app will run on
EXPOSE 3000

