# Use the official Node.js LTS base image
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (only production if building for production)
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose port (ensure this matches your config)
EXPOSE 3033

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3033

# Healthcheck (basic curl to API docs, adjust as needed)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3033/api-docs || exit 1

# Start the application
CMD [ "node", "src/server.js" ]
