# Use Debian slim — has OpenSSL 1.1 that Prisma needs
FROM node:20-slim

WORKDIR /app

# Install OpenSSL (required by Prisma query engine)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client for the current platform
RUN npx prisma generate

EXPOSE 8000

CMD ["npm", "run", "dev"]
