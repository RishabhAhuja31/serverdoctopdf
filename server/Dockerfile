# Use the official Node.js image
FROM node:16

WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the Node.js server
CMD ["node", "server.js"]
