# Stage 1: Install dependencies and build the application
FROM oven/bun:1 AS builder

WORKDIR /usr/src/monorepo

# Copy root package files for monorepo
COPY package.json bun.lock turbo.json ./

# Copy web app package.json
COPY apps/web/package.json ./apps/web/

# Install all dependencies
RUN bun install --frozen-lockfile

# Copy all source code
COPY . .

# Compile lingui (from web workspace)
RUN cd apps/web && bun run lingui:extract
RUN cd apps/web && bun run lingui:compile

# Build the web application using turbo
RUN bun run build

# Debug: Check what was built
RUN echo "=== Build output check ===" && \
    find apps/web -maxdepth 1 -type d -name ".*" 2>/dev/null | head -10 && \
    ls -la apps/web/ || true

# Stage 2: Create the slim production image
FROM oven/bun:1-slim AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy the built output (TanStack Start outputs to .output folder)
COPY --from=builder /usr/src/monorepo/apps/web/.output ./.output

# Copy necessary dependencies
COPY --from=builder /usr/src/monorepo/node_modules ./node_modules

# Copy compiled lingui messages
# COPY --from=builder /usr/src/monorepo/apps/web/src/locales ./src/locales
# COPY --from=builder /usr/src/monorepo/apps/web/src/routes/auth/-locales ./src/routes/auth/-locales
# COPY --from=builder /usr/src/monorepo/apps/web/src/routes/todos/-locales ./src/routes/todos/-locales
# COPY --from=builder /usr/src/monorepo/apps/web/src/routes/admin/-locales ./src/routes/admin/-locales
# COPY --from=builder /usr/src/monorepo/apps/web/src/routes/map/-locales ./src/routes/map/-locales
# COPY --from=builder /usr/src/monorepo/apps/web/src/routes/-locales ./src/routes/-locales

# Copy package.json for runtime
COPY --from=builder /usr/src/monorepo/apps/web/package.json ./package.json

# Expose port 3007
EXPOSE 3007

# Start the application using the start script from package.json
CMD ["bun", "run", "start"]