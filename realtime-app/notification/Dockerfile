FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Optional: Notification service can log to stdout, no port needed
# If you want socket.io client to connect backend, you don't need exposed port
CMD ["npm", "start"]
