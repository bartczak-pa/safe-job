from django.http import JsonResponse
from django.views.decorators.http import require_http_methods


@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint for monitoring."""
    return JsonResponse(
        {"status": "healthy", "service": "safe-job-backend", "version": "0.1.0"}
    )
