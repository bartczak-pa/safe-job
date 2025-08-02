# Testing Guide

This guide covers testing practices and conventions for the Safe Job Platform.

## Testing Framework

The project uses Django's built-in testing framework with additional tools:

- **Django Test Framework** - Core testing functionality
- **pytest** - Alternative test runner with powerful features
- **pytest-django** - Django integration for pytest
- **pytest-cov** - Coverage reporting
- **factory-boy** - Test data generation
- **faker** - Realistic fake data

## Test Structure

Tests are organized within each Django app:

```
backend/apps/
├── core/
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_models.py
│   │   ├── test_views.py
│   │   ├── test_utils.py
│   │   └── factories.py
│   └── tests.py (legacy)
├── users/
│   └── tests/
└── jobs/
    └── tests/
```

## Running Tests

### Using Makefile (Recommended)

```bash
# Run all tests
make test

# Run tests locally with Poetry (alternative)
make test-local

# Run tests with coverage report
make test-coverage

# Run all CI checks including tests
make ci
```

### Manual Test Commands

For specific testing scenarios:

```bash
# Run all tests in container
docker compose exec backend python manage.py test

# Run specific app tests
docker compose exec backend python manage.py test apps.core

# Run specific test class
docker compose exec backend python manage.py test apps.core.tests.test_models.UserModelTest

# Run specific test method
docker compose exec backend python manage.py test apps.core.tests.test_models.UserModelTest.test_user_creation

# Run with verbosity
docker compose exec backend python manage.py test --verbosity=2

# Run in parallel
docker compose exec backend python manage.py test --parallel auto
```

### Coverage Analysis

```bash
# Run tests with coverage (using Makefile)
make test-coverage

# Manual coverage commands
docker compose exec backend coverage run --source='.' manage.py test
docker compose exec backend coverage report
docker compose exec backend coverage html
```

## Test Settings

Tests use the `config.settings.test` configuration:

```python
# config/settings/test.py
from .base import *

# Use in-memory SQLite for speed
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.spatialite",
        "NAME": ":memory:",
    }
}

# Disable migrations for faster startup
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Faster password hashing
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable logging during tests
LOGGING_CONFIG = None

# Use local memory cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
```

## Test Examples

### Model Tests

```python
# apps/core/tests/test_models.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.users.models import UserProfile

User = get_user_model()

class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_user_creation(self):
        """Test user can be created with email and password."""
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.check_password('testpass123'))
        self.assertFalse(self.user.is_staff)

    def test_user_str_representation(self):
        """Test string representation of user."""
        self.assertEqual(str(self.user), 'test@example.com')

    def test_profile_creation(self):
        """Test user profile is created automatically."""
        profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(profile.user, self.user)
```

### View Tests

```python
# apps/core/tests/test_views.py
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class HealthCheckViewTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_check_endpoint(self):
        """Test health check returns correct response."""
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, 200)

        data = json.loads(response.content)
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['service'], 'safe-job-backend')

class AuthenticatedViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_protected_view_requires_auth(self):
        """Test protected view requires authentication."""
        response = self.client.get('/api/v1/profile/')
        self.assertEqual(response.status_code, 401)

    def test_protected_view_with_auth(self):
        """Test protected view works with authentication."""
        self.client.login(email='test@example.com', password='testpass123')
        response = self.client.get('/api/v1/profile/')
        self.assertEqual(response.status_code, 200)
```

### API Tests

```python
# apps/api/tests/test_api.py
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

class JobAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_create_job(self):
        """Test creating a new job via API."""
        data = {
            'title': 'Software Developer',
            'description': 'Python developer needed',
            'location': 'Amsterdam',
            'salary_min': 50000,
            'salary_max': 70000
        }
        response = self.client.post('/api/v1/jobs/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Software Developer')

    def test_list_jobs(self):
        """Test listing jobs via API."""
        response = self.client.get('/api/v1/jobs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
```

## Test Data Factories

Use Factory Boy for creating test data:

```python
# apps/core/tests/factories.py
import factory
from django.contrib.auth import get_user_model
from apps.jobs.models import Job, JobApplication

User = get_user_model()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True

class JobFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Job

    title = factory.Faker('job')
    description = factory.Faker('text', max_nb_chars=500)
    location = factory.Faker('city')
    salary_min = factory.Faker('random_int', min=30000, max=50000)
    salary_max = factory.Faker('random_int', min=50000, max=100000)
    company = factory.SubFactory('apps.companies.tests.factories.CompanyFactory')

# Usage in tests
class JobTestCase(TestCase):
    def test_job_creation(self):
        job = JobFactory()
        self.assertTrue(isinstance(job, Job))
        self.assertTrue(job.title)
```

## Testing Utilities

### Custom Test Mixins

```python
# apps/core/tests/mixins.py
from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthenticatedTestMixin:
    """Mixin for tests requiring authenticated user."""

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.login(email='test@example.com', password='testpass123')

class APITestMixin:
    """Mixin for API tests with token authentication."""

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        from rest_framework.authtoken.models import Token
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
```

### Mock External Services

```python
# apps/core/tests/test_external_services.py
from unittest.mock import patch, Mock
from django.test import TestCase

class ExternalServiceTest(TestCase):
    @patch('apps.services.email.send_email')
    def test_email_sending(self, mock_send_email):
        """Test email service integration."""
        mock_send_email.return_value = True

        # Your test code here
        result = some_function_that_sends_email()

        mock_send_email.assert_called_once()
        self.assertTrue(result)

    @patch('requests.get')
    def test_external_api_call(self, mock_get):
        """Test external API integration."""
        mock_response = Mock()
        mock_response.json.return_value = {'status': 'success'}
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        # Your test code here
        result = make_external_api_call()

        self.assertEqual(result['status'], 'success')
```

## Coverage Analysis

### Running Coverage

```bash
# Run tests with coverage (Recommended)
make test-coverage

# Manual coverage commands in container
docker compose exec backend coverage run --source='.' manage.py test
docker compose exec backend coverage report
docker compose exec backend coverage html

# Check coverage percentage
docker compose exec backend coverage report --show-missing

# View HTML report (after generating)
# Open htmlcov/index.html in browser
```

### Coverage Configuration

```ini
# .coveragerc
[run]
source = .
omit =
    */migrations/*
    */venv/*
    */virtualenv/*
    manage.py
    */settings/*
    */tests/*
    */test_*.py

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
```

## Performance Testing

### Database Query Testing

```python
from django.test import TestCase
from django.test.utils import override_settings
from django.db import connection
from django.test.utils import override_settings

class QueryOptimizationTest(TestCase):
    def test_query_count(self):
        """Test that view doesn't perform too many queries."""
        with self.assertNumQueries(2):
            response = self.client.get('/api/v1/jobs/')
            self.assertEqual(response.status_code, 200)

    def test_query_efficiency(self):
        """Test query efficiency with select_related."""
        # Create test data
        jobs = JobFactory.create_batch(10)

        with self.assertNumQueries(1):  # Should be 1 query with select_related
            list(Job.objects.select_related('company').all())
```

### Load Testing

```python
# apps/core/tests/test_performance.py
import time
from django.test import TestCase, Client
from concurrent.futures import ThreadPoolExecutor

class LoadTest(TestCase):
    def test_concurrent_requests(self):
        """Test API can handle concurrent requests."""
        def make_request():
            client = Client()
            return client.get('/health/')

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(50)]
            responses = [future.result() for future in futures]

        # All requests should succeed
        for response in responses:
            self.assertEqual(response.status_code, 200)
```

## Test Best Practices

### 1. Test Organization

- Group related tests in test classes
- Use descriptive test method names
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Test Data

- Use factories for consistent test data
- Clean up data after tests when needed
- Use minimal data required for the test

### 3. Test Isolation

- Each test should be independent
- Use setUp() for common test data
- Don't rely on test execution order

### 4. Assertions

- Use specific assertions (assertEqual vs assertTrue)
- Test both positive and negative cases
- Include edge cases and error conditions

### 5. Mocking

- Mock external services and APIs
- Don't mock the code you're testing
- Use meaningful mock return values

## Continuous Integration

Tests run automatically on:

- **Pull Requests** - All tests must pass
- **Main Branch Commits** - Full test suite
- **Nightly Builds** - Extended test suite with performance tests

### GitHub Actions Configuration

```yaml
# .github/workflows/tests.yml
- name: Run Tests
  run: |
    docker compose exec -T backend python manage.py test --verbosity=2
    docker compose exec -T backend coverage run --source='.' manage.py test
    docker compose exec -T backend coverage xml

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage.xml
```

## Debugging Tests

### Running Single Tests

```bash
# Run single test method
docker compose exec backend python manage.py test apps.core.tests.test_models.UserModelTest.test_user_creation --verbosity=2

# Run with pdb debugger
docker compose exec backend python manage.py test apps.core.tests.test_models.UserModelTest.test_user_creation --pdb
```

### Test Database

```bash
# Keep test database after test run
docker compose exec backend python manage.py test --keepdb

# Use custom test database name
docker compose exec backend python manage.py test --settings=config.settings.test_custom
```

## Test Documentation

- Document complex test scenarios
- Explain test data requirements
- Include examples of expected behavior
- Document any test-specific setup requirements

This testing guide ensures comprehensive coverage and maintains code quality across the Safe Job Platform.
