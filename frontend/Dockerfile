FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install http-server globally
RUN npm install -g http-server

# Expose port
EXPOSE 3000

# Start with http-server
CMD ["http-server", "dist", "-p", "3000", "-c-1", "-a", "0.0.0.0"]
