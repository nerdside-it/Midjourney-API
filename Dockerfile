# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S midjourney -u 1001

# Change ownership of the app directory
RUN chown -R midjourney:nodejs /app
USER midjourney

# Expose port
EXPOSE 3147

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').request('http://localhost:3147/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).end()"

# Start the application
CMD ["npm", "start"]
