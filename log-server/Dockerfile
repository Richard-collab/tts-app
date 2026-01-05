FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Use npm mirror for faster installation in China
RUN npm config set registry https://registry.npmmirror.com/

# Install production dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
