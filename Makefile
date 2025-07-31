# Safe Job Platform - Development Makefile
# Simplifies common development tasks

.PHONY: help setup test lint format clean docker-build docker-up docker-down docs

# Default target
help: ## Show this help message
	@echo "Safe Job Platform - Development Commands"
	@echo "========================================"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development setup
setup: ## Set up development environment
	@echo "🚀 Setting up development environment..."
	./scripts/setup-dev.sh

# Testing
test: ## Run Django tests
	@echo "🧪 Running tests..."
	docker compose exec backend python manage.py test

test-local: ## Run tests with local Poetry environment
	@echo "🧪 Running tests locally..."
	cd backend && poetry run python manage.py test

test-coverage: ## Run tests with coverage report
	@echo "🧪 Running tests with coverage..."
	cd backend && poetry run coverage run --source='.' manage.py test
	cd backend && poetry run coverage report
	cd backend && poetry run coverage html

# Code quality
lint: ## Run all linting and formatting checks
	@echo "🔍 Running linting checks..."
	pre-commit run --all-files

format: ## Format code with Black and isort
	@echo "✨ Formatting code..."
	cd backend && poetry run black .
	cd backend && poetry run isort .

lint-backend: ## Run backend-specific linting
	@echo "🔍 Running backend linting..."
	cd backend && poetry run ruff check .
	cd backend && poetry run mypy .
	cd backend && poetry run bandit -r .

# Django management
migrate: ## Run Django migrations
	@echo "📊 Running migrations..."
	docker compose exec backend python manage.py migrate

makemigrations: ## Create Django migrations
	@echo "📊 Creating migrations..."
	docker compose exec backend python manage.py makemigrations

shell: ## Open Django shell
	docker compose exec backend python manage.py shell

dbshell: ## Open database shell
	docker compose exec db psql -U safejob -d safejob

superuser: ## Create Django superuser
	docker compose exec backend python manage.py createsuperuser

# Docker operations
docker-build: ## Build Docker images
	@echo "🐳 Building Docker images..."
	docker compose build

docker-up: ## Start Docker services
	@echo "🐳 Starting Docker services..."
	docker compose up -d

docker-down: ## Stop Docker services
	@echo "🐳 Stopping Docker services..."
	docker compose down

docker-logs: ## View Docker logs
	docker compose logs -f

docker-clean: ## Clean Docker containers and volumes
	@echo "🐳 Cleaning Docker environment..."
	docker compose down -v
	docker system prune -f

# Development workflow
dev: ## Start development environment
	@echo "🚀 Starting development environment..."
	docker compose up -d
	@echo "✅ Development environment ready!"
	@echo "📡 Backend API: http://localhost:8000"
	@echo "🗄️  Database: localhost:5432"
	@echo "🔴 Redis: localhost:6379"

stop: ## Stop development environment
	@echo "⏹️  Stopping development environment..."
	docker compose down

restart: ## Restart development environment
	@echo "🔄 Restarting development environment..."
	docker compose restart

# Pre-commit
install-hooks: ## Install pre-commit hooks
	@echo "🔧 Installing pre-commit hooks..."
	pre-commit install

run-hooks: ## Run pre-commit hooks on all files
	@echo "🔧 Running pre-commit hooks..."
	pre-commit run --all-files

# Documentation
docs-serve: ## Serve documentation locally
	@echo "📖 Starting documentation server..."
	docker compose up docs -d
	@echo "📖 Documentation available at: http://localhost:8001"

docs-build: ## Build documentation
	@echo "📖 Building documentation..."
	docker compose exec docs mkdocs build

docs-stop: ## Stop documentation server
	@echo "📖 Stopping documentation server..."
	docker compose stop docs

docs-shell: ## Open shell in docs container
	@echo "📖 Opening documentation container shell..."
	docker compose exec docs bash

docs-deploy: ## Deploy documentation (for maintainers)
	@echo "📖 Deploying documentation..."
	mkdocs gh-deploy

# Dependency management
update-deps: ## Update Python dependencies
	@echo "📦 Updating dependencies..."
	cd backend && poetry update

install-deps: ## Install Python dependencies
	@echo "📦 Installing dependencies..."
	cd backend && poetry install --with dev

# Security
security-check: ## Run security checks
	@echo "🔒 Running security checks..."
	cd backend && poetry run safety check
	cd backend && poetry run bandit -r .

# Clean up
clean: ## Clean up temporary files
	@echo "🧹 Cleaning up..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type f -name ".coverage" -delete
	find . -type d -name "htmlcov" -exec rm -rf {} +

# Reset environment
reset: ## Reset development environment completely
	@echo "🔄 Resetting development environment..."
	docker compose down -v
	rm -f .envs/.env.development.local .env
	./scripts/setup-dev.sh

# Health check
health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@echo "Backend API:"
	@curl -f http://localhost:8000/health/ || echo "❌ Backend not responding"
	@echo -e "\nDatabase:"
	@docker compose exec db pg_isready -U safejob -d safejob || echo "❌ Database not ready"
	@echo -e "\nRedis:"
	@bash -c 'set -a && source .envs/.env.development.local && docker compose exec redis redis-cli -a "$$REDIS_PASSWORD" ping' || echo "❌ Redis not responding"
	@echo -e "\nDocumentation:"
	@curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:8001/safe-job/ && echo " ✅ Docs serving" || echo "❌ Docs not responding"

# CI simulation
ci: ## Run CI checks locally
	@echo "🚀 Running CI checks locally..."
	@echo "1. Running tests..."
	$(MAKE) test
	@echo "2. Running linting..."
	$(MAKE) lint
	@echo "3. Running security checks..."
	$(MAKE) security-check
	@echo "4. Building Docker images..."
	$(MAKE) docker-build
	@echo "✅ All CI checks passed!"
