"""
Test settings for Safe Job Platform.
Optimized for running tests quickly and safely.
"""

import os

from decouple import config

from .base import *  # noqa: F403

# Test specific overrides
DEBUG = False
TESTING = True

# Use PostgreSQL for tests to match production environment
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": config("POSTGRES_DB", default="safejob_test"),
        "USER": config("POSTGRES_USER", default="safejob_test"),
        "PASSWORD": config("POSTGRES_PASSWORD", default="test_password"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
        "TEST": {
            "NAME": "test_"
            + config(
                "POSTGRES_DB", default="safejob_test"
            ),  # Different name for Django test DB
        },
        "OPTIONS": {
            "sslmode": "disable",  # Disable SSL for test environment
        },
    }
}


# Disable migrations for faster test runs
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None


MIGRATION_MODULES = DisableMigrations()

# Use in-memory cache for tests (faster than Redis)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# Use console email backend for tests
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Disable password validation for faster tests
AUTH_PASSWORD_VALIDATORS = []

# Use in-memory file storage for tests
DEFAULT_FILE_STORAGE = "django.core.files.storage.InMemoryStorage"
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

# Disable logging during tests unless specified
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "null": {
            "class": "logging.NullHandler",
        },
    },
    "root": {
        "handlers": ["null"],
        "level": "CRITICAL",
    },
    "loggers": {
        "django": {
            "handlers": ["null"],
            "level": "CRITICAL",
            "propagate": False,
        },
    },
}

# Speed up password hashing
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# Disable CORS checks in tests
CORS_ALLOW_ALL_ORIGINS = True

# Test specific settings
TEST_RUNNER = "django.test.runner.DiscoverRunner"

# Security settings - conditional based on whether we're running deployment checks
# These need to be True for deployment checks but can cause issues during actual testing
RUNNING_DEPLOYMENT_CHECKS = (
    os.environ.get("DJANGO_DEPLOYMENT_CHECKS", "False").lower() == "true"
)

if RUNNING_DEPLOYMENT_CHECKS:
    # Production-level security settings for deployment checks
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
else:
    # Relaxed settings for actual test execution
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_HSTS_PRELOAD = False
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

# Additional security settings (always enabled)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Override with stronger test secret key
SECRET_KEY = "test-secret-key-for-ci-with-more-entropy-and-longer-length-to-pass-deployment-checks"  # nosec B105

# Static files directory for tests
STATICFILES_DIRS = []  # Remove static directory requirement for tests
