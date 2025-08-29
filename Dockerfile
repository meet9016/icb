# Use Node.js LTS base image with Alpine for smaller size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
  openssl \
  git \
  python3 \
  make \
  g++ \
  libc6-compat

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./

# Copy specific directories needed for postinstall scripts
COPY src/prisma ./src/prisma
COPY src/assets ./src/assets
COPY tailwind.config.ts postcss.config.mjs tsconfig.json ./

# Install dependencies with frozen lockfile for reproducibility
# RUN pnpm install --frozen-lockfile

# Install additional required packages that might be missing from documentation
RUN pnpm add \
  cmdk \
  @radix-ui/react-dialog \
  @radix-ui/react-slot \
  @radix-ui/react-primitive \
  @radix-ui/react-portal \
  @radix-ui/react-use-controllable-state \
  @radix-ui/react-compose-refs \
  @radix-ui/react-presence

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

# Run the postinstall script to generate Prisma client and build icons
RUN pnpm postinstall

# Copy the rest of the codebase
COPY . .

# Create .env from example if it doesn't exist
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Expose the development port
EXPOSE 3000

# Start Next.js in development mode with Turbopack
CMD ["pnpm", "dev"]
