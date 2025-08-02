# Development Setup Guide

This guide will help you set up the Safe Job Platform for local development.

## Prerequisites

- **Docker** and **Docker Compose** (for container development)
- **Python 3.13+** (for local development)
- **Poetry** (Python dependency management)
- **Git** (version control)

## Quick Start (Docker Development)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd safe-job-platform
```

### 2. Set Up Environment

```bash
# Run the automated setup script (Recommended)
make setup
```

This script will:

- Generate secure passwords for development
- Create `.envs/.env.development.local` with secure configuration
- Create compatibility symlink at `.env`
- Start and verify all Docker services

### 3. Verify Setup

```bash
# Check all services are healthy (Recommended)
make health

# Or manually check individual services
docker compose ps
curl http://localhost:8000/health/

# Run Django tests (Recommended)
make test
```

## Services

After setup, these services will be available:

| Service       | URL                   | Purpose                     |
| ------------- | --------------------- | --------------------------- |
| Backend API   | http://localhost:8000 | Django REST API             |
| PostgreSQL    | localhost:5432        | Database with PostGIS       |
| Redis         | localhost:6379        | Caching and sessions        |
| Documentation | http://localhost:8001 | MkDocs documentation server |

## Local Python Development (Alternative)

If you prefer local Python development instead of Docker:

### 1. Install Poetry

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

### 2. Install Dependencies

```bash
cd backend
poetry install --with dev
```

### 3. Set Up Database

```bash
# Start only database services
docker compose up db redis -d

# Run migrations (Recommended)
make migrate

# Create superuser (Recommended)
make superuser

# Or manually with poetry
# poetry run python manage.py migrate
# poetry run python manage.py createsuperuser
```

### 4. Run Development Server

```bash
poetry run python manage.py runserver
```

## Code Quality Setup

### Install Pre-commit Hooks

```bash
# Install and test hooks (Recommended)
make install-hooks
make run-hooks

# Or manually install
# pip install pre-commit
# pre-commit install
# pre-commit run --all-files
```

### Manual Code Quality Checks

```bash
# Format code (Recommended)
make format

# Run all linting (Recommended)
make lint

# Backend-specific linting (Recommended)
make lint-backend

# Security checks (Recommended)
make security-check

# Or run individual tools manually
# cd backend
# poetry run black .
# poetry run isort .
# poetry run ruff check .
# poetry run mypy .
# poetry run safety check
# poetry run bandit -r .
```

## Testing

### Run All Tests

```bash
# Run tests (Recommended)
make test

# Run tests locally with Poetry (Alternative)
make test-local

# Run tests with coverage (Recommended)
make test-coverage

# Or manually in Docker
# docker compose exec backend python manage.py test
```

### Run Specific Tests

```bash
# Test specific app (in Docker)
docker compose exec backend python manage.py test apps.core

# Test specific class (in Docker)
docker compose exec backend python manage.py test apps.core.tests.HealthCheckTestCase

# Run with coverage (Recommended)
make test-coverage

# Or manually with poetry
# poetry run coverage run --source='.' manage.py test
# poetry run coverage report
# poetry run coverage html
```

### Test Settings

Tests use the `config.settings.test` module which:

- Uses in-memory SQLite with Spatialite for speed
- Disables logging for cleaner output
- Uses in-memory caching
- Disables migrations for faster startup

## Environment Variables

### Development Environment

Located at `.envs/.env.development.local`:

```bash
# Django
DEBUG=True
SECRET_KEY=<generated-secure-key>
DJANGO_SETTINGS_MODULE=config.settings.development

# Database
POSTGRES_DB=safejob
POSTGRES_USER=safejob
POSTGRES_PASSWORD=<generated-secure-password>

# Redis
REDIS_PASSWORD=<generated-secure-password>
```

### Environment Files Structure

```
.envs/
├── .env.example                # Template with all options
├── .env.development.template   # Development template
├── .env.development.local      # Active development (gitignored)
├── .env.test                   # CI/CD testing
└── .env.production            # Production template
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following Django and project conventions
- Add tests for new functionality
- Update documentation if needed

### 3. Test Locally

```bash
# Run tests (Recommended)
make test

# Check code quality (Recommended)
make lint

# Run all CI checks locally (Recommended)
make ci

# Or manually
# pre-commit run --all-files
# docker compose build backend
```

### 4. Commit and Push

```bash
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature-name
```

The pre-commit hooks will automatically:

- Format code with Black
- Sort imports with isort
- Lint with Ruff
- Run security checks with Bandit
- Validate Django configuration

### 5. Create Pull Request

- GitHub Actions will automatically run CI/CD pipeline
- All checks must pass before merging
- Request review from team members

## Development Commands (Makefile)

The project includes a comprehensive Makefile with shortcuts for common tasks:

```bash
# Show all available commands
make help

# Development workflow
make setup          # Initial setup with secure passwords
make dev            # Start development environment
make test           # Run Django tests
make lint           # Run all code quality checks
make health         # Check if all services are running

# Code quality
make format         # Format code with Black and isort
make run-hooks      # Run pre-commit hooks
make install-hooks  # Install pre-commit hooks

# Django management
make migrate        # Run database migrations
make shell          # Open Django shell
make superuser      # Create superuser

# Docker operations
make docker-build   # Build images
make docker-up      # Start services
make docker-down    # Stop services

# Documentation
make docs-serve     # Serve docs locally
```

## Useful Commands

### Docker Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f db

# Execute commands in containers
docker compose exec backend python manage.py shell
docker compose exec backend python manage.py migrate
docker compose exec db psql -U safejob -d safejob

# Rebuild services
docker compose build --no-cache backend
docker compose up -d --force-recreate backend
```

### Django Commands

```bash
# Database operations (Recommended make commands)
make migrate                    # Run migrations
make makemigrations            # Create migrations
make shell                     # Django shell
make superuser                 # Create superuser

# Or manual Docker commands
# docker compose exec backend python manage.py makemigrations
# docker compose exec backend python manage.py migrate
# docker compose exec backend python manage.py flush
# docker compose exec backend python manage.py shell
# docker compose exec backend python manage.py dbshell
# docker compose exec backend python manage.py check
# docker compose exec backend python manage.py collectstatic
# docker compose exec backend python manage.py createsuperuser
```

### Poetry Commands

```bash
# Dependency management
poetry add django-package-name
poetry add --group dev pytest-package
poetry update
poetry show --tree

# Environment management
poetry shell
poetry run python manage.py command
poetry install --only=main  # Production dependencies only
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `docker-compose.yml` if 8000, 5432, or 6379 are in use
2. **Permission errors**: Check Docker permissions and user groups
3. **Database connection errors**: Ensure PostgreSQL service is healthy
4. **Import errors**: Verify Poetry dependencies are installed

### Reset Development Environment

```bash
# Reset everything (Recommended)
make reset

# Or manually
# docker compose down -v
# rm .envs/.env.development.local .env
# make setup
```

### Performance Issues

1. **Slow tests**: Use `--parallel` flag or check database queries
2. **Slow Docker builds**: Enable BuildKit with `DOCKER_BUILDKIT=1`
3. **Large Docker images**: Review Dockerfile multi-stage builds

## IDE Setup

### VS Code Extensions

Recommended extensions for development:

- **Python** - Python language support
- **Django** - Django template and model support
- **Docker** - Docker container management
- **GitLens** - Enhanced Git capabilities
- **Ruff** - Python linting
- **Black Formatter** - Code formatting

### PyCharm Configuration

1. Configure Python interpreter to use Poetry virtual environment
2. Set Django settings module: `config.settings.development`
3. Configure database connection to local PostgreSQL
4. Enable Django support in project settings

## Next Steps

After successful setup:

1. 📖 Read the [Architecture Documentation](../architecture/architecture.md)
2. 🏗️ Review the [API Documentation](../api/overview.md)
3. 🧪 Explore the [Testing Guide](testing.md)
4. 🚀 Check out the [Deployment Guide](deployment.md)
