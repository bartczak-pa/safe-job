# CI/CD Pipeline

This document describes the continuous integration and deployment setup for the Safe Job Platform.

## GitHub Actions Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

The main CI/CD workflow that runs comprehensive tests and checks on every push and pull request.

**Triggers:**
- Push to `main`, `develop`, `feature/**`, `hotfix/**`
- Pull requests to `main`, `develop`

**Jobs:**

#### Test Job
- **Services**: PostgreSQL 16 + PostGIS, Redis 7.4
- **Python**: 3.13 with Poetry dependency management
- **System deps**: GDAL, GEOS, PostGIS libraries
- **Steps**:
  - Django system checks with deployment settings
  - Django test suite with parallel execution
  - Coverage report generation
  - Upload to Codecov

#### Lint Job
- **Tools**: Black, isort, Ruff, MyPy
- **Checks**:
    - Code formatting (Black)
    - Import sorting (isort)
    - Linting and code quality (Ruff)
    - Type checking (MyPy) - optional

#### Security Job
- **Tools**: Safety, Bandit
- **Checks**:
    - Dependency vulnerability scanning (Safety)
    - Code security analysis (Bandit)
    - Sensitive files detection

#### Build Job
- **Docker**: Multi-stage build with caching
- **Tests**: Full Docker Compose integration test
- **Verification**: Health checks and container tests

#### Documentation Job
- **Tool**: MkDocs with Material theme
- **Checks**: Build validation and structure verification

### 2. Quick Branch Protection (`.github/workflows/branch-protection.yml`)

Lightweight checks for fast feedback on basic repository structure.

**Checks:**

- Required files presence
- No sensitive files committed
- Repository structure validation

### 3. Documentation Deployment (`.github/workflows/docs.yml`)

Automatic deployment of documentation to GitHub Pages.

**Trigger**: Push to `main` branch
**Target**: GitHub Pages

## Environment Variables for CI

The CI pipeline uses these environment variables:

### Required GitHub Secrets

None currently required - all test configuration uses safe defaults.

### Optional GitHub Secrets

For enhanced functionality, you can add:

- `CODECOV_TOKEN` - For coverage reporting
- `SLACK_WEBHOOK` - For build notifications
- `DOCKER_REGISTRY_TOKEN` - For Docker image publishing

### Environment Variables in CI

```yaml
# Django settings
DJANGO_SETTINGS_MODULE: config.settings.test
SECRET_KEY: test-secret-key-for-ci-only-not-secure
DEBUG: False

# Database settings
POSTGRES_DB: safejob_test
POSTGRES_USER: safejob_test
POSTGRES_PASSWORD: test_password_ci

# Redis settings
REDIS_PASSWORD: test_redis_password_ci

# Test optimizations
ALLOWED_HOSTS: localhost,127.0.0.1,testserver
EMAIL_BACKEND: django.core.mail.backends.locmem.EmailBackend
CORS_ALLOW_ALL_ORIGINS: True
RATELIMIT_ENABLE: False
```

## Local Development Testing

To run the same checks locally:

### Install Development Dependencies

```bash
# Install dependencies (Recommended)
make install-deps

# Or manually
# cd backend
# poetry install --with dev
```

### Run Tests

```bash
# Run tests (Recommended)
make test

# With coverage (Recommended)
make test-coverage

# Or manually
# poetry run python manage.py test
# poetry run coverage run --source='.' manage.py test
# poetry run coverage report
```

### Code Quality Checks

```bash
# Format code (Recommended)
make format

# Run all linting (Recommended)
make lint

# Backend-specific linting (Recommended)
make lint-backend

# Or manually
# poetry run black .
# poetry run isort .
# poetry run ruff check .
# poetry run mypy .
```

### Security Scanning

```bash
# Security checks (Recommended)
make security-check

# Or manually
# poetry run safety check
# poetry run bandit -r .
```

### Docker Build Testing

```bash
# Build images (Recommended)
make docker-build

# Full integration test (Recommended)
make ci

# Or manually
# docker build -t safe-job-backend ./backend
# docker compose up -d --wait
# curl -f http://localhost:8000/health/
# docker compose exec backend python manage.py test
# docker compose down
```

## Branch Protection Rules

Recommended GitHub branch protection settings:

### For `main` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
  - `Quick Repository Checks`
  - `CI Success` (from CI/CD pipeline)
- ✅ Require branches to be up to date before merging
- ✅ Require signed commits
- ✅ Include administrators
- ✅ Allow force pushes (for emergency fixes)

### For `develop` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
  - `Quick Repository Checks`
  - `CI Success` (from CI/CD pipeline)
- ✅ Require branches to be up to date before merging

## Performance Optimizations

The CI pipeline includes several optimizations:

1. **Caching**: Poetry dependencies, pip packages, Docker layers
2. **Parallel Execution**: Django tests run in parallel
3. **Conditional Jobs**: Some jobs only run on specific events
4. **Fast Feedback**: Quick checks run first, comprehensive tests follow
5. **Docker BuildKit**: Advanced caching for Docker builds

## Monitoring and Notifications

- **GitHub Actions**: Built-in status reporting
- **Codecov**: Test coverage tracking
- **Branch Protection**: Prevents broken code from reaching main branches
- **Docker Health Checks**: Container monitoring in CI

## Troubleshooting

### Common CI Issues

1. **Test Failures**: Check the "Run Tests" job logs
2. **Linting Errors**: Run `black`, `isort`, `ruff` locally to fix
3. **Docker Build Issues**: Check environment variable configuration
4. **Documentation Build**: Validate MkDocs configuration and markdown syntax

### Performance Issues

1. **Slow Tests**: Check database queries and consider test optimizations
2. **Long CI Times**: Review caching strategy and job parallelization
3. **Docker Build Timeouts**: Optimize Dockerfile and use multi-stage builds
