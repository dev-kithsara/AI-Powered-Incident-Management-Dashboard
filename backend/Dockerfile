# Build stage: install dependencies and generate Prisma client
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

# Runtime stage: keep only what is needed to run the app
FROM node:20-slim AS runtime

WORKDIR /app

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

EXPOSE 8000

CMD ["npm", "run", "dev"]
