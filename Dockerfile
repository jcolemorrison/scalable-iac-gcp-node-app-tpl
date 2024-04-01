# ---- Base Node ----
FROM node:21.7.1 AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies ----
FROM base AS dependencies
RUN npm ci
COPY . .
RUN npm run build

# ---- Release ----
FROM node:21.7.1-alpine AS release
WORKDIR /app
COPY --from=dependencies /app/package*.json ./
RUN npm ci --only=production
COPY --from=dependencies /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]