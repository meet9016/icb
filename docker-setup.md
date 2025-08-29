# Docker Setup for Materialize Next.js Admin Template

This document provides instructions for setting up and running the Materialize Next.js Admin Template using Docker. The setup addresses the undocumented Radix UI dependencies required by the CMDK search functionality.

## Files Overview

1. **Dockerfile**: Optimized for the Materialize Next.js Admin Template with all dependencies properly installed
2. **docker-compose.yml**: Configuration for running the application with Docker Compose
3. **docker-entrypoint.sh**: Script to handle startup logic and ensure all dependencies are installed
4. **.dockerignore**: Optimized to exclude unnecessary files from the Docker build context

## Known Issue Addressed

The Materialize template has a search functionality that uses CMDK, which requires several Radix UI dependencies that aren't explicitly mentioned in the documentation. Our Docker setup automatically installs these missing dependencies:

- @radix-ui/react-dialog
- @radix-ui/react-slot
- @radix-ui/react-primitive
- @radix-ui/react-portal
- @radix-ui/react-use-controllable-state
- @radix-ui/react-compose-refs
- @radix-ui/react-presence

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup Instructions

1. Place all the provided Docker files in your Materialize Next.js Admin Template project root:
   - `Dockerfile`
   - `docker-compose.yml`
   - `docker-entrypoint.sh`
   - `.dockerignore`

2. Make the entrypoint script executable:
   ```bash
   chmod +x docker-entrypoint.sh
   ```

3. Build and start the Docker container:
   ```bash
   docker-compose up -d
   ```

4. Access the application at [http://localhost:3000](http://localhost:3000)

## Environment Configuration

The template uses environment variables for configuration. The docker-entrypoint script will automatically create a `.env` file from `.env.example` if one doesn't exist.

You can modify environment variables in the `docker-compose.yml` file:

```yaml
environment:
  - NODE_ENV=development
  - NEXT_TELEMETRY_DISABLED=1
  # Add any other environment variables here
```

## Development Workflow

The Docker setup mounts your project directory to the container, enabling a smooth development experience with live code reloading:

1. Make changes to your code on your host machine
2. The changes will be automatically detected and reflected in the running container
3. View the changes in real-time in your browser

## Troubleshooting

### If you encounter any dependency issues:

```bash
# Connect to the running container
docker exec -it materialize-nextjs-admin /bin/sh

# Install any missing dependencies manually
pnpm add [package-name]

# Restart the container
exit
docker-compose restart
```

### Rebuilding the container from scratch:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

This setup is optimized for development. For production deployment:

1. Modify the Dockerfile to build the application in production mode:
   ```dockerfile
   # For production
   RUN pnpm build
   CMD ["pnpm", "start"]
   ```

2. Update the environment variables in docker-compose.yml:
   ```yaml
   environment:
     - NODE_ENV=production
   ```

## Additional Information

- The Docker setup uses PNPM for faster and more efficient dependency management
- The Prisma client is automatically regenerated if the schema changes
- The setup includes persistent volumes for node_modules and the PNPM store to improve build performance
