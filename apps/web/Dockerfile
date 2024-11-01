# src Dockerfile: https://github.com/vercel/turbo/blob/main/examples/with-docker/apps/web/Dockerfile
# setup pnpm on the alpine base
FROM node:22-alpine AS base
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@9
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g turbo@2

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /src
RUN corepack enable
COPY . .
RUN turbo prune web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /src

# First install the dependencies (as they change less often)
COPY --from=builder /src/out/json/ .
COPY --from=builder /src/out/pnpm-lock.yaml ./pnpm-lock.yaml
# COPY --from=builder /src/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
# RUN pnpm install
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /src/out/full/ .
COPY turbo.json turbo.json
RUN turbo run build --filter=web

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# use alpine as the thinest image
FROM base AS runner
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /src/apps/web/next.config.js .
COPY --from=installer /src/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /src/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /src/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /src/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
