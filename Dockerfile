# Use Node.js v22 (LTS-compatible)
FROM node:22

# Set working directory
WORKDIR /app

# Copy only package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the backend code
COPY . .

# Expose the correct backend port
EXPOSE 10000

# Start the backend server
CMD ["node", "server.js"]
