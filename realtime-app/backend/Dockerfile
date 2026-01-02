FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the code
COPY . .

# Expose port used by backend
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
