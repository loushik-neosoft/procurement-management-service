FROM node:20-alpine AS builder


WORKDIR /usr/src/app

# Install build tools for native dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --skipLibCheck
RUN npx tsc prisma.config.ts --module commonjs --target es2020 --esModuleInterop --skipLibCheck
RUN mv prisma.config.js prisma.config.build.js
RUN echo 'module.exports = require("./prisma.config.build.js").default;' > prisma.config.js

# Prune dev dependencies to keep image small
RUN npm prune --production

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Copy built node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy compiled prisma config
COPY --from=builder /usr/src/app/prisma.config.build.js ./
COPY --from=builder /usr/src/app/prisma.config.js ./

# Copy built files from builder
COPY --from=builder /usr/src/app/dist ./dist
# Copy generated prisma client
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && npm start"]
