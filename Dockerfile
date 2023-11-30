# Base
FROM node:20-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . /app

# Prod Deps
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run ts:build

FROM gcr.io/distroless/nodejs20-debian11

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/src/public /app/dist/public
COPY --from=build /app/src/views /app/dist/views
COPY --from=build /app/package.json /app/package.json

WORKDIR /app

ENV PORT=3000
ENV NODE_ENV='prod'
EXPOSE 3000

CMD ["dist/index.js"]