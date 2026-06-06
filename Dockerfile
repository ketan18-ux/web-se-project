FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json ./

# Install root dependencies with unsafe-perm
RUN npm config set unsafe-perm true && npm install

# Copy the rest of the repo
COPY . .

# Install client dependencies and build
RUN cd client && npm config set unsafe-perm true && npm install && npm run build

# Expose port (Render uses $PORT env var)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
