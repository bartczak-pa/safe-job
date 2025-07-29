# Quick Start Guide

Get up and running with the Safe Job Platform development environment in minutes.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Git** - Version control system
- **Docker & Docker Compose** - Containerization platform
- **Node.js 18+** - JavaScript runtime for frontend development
- **Python 3.11+** - Backend development language

## ⚡ Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pawel-org/safe-job.git
cd safe-job
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables (development defaults are provided)
nano .env
```

### 3. Start Development Environment

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Initialize Database

```bash
# Run initial migrations
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# Load sample data (optional)
docker-compose exec backend python manage.py loaddata fixtures/sample_data.json
```

### 5. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000/api/](http://localhost:8000/api/)
- **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)
- **API Documentation**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)

## 🛠️ Development Workflow

### Running Tests

```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests  
docker-compose exec frontend npm test

# End-to-end tests
docker-compose exec e2e npm run test:e2e
```

### Code Quality Checks

```bash
# Python linting and formatting
docker-compose exec backend ruff check .
docker-compose exec backend black .

# TypeScript linting
docker-compose exec frontend npm run lint
docker-compose exec frontend npm run type-check
```

### Database Operations

```bash
# Create new migration
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate

# Access database shell
docker-compose exec db psql -U postgres -d safejob
```

## 📁 Project Structure

```
safe-job/
├── backend/                 # Django application
│   ├── apps/               # Django apps (users, jobs, etc.)
│   ├── config/             # Django settings and configuration
│   └── requirements.txt    # Python dependencies
├── frontend/               # React application
│   ├── src/               # React components and logic
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
├── docs/                  # Documentation (MkDocs)
├── docker-compose.yml     # Development environment setup
├── .env.example          # Environment variables template
└── README.md             # Project overview
```

## 🔧 Common Tasks

### Adding New Dependencies

**Backend (Python):**
```bash
# Add to requirements.txt, then rebuild
docker-compose build backend
docker-compose up -d backend
```

**Frontend (Node.js):**
```bash
# Install package
docker-compose exec frontend npm install package-name

# Or add to package.json and rebuild
docker-compose build frontend
```

### Working with Django Apps

```bash
# Create new Django app
docker-compose exec backend python manage.py startapp app_name

# Generate API documentation
docker-compose exec backend python manage.py spectacular --file schema.yml
```

### Database Management

```bash
# Reset database (WARNING: destroys all data)
docker-compose down -v
docker-compose up -d db
docker-compose exec backend python manage.py migrate

# Backup database
docker-compose exec db pg_dump -U postgres safejob > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres safejob < backup.sql
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Check what's using the port
lsof -i :8000
lsof -i :3000

# Kill the process or change ports in docker-compose.yml
```

**Permission Issues (Linux/Mac):**
```bash
# Fix Docker permission issues
sudo chown -R $USER:$USER .

# Or run Docker commands with sudo
sudo docker-compose up
```

**Database Connection Issues:**
```bash
# Restart database service
docker-compose restart db

# Check database logs
docker-compose logs db
```

**Build Failures:**
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Getting Help

1. **Check the logs**: `docker-compose logs [service-name]`
2. **Verify environment**: Ensure `.env` file is properly configured
3. **Review documentation**: Check relevant sections in this documentation
4. **Test in isolation**: Run services individually to isolate issues

## 📚 Next Steps

Once you have the development environment running:

1. **Explore the codebase** - Familiarize yourself with the Django apps and React components
2. **Review the architecture** - Read the [System Architecture](../architecture/architecture.md) documentation
3. **Check the project plan** - Understand the development phases in [Project Plan](../plan.md)
4. **Start developing** - Begin with [Phase 1 tasks](../phases/phase-1-foundation.md)

## 🔄 Keeping Up to Date

```bash
# Pull latest changes
git pull origin main

# Rebuild containers with updates
docker-compose build

# Update dependencies
docker-compose exec backend pip install -r requirements.txt
docker-compose exec frontend npm install
```

---

You're now ready to start developing! For detailed implementation guidance, proceed to the [Phase 1 Foundation](../phases/phase-1-foundation.md) documentation.