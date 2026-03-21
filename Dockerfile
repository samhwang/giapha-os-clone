################
# Build assets #
################
FROM node:24.14 AS build
WORKDIR /app

# Install global node modules: pnpm
RUN npm install -g pnpm@10.18
ENV PNPM_ARGS="--frozen-lockfile --ignore-scripts"

# Install Node modules
COPY package.json pnpm-lock.yaml ./
RUN pnpm install ${PNPM_ARGS}

# Generate Prisma client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm prisma generate

COPY . .

ENV NODE_ENV=production
ARG DEPLOYMENT_ENV=node
ENV DEPLOYMENT_ENV=${DEPLOYMENT_ENV}
RUN pnpm run build
RUN pnpm install --production ${PNPM_ARGS}

####################
# Production image #
####################
FROM node:24.14-slim AS production
WORKDIR /app

RUN set -xe && \
    apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /usr/share/man/* /usr/share/doc/*

COPY --chown=node:node --from=build /app/.output /app/.output
COPY --chown=node:node --from=build /app/node_modules /app/node_modules

RUN mkdir -p /app/uploads && chown node:node /app/uploads
VOLUME /app/uploads

USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "/app/.output/server/index.mjs"]
