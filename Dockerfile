#Build the image and listen on port 3000
FROM node:21-bookworm AS base

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./



# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

#COPY --from=deps /app/node_modules ./node_modules
COPY .next ./.next
COPY public ./public

#RUN npm i


# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
#COPY ../public ./public

#RUN npm run build
#RUN npm run seed

  #if [ -f yarn.lock ]; then yarn run build; \
  #elif [ -f package-lock.json ]; then npm run build; \
  #elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  #else echo "Lockfile not found." && exit 1; \
  #fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
RUN npm i sharp

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next
RUN chown nextjs:nodejs public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN chown -R nextjs /app/node_modules/appdynamics

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node -r /app/public/instrumentation.appd.js server.js