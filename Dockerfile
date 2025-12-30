# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm web:build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json for dependencies
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

# Install production dependencies (sharp needs to be installed here)
RUN pnpm install --prod --frozen-lockfile

# Copy built file
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/web/dist ./public

ENV PORT=3000
EXPOSE 3000
EXPOSE 3002

CMD ["node", "dist/app.cjs"]
