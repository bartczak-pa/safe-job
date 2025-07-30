# API Documentation Overview

The Safe Job Platform provides a comprehensive REST API built with Django REST Framework.

## Base URL

Development: `http://localhost:8000/api/v1/`
Production: `https://api.safejob.nl/api/v1/`

## Authentication

The API uses token-based authentication for secure access.

### Obtaining a Token

```bash
POST /api/v1/auth/login/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "your-password"
}
```

### Using the Token

Include the token in the Authorization header:

```bash
Authorization: Token your-api-token-here
```

## API Endpoints

### Health Check

```bash
GET /health/
```

Returns the API health status and version information.

### Authentication Endpoints

- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/logout/` - User logout
- `POST /api/v1/auth/password/reset/` - Password reset request
- `POST /api/v1/auth/password/confirm/` - Password reset confirmation

### User Profiles

- `GET /api/v1/profiles/me/` - Get current user profile
- `PUT /api/v1/profiles/me/` - Update current user profile
- `POST /api/v1/profiles/me/avatar/` - Upload profile avatar

### Job Listings

- `GET /api/v1/jobs/` - List available jobs
- `POST /api/v1/jobs/` - Create new job listing (agencies only)
- `GET /api/v1/jobs/{id}/` - Get job details
- `PUT /api/v1/jobs/{id}/` - Update job listing
- `DELETE /api/v1/jobs/{id}/` - Delete job listing

### Applications

- `GET /api/v1/applications/` - List user's applications
- `POST /api/v1/applications/` - Submit job application
- `GET /api/v1/applications/{id}/` - Get application details
- `PUT /api/v1/applications/{id}/` - Update application status

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
    "status": "success",
    "data": {
        // Response data here
    },
    "meta": {
        "page": 1,
        "per_page": 20,
        "total": 100,
        "total_pages": 5
    }
}
```

### Error Response

```json
{
    "status": "error",
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "details": {
            "field_name": ["This field is required"]
        }
    }
}
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour
- **Login attempts**: 10 attempts per hour per IP

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Filtering and Pagination

### Filtering

Use query parameters to filter results:

```bash
GET /api/v1/jobs/?location=Amsterdam&type=fulltime&salary_min=3000
```

### Sorting

Use the `ordering` parameter:

```bash
GET /api/v1/jobs/?ordering=-created_at,salary
```

### Pagination

API responses are paginated by default:

```bash
GET /api/v1/jobs/?page=2&per_page=50
```

## Examples

### Get All Jobs

```bash
curl -H "Authorization: Token your-token" \
     "http://localhost:8000/api/v1/jobs/"
```

### Create Job Application

```bash
curl -X POST \
     -H "Authorization: Token your-token" \
     -H "Content-Type: application/json" \
     -d '{"job_id": 123, "cover_letter": "I am interested..."}' \
     "http://localhost:8000/api/v1/applications/"
```

## SDKs and Libraries

Official SDKs are available for:

- **Python**: `pip install safe-job-api`
- **JavaScript**: `npm install @safejob/api-client`
- **PHP**: `composer require safejob/api-client`

## Testing

Use the provided test endpoints for development:

- `GET /api/v1/test/protected/` - Test authenticated endpoint
- `GET /api/v1/test/public/` - Test public endpoint
- `POST /api/v1/test/echo/` - Echo request data

## Support

For API support and questions:

- **Documentation**: https://docs.safejob.nl
- **Email**: api-support@safejob.nl
- **GitHub Issues**: https://github.com/bartczak-pa/safe-job/issues
