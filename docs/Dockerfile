FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
# hadolint ignore=DL3008,DL3015
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY docs/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy initial files (will be overridden by volumes in development)
COPY docs/ ./docs/
COPY mkdocs.yml .

# Expose port for MkDocs server
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:8001/ || exit 1

# Default command to serve documentation
CMD ["mkdocs", "serve", "--dev-addr=0.0.0.0:8001"]
