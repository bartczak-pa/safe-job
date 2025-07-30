import importlib.metadata

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods


def get_version():
    """Get version from package metadata with fallback."""
    try:
        return importlib.metadata.version("safe-job-backend")
    except importlib.metadata.PackageNotFoundError:
        return "0.1.0"  # fallback for development


@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint for monitoring."""
    return JsonResponse(
        {
            "status": "healthy",
            "service": "safe-job-backend",
            "version": get_version(),
            "timestamp": timezone.now().isoformat(),
        }
    )
