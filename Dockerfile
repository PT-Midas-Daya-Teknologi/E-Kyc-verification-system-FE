# =========================================
# Stage 1: Build the React (Vite) Application
# =========================================

ARG NODE_VERSION=24.14.0-alpine
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

# =========================================
# Stage 2: Serve static files with Node.js + `serve`
# =========================================

FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --link --from=builder /app/dist ./dist
RUN --mount=type=cache,target=/root/.npm npm install serve@^14.2.6 --omit=dev
USER node
EXPOSE 3000
CMD [ "npx", "serve", "-s", "dist", "-l", "3000" ]

#Build stage
# FROM node:18-alpine AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

#Production stage
# FROM nginx:stable-alpine AS production
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD [ "nginx", "-g", "daemon off;" ]