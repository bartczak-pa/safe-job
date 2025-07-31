# Quick Start Guide

Get up and running with the Safe Job Platform development environment in minutes using our automated setup and Makefile commands.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Git** - Version control system
- **Docker & Docker Compose** - Containerization platform
- **Make** - Build automation (usually pre-installed on Linux/Mac)

## ⚡ Quick Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd safe-job
```

### 2. Automated Environment Setup

```bash
# Run the automated setup script (creates secure passwords and environment)
make setup
```

This command will:
- Generate secure passwords for PostgreSQL and Redis
- Create `.envs/.env.development.local` with proper configuration
- Build and start all Docker services
- Verify that all services are healthy

### 3. Verify Installation

```bash
# Check all services are running and healthy
make health
```

You should see:
- ✅ Backend API responding
- ✅ Database ready and accepting connections
- ✅ Redis responding with authentication
- ✅ Documentation server running

### 4. Access the Application

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | [http://localhost:8000](http://localhost:8000) | Django REST API |
| **API Health Check** | [http://localhost:8000/health/](http://localhost:8000/health/) | Service status |
| **Documentation** | [http://localhost:8001/safe-job/](http://localhost:8001/safe-job/) | Project documentation |
| **PostgreSQL** | `localhost:5432` | Database with PostGIS |
| **Redis** | `localhost:6379` | Caching and sessions |

## 🛠️ Development Commands

### Essential Makefile Commands

```bash
# Show all available commands
make help

# Development environment
make dev            # Start development environment
make health         # Check health of all services
make clean          # Stop and clean up environment

# Testing
make test           # Run Django tests
make ci             # Run full CI checks locally

# Code quality
make lint           # Run all linting checks
make format         # Format code with Black and isort
make install-hooks  # Install pre-commit hooks
make run-hooks      # Run pre-commit hooks on all files

# Django management
make migrate        # Run database migrations
make shell          # Open Django shell in container
make superuser      # Create Django superuser

# Documentation
make docs-serve     # Start documentation server
make docs-build     # Build documentation
make docs-stop      # Stop documentation server
```

### Running Tests

```bash
# Run Django tests
make test

# Or run tests directly in container
docker compose exec backend python manage.py test

# Run specific test
docker compose exec backend python manage.py test apps.core.tests.HealthCheckTestCase

# Run tests with coverage
docker compose exec backend coverage run --source='.' manage.py test
docker compose exec backend coverage report
```

### Code Quality and Pre-commit

```bash
# Install pre-commit hooks (one-time setup)
make install-hooks

# Run all code quality checks
make lint

# Format code
make format

# Run pre-commit hooks manually
make run-hooks
```

The pre-commit hooks will automatically:
- Format code with Black
- Sort imports with isort
- Lint with Ruff
- Run security checks with Bandit
- Validate YAML files
- Check for merge conflicts

### Database Operations

```bash
# Run migrations
make migrate

# Create new migration
docker compose exec backend python manage.py makemigrations

# Access Django shell
make shell

# Create superuser
make superuser

# Access database directly
docker compose exec db psql -U safejob -d safejob
```

## 📁 Project Structure

```
safe-job/
├── backend/                    # Django REST API
│   ├── apps/                  # Django applications
│   │   └── core/             # Core app with health checks
│   ├── config/               # Django settings
│   │   ├── settings/         # Environment-specific settings
│   │   └── wsgi.py          # WSGI configuration
│   ├── Dockerfile           # Backend container definition
│   └── pyproject.toml       # Python dependencies (Poetry)
├── docs/                      # MkDocs documentation
│   ├── getting-started/      # Setup and workflow guides
│   ├── development/          # Development documentation
│   ├── architecture/         # System design docs
│   ├── business/            # Business requirements
│   ├── phases/              # Implementation phases
│   ├── Dockerfile           # Documentation container
│   └── requirements.txt # Documentation dependencies
├── .envs/                     # Environment configurations
│   ├── .env.example         # Template for all environments
│   ├── .env.development.local # Active development config
│   └── .env.test            # CI/CD testing config
├── .github/workflows/         # GitHub Actions CI/CD
├── scripts/                   # Setup and utility scripts
├── docker-compose.yml         # Development environment
├── Makefile                   # Development commands
├── mkdocs.yml                # Documentation configuration
├── .pre-commit-config.yaml   # Code quality hooks
└── requirements.txt      # Documentation dependencies
```

## 🔧 Common Development Tasks

### Adding New Dependencies

**Backend (Python with Poetry):**
```bash
# Add new dependency
docker compose exec backend poetry add package-name

# Add development dependency
docker compose exec backend poetry add --group dev package-name

# Update pyproject.toml and rebuild
docker compose build backend
```

### Working with Django Apps

```bash
# Create new Django app
docker compose exec backend python manage.py startapp app_name

# Create and run migrations
docker compose exec backend python manage.py makemigrations
make migrate

# Access Django admin
# First create superuser: make superuser
# Then visit: http://localhost:8000/admin/
```

### Environment Management

```bash
# Reset development environment
make clean
make setup

# Update environment variables
# Edit .envs/.env.development.local
# Then restart: make dev
```

### Docker Operations

```bash
# View logs
docker compose logs backend
docker compose logs db
docker compose logs docs

# Rebuild specific service
docker compose build backend --no-cache
docker compose up -d backend

# Clean Docker resources
docker system prune -f
```

### Database Management

```bash
# Reset database (WARNING: destroys all data)
docker compose down -v
make setup

# Create database backup
docker compose exec db pg_dump -U safejob safejob > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose exec -T db psql -U safejob safejob < backup_file.sql
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Check what's using the ports
lsof -i :8000  # Backend
lsof -i :8001  # Documentation
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Stop the services and restart
make clean
make dev
```

**Environment File Issues:**
```bash
# Regenerate environment with secure passwords
make clean-env
make setup
```

**Docker Permission Issues (Linux):**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in

# Or fix file permissions
sudo chown -R $USER:$USER .
```

**Database Connection Issues:**
```bash
# Check service health
make health

# Restart database
docker compose restart db

# Check database logs
docker compose logs db

# Verify environment variables
cat .envs/.env.development.local | grep POSTGRES
```

**Pre-commit Hook Issues:**
```bash
# Reinstall hooks
make install-hooks

# Skip hooks temporarily (not recommended)
git commit --no-verify
```

**Build Failures:**
```bash
# Clean rebuild all services
make clean
docker system prune -f
make setup
```

**Documentation Not Loading:**
```bash
# Restart documentation service
make docs-stop
make docs-serve

# Check documentation logs
docker compose logs docs
```

### Health Check Commands

```bash
# Check all services
make health

# Individual service checks
curl http://localhost:8000/health/          # Backend API
curl http://localhost:8001/safe-job/        # Documentation
docker compose exec db pg_isready -U safejob -d safejob  # Database
```

### Getting Help

1. **Run health check**: `make health` to see service status
2. **Check logs**: `docker compose logs [service-name]`
3. **Verify environment**: `cat .envs/.env.development.local`
4. **Reset environment**: `make clean && make setup`
5. **Check documentation**: Browse to [http://localhost:8001/safe-job/](http://localhost:8001/safe-job/)

## 📚 Next Steps

Once you have the development environment running:

1. **Explore the codebase** - Familiarize yourself with the Django backend structure
2. **Review the architecture** - Read the [System Architecture](../architecture/architecture.md) documentation
3. **Understand the development process** - Check [Code Quality](../development/code-quality.md) and [Testing](../development/testing.md) guides
4. **Check the project plan** - Understand the development phases in [Project Plan](../plan.md)
5. **Start developing** - Begin with [Phase 2 Authentication](../phases/phase-2-authentication.md) tasks

## 🔄 Keeping Up to Date

```bash
# Pull latest changes
git pull origin develop

# Update environment and rebuild
make clean
make setup

# Update documentation dependencies
pip install -r docs/requirements.txt
make docs-serve
```

## ⚡ Quick Command Reference

```bash
# Essential commands
make setup       # Initial setup
make dev         # Start development
make health      # Check service status
make test        # Run tests
make lint        # Code quality checks
make clean       # Stop and cleanup

# Development workflow
make install-hooks  # Setup pre-commit
make format        # Format code
make migrate       # Run migrations
make shell         # Django shell
make docs-serve    # Start docs
```

---

🎉 **You're now ready to start developing!**

Visit the documentation at [http://localhost:8001/safe-job/](http://localhost:8001/safe-job/) for detailed guides and proceed to [Phase 2 Authentication](../phases/phase-2-authentication.md) to begin implementation.
