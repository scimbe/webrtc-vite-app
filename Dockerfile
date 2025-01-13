# Build Stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies for the server
COPY package*.json ./
RUN npm ci --production

# Copy server files
COPY server ./server

# Copy the built frontend
COPY --from=build /app/dist ./dist

EXPOSE 3000
EXPOSE 3001

CMD ["node", "server/index.js"]