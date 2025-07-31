#!/bin/bash

# Safe Job Platform - Development Environment Setup
# This script sets up the development environment with secure configuration

set -e  # Exit on any error

echo "🚀 Setting up Safe Job Platform development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Check if development local env file exists
if [ -f ".envs/.env.development.local" ]; then
    print_warning ".envs/.env.development.local file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_step "Using existing .envs/.env.development.local file"
        exit 0
    fi
fi

print_step "Creating secure .env file from template..."

# Ensure .envs directory exists
mkdir -p .envs

# Copy template
cp .envs/.env.development.template .envs/.env.development.local

# Generate secure passwords
DB_PASSWORD=$(generate_password)
REDIS_PASSWORD=$(generate_password)
SECRET_KEY=$(generate_password)

# Replace passwords in .envs/.env.development.local file
ENV_FILE=".envs/.env.development.local"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/POSTGRES_PASSWORD=secure_dev_password_2024/POSTGRES_PASSWORD=$DB_PASSWORD/g" $ENV_FILE
    sed -i '' "s/REDIS_PASSWORD=secure_redis_password_2024/REDIS_PASSWORD=$REDIS_PASSWORD/g" $ENV_FILE
    sed -i '' "s/SECRET_KEY=dev-secret-key-change-in-production-b8f3e9a7c2d1f4g6h8j9k1l3/SECRET_KEY=$SECRET_KEY/g" $ENV_FILE
else
    # Linux
    sed -i "s/POSTGRES_PASSWORD=secure_dev_password_2024/POSTGRES_PASSWORD=$DB_PASSWORD/g" $ENV_FILE
    sed -i "s/REDIS_PASSWORD=secure_redis_password_2024/REDIS_PASSWORD=$REDIS_PASSWORD/g" $ENV_FILE
    sed -i "s/SECRET_KEY=dev-secret-key-change-in-production-b8f3e9a7c2d1f4g6h8j9k1l3/SECRET_KEY=$SECRET_KEY/g" $ENV_FILE
fi

# Create symlink for compatibility
ln -sf .envs/.env.development.local .env

print_success "Secure .envs/.env.development.local file created with generated passwords"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_step "Building and starting services..."

# Build and start services
docker compose up --build -d

print_step "Waiting for services to be healthy..."

# Wait for database to be ready
echo -n "Waiting for database"
while ! docker compose exec -T db pg_isready -U safejob -d safejob > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo ""
print_success "Database is ready"

# Wait for Redis to be ready
echo -n "Waiting for Redis"
while ! docker compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo ""
print_success "Redis is ready"

print_step "Running Django setup commands..."

# Wait a bit more for Django to be ready
sleep 5

# Run Django management commands
print_step "Running database migrations..."
docker compose exec backend python manage.py migrate 2>/dev/null || print_warning "Migrations not ready yet (will run when Django project is created)"

print_success "Development environment setup complete!"

echo ""
echo "📋 Development Environment Ready:"
echo "- Backend API: http://localhost:8000"
echo "- Database: PostgreSQL on localhost:5432"
echo "- Redis: localhost:6379"
echo ""
echo "🔧 Useful commands:"
echo "- Start services: docker compose up"
echo "- Stop services: docker compose down"
echo "- View logs: docker compose logs -f"
echo "- Django shell: docker compose exec backend python manage.py shell"
echo "- Database shell: docker compose exec db psql -U safejob -d safejob"
echo ""
echo "📁 Generated files:"
echo "- .envs/.env.development.local (secure development configuration)"
echo "- .env (symlink to .envs/.env.development.local for compatibility)"
echo ""
print_warning "Keep the .env file secure and never commit it to version control!"

print_success "Ready to start Phase 1 development! 🚀"
