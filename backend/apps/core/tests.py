"""
Tests for core app functionality.
"""

import json

from django.conf import settings
from django.core.cache import cache
from django.db import connection
from django.test import Client, TestCase
from django.urls import reverse


class HealthCheckTestCase(TestCase):
    """Test cases for health check functionality."""

    def setUp(self):
        self.client = Client()

    def test_health_check_endpoint(self):
        """Test that health check endpoint returns correct response."""
        response = self.client.get("/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")

        data = json.loads(response.content)
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "safe-job-backend")
        self.assertIn("version", data)

    def test_health_check_reverse_url(self):
        """Test health check using reverse URL lookup."""
        url = reverse("core:health_check")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)

    def test_health_check_method_not_allowed(self):
        """Test that only GET method is allowed for health check."""
        # Test POST
        response = self.client.post("/health/")
        self.assertEqual(response.status_code, 405)

        # Test PUT
        response = self.client.put("/health/")
        self.assertEqual(response.status_code, 405)


class SettingsTestCase(TestCase):
    """Test cases for Django settings configuration."""

    def test_debug_setting(self):
        """Test that DEBUG setting is configured."""
        self.assertIsInstance(settings.DEBUG, bool)

    def test_secret_key_exists(self):
        """Test that SECRET_KEY is configured and not default."""
        self.assertTrue(hasattr(settings, "SECRET_KEY"))
        self.assertNotEqual(settings.SECRET_KEY, "")
        self.assertNotEqual(settings.SECRET_KEY, "dev-key-change-me")

    def test_installed_apps(self):
        """Test that our custom apps are installed."""
        self.assertIn("apps.core", settings.INSTALLED_APPS)
        self.assertIn("django.contrib.gis", settings.INSTALLED_APPS)
        self.assertIn("rest_framework", settings.INSTALLED_APPS)


class DatabaseConnectionTestCase(TestCase):
    """Test database connectivity and basic operations."""

    def test_database_connection(self):
        """Test that we can connect to the database."""
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            self.assertEqual(result[0], 1)


class CacheTestCase(TestCase):
    """Test cache functionality."""

    def test_cache_set_get(self):
        """Test basic cache set and get operations."""
        # Test setting and getting a value
        cache.set("test_key", "test_value", timeout=60)
        value = cache.get("test_key")
        self.assertEqual(value, "test_value")

        # Test cache deletion
        cache.delete("test_key")
        value = cache.get("test_key")
        self.assertIsNone(value)
