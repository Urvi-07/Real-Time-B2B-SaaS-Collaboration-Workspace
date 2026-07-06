# Use Node.js LTS (20) Alpine as the base image for a lightweight container
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package and package-lock files first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies required for compilation)
RUN npm ci

# Copy the rest of the project files
COPY . .

# Compile the TypeScript code to JavaScript
RUN npm run build

# Prune development dependencies to keep the production image lean
RUN npm prune --production

# Expose the default application port
EXPOSE 5000

# Run the compiled production application
CMD ["npm", "start"]
