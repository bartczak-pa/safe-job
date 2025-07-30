# Safe Job Platform - Django Backend

Django REST API backend for the Safe Job Platform, built with Python 3.13 and Poetry.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# From the project root
docker-compose up --build

# Backend will be available at http://localhost:8000
```

### Local Development

```bash
# Install Poetry if not already installed
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install

# Copy environment file from the .envs directory
cp ../.envs/.env.example .env

# Run migrations (after DB is up)
poetry run python manage.py migrate

# Start development server
poetry run python manage.py runserver
```

## 🏗️ Architecture

### Technology Stack

- **Python 3.13** - Latest Python version
- **Django 5.2.4** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL 16 + PostGIS** - Database with geospatial support
- **Redis 7.4** - Caching and session storage
- **Poetry** - Dependency management

### Django Apps Structure
```
apps/
├── core/           # Shared utilities, base models
├── users/          # User management and authentication
├── candidates/     # Candidate profiles and management
├── employers/      # Employer profiles and verification
├── jobs/           # Job posting and management
├── applications/   # Job applications and workflow
├── documents/      # Document upload and management
├── messaging/      # Real-time messaging system
└── api_gateway/    # API management and documentation
```

## 🐳 Docker Configuration

### Services

- **backend** - Django application
- **db** - PostgreSQL with PostGIS
- **redis** - Redis for caching

### Development Features

- **Hot reload** - Code changes trigger automatic restart
- **Volume mounting** - Local code synced to container
- **Health checks** - Automatic service monitoring
- **Multi-stage builds** - Optimized image sizes

## 🛠️ Development Tools

### Code Quality

```bash
# Linting with Ruff
poetry run ruff check .

# Code formatting with Black
poetry run black .

# Type checking with MyPy
poetry run mypy .
```

### Testing

```bash
# Run tests
poetry run pytest

# Run tests with coverage
poetry run pytest --cov

# Run specific test
poetry run pytest apps/users/tests/
```

### Database Operations

```bash
# Create migrations
poetry run python manage.py makemigrations

# Apply migrations
poetry run python manage.py migrate

# Create superuser
poetry run python manage.py createsuperuser

# Load fixtures
poetry run python manage.py loaddata fixtures/sample_data.json
```

## 📚 API Documentation

Once running, API documentation is available at:

- **Swagger UI**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **ReDoc**: [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/)
- **OpenAPI Schema**: [http://localhost:8000/api/schema/](https://localhost:8000/api/schema/)

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.envs/.env.example`):

```bash
# Django
DEBUG=True
SECRET_KEY=your-secret-key
DJANGO_SETTINGS_MODULE=config.settings.development

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
RESEND_API_KEY=your-resend-key
```

### Settings Structure
```
config/settings/
├── __init__.py
├── base.py         # Common settings
├── development.py  # Development overrides
├── testing.py      # Test-specific settings
└── production.py   # Production settings
```

## 🚨 Health Checks

The backend includes health check endpoints:

- **Basic health**: `GET /health/`
- **Database health**: `GET /health/db/`
- **Redis health**: `GET /health/redis/`

## 📝 Logging

Logs are written to:

- Console (development)
- File: `logs/django.log`
- Structured JSON format in production

## 🔒 Security Features

- **CORS** configured for frontend integration
- **Rate limiting** on API endpoints
- **JWT authentication** for secure API access
- **Input validation** via DRF serializers
- **SQL injection protection** via Django ORM
- **XSS protection** via Django middleware

---

For more details, see the [main project documentation](../docs/).
