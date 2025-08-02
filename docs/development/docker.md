# Docker Development Guide

The Safe Job Platform uses a sophisticated Docker setup with multi-stage builds,
orchestrated services, and optimized development workflows. This guide covers
everything from basic usage to advanced container management.

## 🐳 Overview

Our Docker architecture provides:

- **Consistent Development Environment**: Same environment across all machines and CI/CD
- **Hot Reload & File Watching**: Instant feedback during development
- **Multi-Stage Builds**: Optimized containers for development and production
- **Service Orchestration**: Coordinated backend, frontend, database, and documentation services
- **Health Monitoring**: Built-in health checks for all services
- **Volume Optimization**: Efficient file mounting and dependency caching

## 📦 Container Architecture

### Service Overview

```mermaid
graph TD
    subgraph "Docker Compose Stack"
        FE[Frontend Container<br/>React 19 + Vite<br/>Port 3000]
        BE[Backend Container<br/>Django 5.2.4<br/>Port 8000]
        DB[(Database<br/>PostgreSQL 16 + PostGIS<br/>Port 5432)]
        REDIS[(Cache<br/>Redis 7.4<br/>Port 6379)]
        DOCS[Documentation<br/>MkDocs + Material<br/>Port 8001]

    subgraph "External Access"
        USER[Developer]
        BROWSER[Web Browser]
    end

    USER --> FE
    USER --> BE
    USER --> DOCS
    BROWSER --> FE
    FE --> BE
    BE --> DB
    BE --> REDIS
```

### Container Details

| Service           | Container          | Purpose                  | Ports     | Health Check                            |
| ----------------- | ------------------ | ------------------------ | --------- | --------------------------------------- |
| **Frontend**      | `safejob_frontend` | React development server | 3000:5173 | `curl -f http://localhost:3000/`        |
| **Backend**       | `safejob_backend`  | Django API server        | 8000:8000 | `curl -f http://localhost:8000/health/` |
| **Database**      | `safejob_db`       | PostgreSQL + PostGIS     | 5432:5432 | `pg_isready -U safejob -d safejob`      |
| **Redis**         | `safejob_redis`    | Cache and sessions       | 6379:6379 | `redis-cli ping`                        |
| **Documentation** | `safejob_docs`     | MkDocs server            | 8001:8001 | `curl -f http://localhost:8001/`        |

> **Note**: Port mapping format is `HOST_PORT:CONTAINER_PORT`. For example, `3000:5173` means host port 3000 maps to container port 5173 (Vite dev server).

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (v4.0+) or Docker Engine (v20.10+)
- Docker Compose (v2.0+)
- Git

### Starting the Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd safe-job

# Start all services
make dev

# Or use Docker Compose directly
docker compose up -d
```

**Services will be available at:**

- 🌐 **Frontend**: [http://localhost:3000](http://localhost:3000)
- 🔧 **Backend API**: [http://localhost:8000](http://localhost:8000)
- 📊 **Database**: localhost:5432
- 🔴 **Redis**: localhost:6379
- 📖 **Documentation**: [http://localhost:8001](http://localhost:8001)

### Stopping the Environment

```bash
# Stop all services
make stop

# Or use Docker Compose directly
docker compose down
```

## 🔧 Development Workflow

### Common Development Commands

```bash
# Start development environment
make dev

# View service status
make docker-logs

# Restart all services
make restart

# Clean shutdown with volume cleanup
make docker-clean

# Health check all services
make health

# Run tests in containers
make test

# Run backend tests only
make test-backend

# Run frontend tests only
make test-frontend

# Open shell in backend container
make shell

# Open shell in frontend container
make frontend-shell

# Database shell
make dbshell
```

### Service-Specific Operations

#### Backend Operations

```bash
# Django management commands
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py collectstatic

# Install new Python dependencies
docker compose exec backend poetry add <package>
docker compose exec backend poetry install

# Backend shell access
docker compose exec backend bash
docker compose exec backend python manage.py shell
```

#### Frontend Operations

```bash
# Node.js operations
docker compose exec frontend npm install <package>
docker compose exec frontend npm run build
docker compose exec frontend npm run lint

# Frontend shell access
docker compose exec frontend bash

# View frontend logs
docker compose logs -f frontend
```

#### Database Operations

```bash
# PostgreSQL shell
docker compose exec db psql -U safejob -d safejob

# Database backup
docker compose exec db pg_dump -U safejob safejob > backup.sql

# Database restore
docker compose exec -T db psql -U safejob safejob < backup.sql

# Database status
docker compose exec db pg_isready -U safejob -d safejob
```

#### Redis Operations

```bash
# Redis CLI
docker compose exec redis redis-cli

# Redis with password (if configured)
docker compose exec redis redis-cli -a "$REDIS_PASSWORD"

# Monitor Redis commands
docker compose exec redis redis-cli monitor

# Redis memory usage
docker compose exec redis redis-cli info memory
```

## 📁 Volume Management

### Volume Configuration

Our Docker setup uses several volume types for optimal performance:

```yaml
# docker-compose.yml volumes
volumes:
  # Backend development volumes
  - ./backend/apps:/app/apps # Hot reload
  - ./backend/config:/app/config # Configuration
  - ./backend/manage.py:/app/manage.py # Django management

  # Frontend development volumes
  - ./frontend/src:/app/src # Hot reload
  - ./frontend/public:/app/public # Static assets
  - frontend_node_modules:/app/node_modules # Performance optimization

  # Persistent data volumes
  - postgres_data:/var/lib/postgresql/data # Database persistence
  - redis_data:/data # Redis persistence
```

### Volume Types Explained

#### 1. **Bind Mounts** (Development Files)

```bash
./backend/apps:/app/apps
./frontend/src:/app/src
```

- **Purpose**: Enable hot reload and file watching
- **Behavior**: Changes on host immediately reflect in container
- **Performance**: Direct host filesystem access

#### 2. **Named Volumes** (Dependencies)

```bash
frontend_node_modules:/app/node_modules
postgres_data:/var/lib/postgresql/data
```

- **Purpose**: Optimize performance and persist data
- **Behavior**: Docker-managed, isolated from host
- **Performance**: Optimized for container access

#### 3. **File Mounts** (Configuration)

```bash
./frontend/vite.config.ts:/app/vite.config.ts
./backend/pyproject.toml:/app/pyproject.toml
```

- **Purpose**: Share specific configuration files
- **Behavior**: Individual file synchronization
- **Use Case**: Configuration that affects container behavior

### Volume Management Commands

```bash
# List all volumes
docker volume ls

# Inspect volume
docker volume inspect safejob_postgres_data

# Remove all project volumes (destructive!)
docker compose down -v

# Backup volumes
docker run --rm -v safejob_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v safejob_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 🏗️ Multi-Stage Docker Builds

### Backend Dockerfile Architecture

```dockerfile
# Base stage - Common dependencies
FROM python:3.13-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gdal-bin \
    && rm -rf /var/lib/apt/lists/*

# Development stage - Full tooling
FROM base AS development
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --with dev
COPY . .
EXPOSE 8000
CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]

# Runtime stage - Production optimized
FROM base AS runtime
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --only main
COPY . .
RUN poetry run python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["poetry", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Frontend Dockerfile Architecture

```dockerfile
# Builder stage - Asset compilation
FROM node:20-slim AS builder
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Development stage - Hot reload
FROM node:20-slim AS development
ENV NODE_ENV=development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Production stage - Nginx serving
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Building Specific Stages

```bash
# Build development images
docker compose build

# Build specific service
docker compose build backend

# Build production stage
docker build --target production -t safejob-frontend:prod ./frontend
docker build --target runtime -t safejob-backend:prod ./backend

# Build with cache
docker compose build --parallel
```

## 🔍 Health Checks & Monitoring

### Health Check Configuration

Each service includes comprehensive health checks:

```yaml
# Backend health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

# Frontend health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5173/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s

# Database health check
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-safejob} -d ${POSTGRES_DB:-safejob}"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### Monitoring Commands

```bash
# Check service health status
docker compose ps

# Detailed health information
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' safejob_backend

# Monitor service resources
docker stats

# Real-time service logs
docker compose logs -f

# Service-specific logs
docker compose logs -f backend frontend
```

### Health Check Endpoints

#### Backend Health Check (`/health/`)

```python
# apps/core/views.py
class HealthCheckView(APIView):
    def get(self, request):
        health_status = {
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'services': {
                'database': self._check_database(),
                'redis': self._check_redis(),
                'storage': self._check_storage(),
            }
        }
        return Response(health_status)
```

**Response Format:**

```json
{
  "status": "healthy",
  "timestamp": "2025-07-31T10:30:00Z",
  "services": {
    "database": true,
    "redis": true,
    "storage": true
  }
}
```

## 🚀 Performance Optimization

### Development Performance Tips

#### 1. **Volume Optimization**

```yaml
# Use named volumes for node_modules
volumes:
  - frontend_node_modules:/app/node_modules # Faster than bind mount
  - ./frontend/src:/app/src # Hot reload source code only
```

#### 2. **Selective File Watching**

```yaml
# Configure file watching patterns
develop:
  watch:
    - action: sync
      path: ./frontend/src
      target: /app/src
      ignore:
        - "**/*.test.*" # Ignore test files
        - "**/*.spec.*" # Ignore spec files
        - "**/node_modules/**" # Ignore dependencies
```

#### 3. **Build Cache Optimization**

```dockerfile
# Copy package files first for better layer caching
COPY package*.json ./
RUN npm install

# Copy source code after dependencies
COPY . .
```

#### 4. **Resource Limits**

```yaml
# Set appropriate resource limits
deploy:
  resources:
    limits:
      cpus: "0.5"
      memory: 512M
    reservations:
      cpus: "0.25"
      memory: 256M
```

### Build Performance

```bash
# Parallel builds
docker compose build --parallel

# Use BuildKit for advanced features
DOCKER_BUILDKIT=1 docker compose build

# Build with cache from registry
docker compose build --build-arg BUILDKIT_INLINE_CACHE=1
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. **Port Already in Use**

```bash
# Error: Port 3000 already in use
# Solution: Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different ports
docker compose -f docker-compose.override.yml up
```

#### 2. **Volume Permission Issues**

```bash
# Error: Permission denied
# Solution: Fix ownership
sudo chown -R $USER:$USER ./backend ./frontend

# Or run with correct user
docker compose exec --user $(id -u):$(id -g) backend bash
```

#### 3. **Database Connection Refused**

```bash
# Check if database container is running
docker compose ps db

# Check database logs
docker compose logs db

# Restart database service
docker compose restart db

# Test connection
docker compose exec db pg_isready -U safejob -d safejob
```

#### 4. **Frontend Build Failures**

```bash
# Clear node_modules volume
docker compose down
docker volume rm safejob_frontend_node_modules
docker compose up -d frontend

# Check for package conflicts
docker compose exec frontend npm ls
```

#### 5. **Memory Issues**

```bash
# Check container resource usage
docker stats

# Increase Docker Desktop memory (Preferences > Resources)
# Or set service limits
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

#### 6. **File Sync Issues**

```bash
# Force rebuild without cache
docker compose build --no-cache

# Check file permissions
ls -la ./backend ./frontend

# Restart Docker Desktop (macOS/Windows)
```

### Debugging Commands

```bash
# Inspect container configuration
docker inspect safejob_backend

# View container filesystem
docker compose exec backend ls -la /app

# Check environment variables
docker compose exec backend env

# Network debugging
docker network ls
docker network inspect safejob_network

# Volume debugging
docker volume ls
docker volume inspect safejob_postgres_data

# Container process list
docker compose exec backend ps aux
```

## 🔒 Security Considerations

### Development Security

#### 1. **Environment Variables**

```bash
# Use .env files for secrets
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)" > .envs/.env.development.local
echo "REDIS_PASSWORD=$(openssl rand -base64 32)" >> .envs/.env.development.local
```

#### 2. **Container Security**

```dockerfile
# Run as non-root user
RUN addgroup --system appgroup && adduser --system --group appuser
USER appuser

# Remove package managers in production
RUN apt-get purge -y --auto-remove build-essential

# Use specific versions
FROM python:3.13.1-slim AS base
```

#### 3. **Network Security**

```yaml
# Restrict service communication
networks:
  default:
    driver: bridge
    internal: true # Prevent external access
```

#### 4. **Volume Security**

```yaml
# Use read-only mounts where possible
volumes:
  - ./config:/app/config:ro # Read-only configuration
```

### Security Scanning

```bash
# Scan images for vulnerabilities
docker scout cves safejob_backend:latest

# Use Trivy for comprehensive scanning
trivy image safejob_backend:latest

# Check for secrets in images
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd):/workspace \
  trufflesecurity/trufflehog:latest docker --image safejob_backend:latest
```

## 📊 Monitoring & Logging

### Container Logging

```bash
# View all service logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# Service-specific logs
docker compose logs backend
docker compose logs --tail=100 frontend

# Save logs to file
docker compose logs > docker-logs.txt

# JSON formatted logs
docker compose logs --json > logs.json
```

### Log Configuration

```yaml
# Configure logging driver
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Metrics Collection

```bash
# Resource monitoring
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Container events
docker events --filter container=safejob_backend

# System information
docker system df
docker system info
```

## 🔄 Development Workflows

### Hot Reload Configuration

#### Backend Hot Reload

```python
# Django development server with automatic reload
WSGI_APPLICATION = 'config.wsgi.application'
DEBUG = True

# File watching patterns
INSTALLED_APPS = [
    'django.contrib.staticfiles',
    # ... other apps
]
```

#### Frontend Hot Reload

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true, // Required for Docker
    },
    hmr: {
      port: 5173,
    },
  },
});
```

### File Watching Best Practices

1. **Exclude Unnecessary Files**

   ```yaml
   volumes:
     - ./src:/app/src
     - /app/src/node_modules # Exclude node_modules
   ```

2. **Use Polling for Containers**

   ```javascript
   // webpack.config.js
   module.exports = {
     watchOptions: {
       poll: 1000,
       ignored: /node_modules/,
     },
   };
   ```

3. **Optimize Watch Patterns**
   ```yaml
   develop:
     watch:
       - action: sync
         path: ./src
         target: /app/src
         ignore:
           - "**/*.test.*"
           - "**/__pycache__/**"
   ```

## 📚 Advanced Usage

### Custom Docker Compose Configurations

#### Development Override

```yaml
# docker-compose.override.yml
version: "3.8"
services:
  backend:
    environment:
      - DEBUG=1
      - LOG_LEVEL=DEBUG
    volumes:
      - ./debug:/app/debug

  frontend:
    environment:
      - VITE_DEV_MODE=true
    ports:
      - "3001:5173" # Alternative port
```

#### Production Configuration

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  backend:
    build:
      target: runtime
    environment:
      - DEBUG=0
    restart: unless-stopped

  frontend:
    build:
      target: production
    restart: unless-stopped
```

### Multi-Environment Setup

```bash
# Development
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Testing
docker compose -f docker-compose.yml -f docker-compose.test.yml up

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Container Orchestration

#### Service Dependencies

```yaml
services:
  backend:
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
```

#### Scaling Services

```bash
# Scale frontend instances
docker compose up --scale frontend=3

# Scale with load balancer
docker compose -f docker-compose.yml -f docker-compose.scale.yml up
```

---

This Docker setup provides a robust, flexible, and production-ready containerization strategy that supports both development efficiency and production scalability. The multi-stage builds, comprehensive health checks, and optimized volume management ensure a smooth development experience while maintaining security and performance standards.
