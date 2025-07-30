"""
Test settings for Safe Job Platform.
Optimized for running tests quickly and safely.
"""

from .base import *  # noqa: F403

# Test specific overrides
DEBUG = False
TESTING = True

# Use in-memory SQLite for faster tests
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.spatialite",
        "NAME": ":memory:",
        "OPTIONS": {
            "init_command": 'SELECT load_extension("mod_spatialite")',
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

# Use in-memory cache for tests
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
