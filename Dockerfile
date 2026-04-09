################
# Build assets #
################
FROM oven/bun:1 AS build
WORKDIR /app

ENV BUN_INSTALL_ARGS="--frozen-lockfile --ignore-scripts"

# Install dependencies
COPY package.json bun.lock ./
RUN bun install ${BUN_INSTALL_ARGS}

# Generate Prisma client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN bun prisma generate

COPY . .

ENV NODE_ENV=production
ARG DEPLOYMENT_ENV=bun
ENV DEPLOYMENT_ENV=${DEPLOYMENT_ENV}
RUN bun run build
RUN bun install --production ${BUN_INSTALL_ARGS}

####################
# Production image #
####################
FROM oven/bun:1-slim AS production
WORKDIR /app

RUN set -xe && \
    apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /usr/share/man/* /usr/share/doc/*

COPY --chown=bun:bun --from=build /app/.output /app/.output
COPY --chown=bun:bun --from=build /app/node_modules /app/node_modules

RUN mkdir -p /app/uploads && chown bun:bun /app/uploads
VOLUME /app/uploads

USER bun
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "/app/.output/server/index.mjs"]
