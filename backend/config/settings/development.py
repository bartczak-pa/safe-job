"""
Development settings for Safe Job Platform.
"""

from .base import *  # noqa: F403

# Debug settings
DEBUG = True

# Development middleware
# MIDDLEWARE += [
#     'django_extensions.management.middleware.profile_middleware.ProfilerMiddleware',
# ]

# Development apps
# INSTALLED_APPS += [
#     'django_extensions',
# ]

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.db.backends": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# Email backend for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
