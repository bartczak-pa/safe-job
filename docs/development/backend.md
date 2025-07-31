# Backend Development Guide

The Safe Job Platform backend is built with Django 5.2.4, PostgreSQL with PostGIS, and modern Python development tools for a robust, scalable, and maintainable API system.

## 🏗️ Technology Stack

### Core Framework
- **Django 5.2.4**: Latest Django with async support and modern features
- **Django REST Framework**: Powerful toolkit for building Web APIs
- **Python 3.13**: Latest Python with enhanced type annotations and performance

### Database & Storage
- **PostgreSQL 16**: Advanced open-source relational database
- **PostGIS Extension**: Geospatial support for location-based matching
- **Redis 7.4**: High-performance in-memory data structure store

### Development Tools
- **Poetry**: Modern dependency management and packaging
- **Ruff**: Lightning-fast Python linter and formatter
- **Black**: Uncompromising code formatter
- **MyPy**: Static type checker for Python
- **Bandit**: Security linter for Python code

### API & Documentation
- **drf-spectacular**: Auto-generated OpenAPI 3.0 documentation
- **django-cors-headers**: CORS handling for frontend integration
- **django-ratelimit**: Rate limiting for API protection

## 📁 Project Structure

```
backend/
├── apps/                      # Django applications
│   ├── core/                  # ✅ Shared utilities, base models
│   ├── users/                 # 🚧 User management, authentication (Phase 2)
│   ├── candidates/            # 🚧 Candidate profiles (Phase 3)
│   ├── employers/             # 🚧 Employer profiles (Phase 3)
│   ├── jobs/                  # 🚧 Job posting and management (Phase 3)
│   ├── applications/          # 🚧 Job applications (Phase 4)
│   ├── messaging/             # 🚧 Real-time communication (Phase 5)
│   └── documents/             # 🚧 File upload and management (Phase 6)
├── config/                    # Django project configuration
│   ├── settings/              # Environment-specific settings
│   │   ├── base.py           # Base settings
│   │   ├── development.py    # Development settings
│   │   ├── test.py           # Testing settings
│   │   └── production.py     # Production settings
│   ├── urls.py               # URL routing
│   ├── wsgi.py               # WSGI configuration
│   └── asgi.py               # ASGI configuration (for async/WebSocket)
├── static/                    # Static files
├── media/                     # Media files
├── tests/                     # Test files
├── pyproject.toml            # Poetry configuration and dependencies
├── poetry.lock               # Lock file for exact dependency versions
├── manage.py                 # Django management script
└── Dockerfile                # Multi-stage Docker build
```

## 🚀 Getting Started

### Prerequisites
- Python 3.13+
- Poetry (for dependency management)
- Docker and Docker Compose (for containerized development)
- PostgreSQL 16+ with PostGIS (if running locally)

### Development Environment

#### Option 1: Docker Development (Recommended)
```bash
# Start the entire development stack
make dev

# Backend API will be available at http://localhost:8000
# Admin interface at http://localhost:8000/admin/
# API documentation at http://localhost:8000/api/schema/swagger-ui/
```

#### Option 2: Local Development
```bash
cd backend

# Install dependencies
poetry install --with dev

# Set up environment variables
cp .env.example .env.local

# Run migrations
poetry run python manage.py migrate

# Create superuser
poetry run python manage.py createsuperuser

# Start development server
poetry run python manage.py runserver
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `poetry run python manage.py runserver` | Start development server |
| `poetry run python manage.py migrate` | Run database migrations |
| `poetry run python manage.py makemigrations` | Create new migrations |
| `poetry run python manage.py test` | Run test suite |
| `poetry run python manage.py shell` | Open Django shell |
| `poetry run python manage.py collectstatic` | Collect static files |
| `poetry run python manage.py createsuperuser` | Create admin user |

## ⚙️ Configuration Management

### Settings Architecture

The project uses environment-specific settings for better configuration management:

```python
# config/settings/base.py - Common settings
import os

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',  # PostGIS support

    # Third-party apps
    'rest_framework',
    'corsheaders',
    'drf_spectacular',

    # Local apps
    'apps.core',
    # Additional apps will be added in future phases
]

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('POSTGRES_DB', 'safejob'),
        'USER': os.environ.get('POSTGRES_USER', 'safejob'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
```

### Environment Variables

```bash
# Database Configuration
POSTGRES_DB=safejob
POSTGRES_USER=safejob
POSTGRES_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
DJANGO_SETTINGS_MODULE=config.settings.development
SECRET_KEY=your_secret_key
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
CACHE_URL=redis://localhost:6379/1

# Email Configuration (for future magic link auth)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=your_resend_api_key
```

## 🏛️ Django App Architecture

### Core App (✅ Implemented)

The `apps.core` module provides shared functionality across the platform:

#### Base Models
```python
# apps/core/models.py
from django.db import models
from django.contrib.auth import get_user_model
import uuid

class BaseModel(models.Model):
    """Base model with common fields for all models."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class AuditableModel(BaseModel):
    """Model with audit trail capabilities."""
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_%(class)s'
    )
    updated_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_%(class)s'
    )

    class Meta:
        abstract = True
```

#### Health Check System
```python
# apps/core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connections
from django.core.cache import cache
from django.utils import timezone

class HealthCheckView(APIView):
    """Health check endpoint for monitoring."""

    def get(self, request):
        health_status = {
            'status': 'healthy',
            'service': 'safe-job-backend',
            'version': '0.1.0',
            'timestamp': timezone.now().isoformat(),
            'checks': {
                'database': self._check_database(),
                'cache': self._check_cache(),
            }
        }

        # Determine overall health
        all_healthy = all(health_status['checks'].values())
        if not all_healthy:
            health_status['status'] = 'unhealthy'
            return Response(health_status, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(health_status, status=status.HTTP_200_OK)

    def _check_database(self):
        try:
            connection = connections['default']
            connection.cursor().execute('SELECT 1')
            return True
        except Exception:
            return False

    def _check_cache(self):
        try:
            cache.set('health_check', 'ok', 60)
            return cache.get('health_check') == 'ok'
        except Exception:
            return False
```

#### Utility Functions
```python
# apps/core/utils.py
import re
from typing import Optional
from django.core.exceptions import ValidationError

def validate_dutch_postal_code(value: str) -> None:
    """Validate Dutch postal code format (1234 AB)."""
    pattern = r'^\d{4}\s?[A-Za-z]{2}$'
    if not re.match(pattern, value):
        raise ValidationError('Invalid Dutch postal code format')

def validate_kvk_number(value: str) -> None:
    """Validate Dutch KvK (Chamber of Commerce) number."""
    # Remove spaces and validate format
    cleaned = re.sub(r'\s', '', value)
    if not re.match(r'^\d{8}$', cleaned):
        raise ValidationError('KvK number must be 8 digits')

def normalize_phone_number(phone: str) -> Optional[str]:
    """Normalize phone number to international format."""
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)

    # Handle Dutch numbers
    if digits.startswith('0') and len(digits) == 10:
        return f'+31{digits[1:]}'
    elif digits.startswith('31') and len(digits) == 11:
        return f'+{digits}'

    return None
```

### URL Configuration

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/v1/', include('apps.core.urls')),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Health check
    path('health/', include('apps.core.urls')),
]
```

## 🗄️ Database Management

### PostgreSQL with PostGIS

The platform uses PostgreSQL 16 with PostGIS extension for geospatial capabilities:

#### Database Configuration
```python
# config/settings/base.py
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('POSTGRES_DB', 'safejob'),
        'USER': os.environ.get('POSTGRES_USER', 'safejob'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

#### Geospatial Model Example (Future Implementation)
```python
# Example for future job model with location
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point

class Job(BaseModel):
    title = models.CharField(max_length=200)
    description = models.TextField()
    location_address = models.CharField(max_length=500)
    location_point = models.PointField(srid=4326)  # WGS84 coordinate system

    def set_location_from_address(self, address: str):
        """Geocode address and set location_point (future implementation)."""
        # This would use a geocoding service to convert address to coordinates
        pass

    @classmethod
    def jobs_near_location(cls, point: Point, distance_km: int = 25):
        """Find jobs within specified distance from a point."""
        from django.contrib.gis.measure import Distance
        return cls.objects.filter(
            location_point__distance_lte=(point, Distance(km=distance_km))
        ).annotate(
            distance=models.Distance('location_point', point)
        ).order_by('distance')
```

### Migration Management

```bash
# Create new migrations
poetry run python manage.py makemigrations

# Run migrations
poetry run python manage.py migrate

# Show migration status
poetry run python manage.py showmigrations

# Rollback migrations
poetry run python manage.py migrate app_name migration_name

# Generate SQL for migrations (without applying)
poetry run python manage.py sqlmigrate app_name migration_number
```

### Database Operations

```bash
# Access database shell
make dbshell
# or
poetry run python manage.py dbshell

# Create database backup
docker compose exec db pg_dump -U safejob safejob > backup.sql

# Restore database
docker compose exec -T db psql -U safejob safejob < backup.sql

# Reset database (development only)
poetry run python manage.py flush
```

## 🔄 Caching with Redis

### Cache Configuration

```python
# config/settings/base.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'safejob',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE = 86400  # 24 hours
```

### Cache Usage Examples

```python
# View-level caching
from django.views.decorators.cache import cache_page
from django.core.cache import cache

@cache_page(60 * 15)  # Cache for 15 minutes
def job_list_view(request):
    return JobListAPIView.as_view()(request)

# Model-level caching
class JobQuerySet(models.QuerySet):
    def active(self):
        cache_key = 'active_jobs'
        jobs = cache.get(cache_key)
        if jobs is None:
            jobs = self.filter(status='active', expires_at__gt=timezone.now())
            cache.set(cache_key, jobs, 60 * 30)  # Cache for 30 minutes
        return jobs

# Template fragment caching
{% load cache %}
{% cache 500 job_detail job.id %}
    <!-- Expensive template rendering -->
{% endcache %}
```

## 🔒 Security Implementation

### Security Middleware

```python
# config/settings/base.py
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

### Rate Limiting

```python
# apps/core/views.py
from django_ratelimit.decorators import ratelimit
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator

class APIRateLimitMixin:
    """Mixin to add rate limiting to API views."""

    @method_decorator(ratelimit(key='ip', rate='100/h', method='ALL'))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

# Usage in views
@ratelimit(key='ip', rate='5/m', method='POST')
def auth_endpoint(request):
    """Authentication endpoint with stricter rate limiting."""
    pass
```

### Input Validation

```python
# apps/core/serializers.py
from rest_framework import serializers
from .utils import validate_dutch_postal_code, validate_kvk_number

class BaseSerializer(serializers.ModelSerializer):
    """Base serializer with common validation."""

    def validate(self, data):
        """Custom validation logic."""
        # Add cross-field validation here
        return data

class ContactInfoSerializer(BaseSerializer):
    postal_code = serializers.CharField(
        validators=[validate_dutch_postal_code],
        help_text="Dutch postal code format: 1234 AB"
    )

    def validate_email(self, value):
        """Custom email validation."""
        if not value.endswith('.nl') and '@' not in value:
            raise serializers.ValidationError("Invalid email format")
        return value.lower()
```

## 🧪 Testing Strategy

### Test Configuration

```python
# config/settings/test.py
from .base import *

# Test database
DATABASES['default']['NAME'] = 'test_safejob'

# Disable migrations for faster tests
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Test-specific settings
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',  # Faster for tests
]

# Disable caching in tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}
```

### Test Structure

```python
# tests/test_core.py
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.core.models import BaseModel

class HealthCheckTestCase(APITestCase):
    """Test health check endpoint."""

    def setUp(self):
        self.client = APIClient()

    def test_health_check_success(self):
        """Test health check returns 200 when all services are healthy."""
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'healthy')

    def test_health_check_includes_version(self):
        """Test health check includes version information."""
        response = self.client.get('/health/')
        self.assertIn('version', response.data)
        self.assertIn('timestamp', response.data)

# Model testing
class BaseModelTestCase(TestCase):
    """Test base model functionality."""

    def test_uuid_primary_key(self):
        """Test that models use UUID as primary key."""
        # This would test a concrete model that inherits from BaseModel
        pass

    def test_timestamp_fields(self):
        """Test automatic timestamp field population."""
        pass
```

### Running Tests

```bash
# Run all tests
make test-backend
# or
poetry run python manage.py test

# Run specific test file
poetry run python manage.py test tests.test_core

# Run with coverage
poetry run coverage run --source='.' manage.py test
poetry run coverage report
poetry run coverage html

# Run tests in parallel
poetry run python manage.py test --parallel

# Run tests with verbose output
poetry run python manage.py test --verbosity=2
```

## 📡 API Development

### Django REST Framework Configuration

```python
# config/settings/base.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        # JWT authentication will be added in Phase 2
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# API documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'Safe Job Platform API',
    'DESCRIPTION': 'API for the Safe Job Platform - connecting temporary workers with legitimate employers',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}
```

### API Serializers

```python
# apps/core/serializers.py
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Health Check Response',
            value={
                'status': 'healthy',
                'service': 'safe-job-backend',
                'version': '0.1.0',
                'timestamp': '2025-07-31T10:30:00Z'
            }
        )
    ]
)
class HealthCheckSerializer(serializers.Serializer):
    """Serializer for health check response."""
    status = serializers.CharField()
    service = serializers.CharField()
    version = serializers.CharField()
    timestamp = serializers.DateTimeField()
    checks = serializers.DictField(child=serializers.BooleanField(), required=False)
```

### API Views

```python
# apps/core/views.py
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, extend_schema_view

@extend_schema_view(
    list=extend_schema(description="List all items"),
    create=extend_schema(description="Create a new item"),
)
class BaseViewSet(ViewSet):
    """Base viewset with common functionality."""

    @extend_schema(
        description="Custom action example",
        responses={200: HealthCheckSerializer}
    )
    @action(detail=False, methods=['get'])
    def custom_action(self, request):
        """Custom action example."""
        pass
```

## 🔧 Development Workflow

### Code Quality Tools

#### Ruff Configuration

```toml
# pyproject.toml
[tool.ruff]
line-length = 88
target-version = "py313"
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # Pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
]
ignore = [
    "E501",  # line too long, handled by black
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]
"tests/*.py" = ["S101"]  # Use of assert detected
```

#### Black Configuration

```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py313']
include = '\.pyi?$'
extend-exclude = '''
/(
  migrations
)/
'''
```

#### MyPy Configuration

```toml
# pyproject.toml
[tool.mypy]
python_version = "3.13"
check_untyped_defs = true
ignore_missing_imports = true
warn_unused_ignores = true
warn_redundant_casts = true
warn_unused_configs = true
```

### Development Commands

```bash
# Code quality checks
make lint-backend                    # Run all linting
poetry run ruff check .             # Run Ruff linter
poetry run black --check .          # Check Black formatting
poetry run mypy .                   # Run type checking
poetry run bandit -r .              # Security linting

# Code formatting
poetry run black .                  # Format code with Black
poetry run ruff --fix .             # Auto-fix Ruff issues

# Django management
poetry run python manage.py migrate               # Run migrations
poetry run python manage.py makemigrations        # Create migrations
poetry run python manage.py createsuperuser       # Create admin user
poetry run python manage.py collectstatic         # Collect static files
poetry run python manage.py shell                 # Django shell

# Testing
poetry run python manage.py test                  # Run tests
poetry run coverage run manage.py test            # Run with coverage
poetry run coverage report                        # Show coverage report

# Development server
poetry run python manage.py runserver             # Start dev server
poetry run python manage.py runserver 0.0.0.0:8000  # Bind to all interfaces
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml (configured in project root)
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        language_version: python3.13
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [django-stubs]
```

## 🐳 Docker Integration

### Multi-Stage Dockerfile

```dockerfile
# Multi-stage build for Django backend
FROM python:3.13-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Development stage
FROM base AS development
WORKDIR /app

# Install Poetry
RUN pip install poetry
RUN poetry config virtualenvs.create false

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry install --with dev

# Copy source code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

EXPOSE 8000
CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]

# Production stage
FROM base AS runtime
WORKDIR /app

# Install Poetry
RUN pip install poetry
RUN poetry config virtualenvs.create false

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install only production dependencies
RUN poetry install --only main

# Copy source code
COPY . .

# Collect static files
RUN poetry run python manage.py collectstatic --noinput

# Create non-root user
RUN addgroup --system django && adduser --system --group django
RUN chown -R django:django /app
USER django

EXPOSE 8000
CMD ["poetry", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Docker Development Commands

```bash
# Backend-specific Docker commands
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py shell
docker compose exec backend bash

# Install new dependencies
docker compose exec backend poetry add <package>
docker compose exec backend poetry install

# Run tests in container
docker compose exec backend python manage.py test

# View backend logs
docker compose logs -f backend
```

## 🔮 Future Implementation (Phase 2+)

### Authentication System (Phase 2)

```python
# apps/users/models.py (Future implementation)
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class CustomUser(AbstractUser):
    """Custom user model with email as username."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    user_type = models.CharField(
        max_length=20,
        choices=[
            ('candidate', 'Candidate'),
            ('employer', 'Employer'),
            ('admin', 'Admin'),
        ]
    )
    email_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True)
    phone_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class MagicLinkToken(models.Model):
    """Token for magic link authentication."""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
```

### API Permissions (Future)

```python
# apps/core/permissions.py (Future implementation)
from rest_framework.permissions import BasePermission

class IsCandidate(BasePermission):
    """Permission for candidate users only."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.user_type == 'candidate'
        )

class IsEmployer(BasePermission):
    """Permission for employer users only."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.user_type == 'employer'
        )

class IsVerifiedEmployer(BasePermission):
    """Permission for verified employer users only."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.user_type == 'employer' and
            hasattr(request.user, 'employer_profile') and
            request.user.employer_profile.verification_status == 'approved'
        )
```

## 📊 Performance Monitoring

### Logging Configuration

```python
# config/settings/base.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
```

### Database Query Optimization

```python
# Example of optimized queries (Future implementation)
from django.db import models

class JobQuerySet(models.QuerySet):
    def with_employer_info(self):
        """Optimize queries with employer information."""
        return self.select_related('employer', 'employer__user')

    def with_application_counts(self):
        """Annotate with application counts."""
        return self.annotate(
            application_count=models.Count('applications'),
            pending_applications=models.Count(
                'applications',
                filter=models.Q(applications__status='pending')
            )
        )

    def active_jobs(self):
        """Get active job postings."""
        from django.utils import timezone
        return self.filter(
            status='published',
            expires_at__gt=timezone.now()
        )

# Usage in views
jobs = Job.objects.with_employer_info().with_application_counts().active_jobs()
```

## 🐛 Troubleshooting

### Common Development Issues

#### 1. **Database Connection Issues**
```bash
# Check database status
docker compose ps db

# Check database logs
docker compose logs db

# Test connection
docker compose exec backend python manage.py dbshell

# Recreate database
docker compose down
docker volume rm safejob_postgres_data
docker compose up -d
```

#### 2. **Migration Issues**
```bash
# Check migration status
poetry run python manage.py showmigrations

# Fake apply migrations (if needed)
poetry run python manage.py migrate --fake

# Reset migrations (development only)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
poetry run python manage.py makemigrations
poetry run python manage.py migrate
```

#### 3. **Dependency Issues**
```bash
# Update Poetry lock file
poetry lock --no-update

# Install dependencies
poetry install --with dev

# Clear Poetry cache
poetry cache clear --all pypi
```

#### 4. **Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER ./backend

# Run with correct user in Docker
docker compose exec --user $(id -u):$(id -g) backend bash
```

### Debug Settings

```python
# config/settings/development.py
from .base import *

DEBUG = True

# Debug toolbar
if DEBUG:
    INSTALLED_APPS += [
        'debug_toolbar',
    ]

    MIDDLEWARE += [
        'debug_toolbar.middleware.DebugToolbarMiddleware',
    ]

    INTERNAL_IPS = [
        '127.0.0.1',
        'localhost',
    ]

# Logging for development
LOGGING['handlers']['console']['level'] = 'DEBUG'
LOGGING['loggers']['django.db.backends'] = {
    'handlers': ['console'],
    'level': 'DEBUG',
    'propagate': False,
}
```

## 📚 Best Practices

### Code Organization
- One model per file for complex models
- Use abstract base classes for common functionality
- Implement custom managers and querysets for reusable logic
- Follow Django's naming conventions

### Security
- Never commit secrets to version control
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP security guidelines

### Performance
- Use `select_related()` and `prefetch_related()` to avoid N+1 queries
- Implement database indexes for frequently queried fields
- Use caching for expensive operations
- Monitor database query performance

### Testing
- Write tests for all business logic
- Use factories for test data generation
- Test both success and failure scenarios
- Maintain good test coverage (>80%)

---

This comprehensive backend development guide provides everything needed to understand, develop, and maintain the Django backend of the Safe Job Platform. The robust foundation established in Phase 1 enables rapid development of business features in subsequent phases.
