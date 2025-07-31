# Code Quality & Pre-commit Setup

This document explains how to maintain high code quality using automated tools and pre-commit hooks.

## Overview

The Safe Job Platform uses several tools to ensure consistent, high-quality code:

- **Black**: Code formatting
- **isort**: Import sorting
- **Ruff**: Fast Python linting
- **Bandit**: Security vulnerability scanning
- **MyPy**: Static type checking
- **Pre-commit**: Automated git hooks

## Pre-commit Hooks

Pre-commit hooks automatically run code quality checks before each commit, ensuring that only clean, properly formatted code enters the repository.

### Installation

#### Quick Setup with Makefile

```bash
# Install hooks
make install-hooks

# Test all hooks
make run-hooks
```

#### Manual Installation

```bash
# Install pre-commit (if not already installed)
pip install pre-commit

# Install the hooks in your git repository
pre-commit install

# Optional: Install hooks for push events too
pre-commit install --hook-type pre-push

# Test on all files
pre-commit run --all-files
```

### What Runs on Each Commit

When you commit code, these checks run automatically:

#### Standard Checks
- Remove trailing whitespace
- Fix end of files (ensure newline)
- Check YAML syntax (except mkdocs.yml)
- Check for large files (>1MB)
- Check for merge conflicts

#### Python Code Quality (backend files only)
- **Black**: Format code to consistent style
- **isort**: Sort and organize imports
- **Ruff**: Lint code for errors and style issues
- **Bandit**: Scan for security vulnerabilities

#### File Security
- Check for accidentally committed `.env.*.local` files
- Prevent committing sensitive files

#### Docker
- Lint Dockerfiles with hadolint

### Configuration

The pre-commit configuration is in `.pre-commit-config.yaml`:

```yaml
repos:
  # Standard pre-commit hooks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
        exclude: ^mkdocs\.yml$  # MkDocs uses special YAML tags
      - id: check-added-large-files
        args: ['--maxkb=1000']

  # Python formatting and linting
  - repo: https://github.com/psf/black
    rev: 25.1.0
    hooks:
      - id: black
        files: ^backend/
        language_version: python3.13

  - repo: https://github.com/pycqa/isort
    rev: 6.0.1
    hooks:
      - id: isort
        files: ^backend/
        args: ["--profile", "black"]

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.12.5
    hooks:
      - id: ruff
        files: ^backend/
        args: [--fix, --exit-non-zero-on-fix]

  # Security scanning
  - repo: https://github.com/PyCQA/bandit
    rev: 1.8.6
    hooks:
      - id: bandit
        files: ^backend/
        args: ['-r', '--skip', 'B101,B601']
        exclude: ^backend/.*/(migrations|tests)/.*$
```

## Tool Configuration

### Black (Code Formatting)

Configuration in `backend/pyproject.toml`:

```toml
[tool.black]
line-length = 88
target-version = ['py313']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.mypy_cache
  | \.venv
  | build
  | dist
  | migrations
)/
'''
```

### isort (Import Sorting)

Configuration in `backend/pyproject.toml`:

```toml
[tool.isort]
profile = "black"
line_length = 88
multi_line_output = 3
include_trailing_comma = true
force_grid_wrap = 0
use_parentheses = true
ensure_newline_before_comments = true
skip = ["migrations"]
```

### Ruff (Linting)

Configuration in `backend/pyproject.toml`:

```toml
[tool.ruff]
target-version = "py313"
line-length = 88

[tool.ruff.lint]
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
]
ignore = [
    "E501", # line too long, handled by black
    "B008", # do not perform function calls in argument defaults
    "C901", # too complex
]

[tool.ruff.lint.per-file-ignores]
"__init__.py" = ["F401"]
"*/migrations/*" = ["E501"]
```

## Manual Code Quality Checks

### Using Makefile (Recommended)

```bash
# Format code
make format

# Run all linting and quality checks
make lint

# Backend-specific linting
make lint-backend

# Security checks
make security-check

# Run all CI checks locally
make ci
```

### Run Individual Tools (Advanced)

If you need to run specific tools directly:

```bash
# Format code with individual tools
docker compose exec backend poetry run black .
docker compose exec backend poetry run isort .

# Lint code
docker compose exec backend poetry run ruff check .

# Type checking
docker compose exec backend poetry run mypy .

# Security scanning
docker compose exec backend poetry run bandit -r .
docker compose exec backend poetry run safety check
```

## IDE Integration

### VS Code

Install these extensions for automatic formatting and linting:

- **Python** (ms-python.python)
- **Black Formatter** (ms-python.black-formatter)
- **Ruff** (charliermarsh.ruff)
- **isort** (ms-python.isort)

Add to your VS Code settings (`settings.json`):

```json
{
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.linting.ruffEnabled": true,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    },
    "python.sortImports.args": ["--profile", "black"]
}
```

### PyCharm

1. Install Black plugin: **File → Settings → Plugins → Search "BlackConnect"**
2. Configure Black: **File → Settings → Tools → Black**
3. Enable format on save: **File → Settings → Tools → Actions on Save**
4. Configure Ruff: **File → Settings → Editor → Inspections → Python**

## Bypassing Hooks (Emergency)

In rare cases, you might need to bypass pre-commit hooks:

```bash
# Skip all pre-commit hooks (use with caution!)
git commit --no-verify -m "Emergency fix"

# Skip specific files (better approach)
# Fix the issues locally, then commit normally
```

## Common Issues & Solutions

### "Hook failed" Error

If a hook fails:

1. **Read the error message** - it usually tells you exactly what's wrong
2. **Fix the issue** manually or let the tool fix it automatically
3. **Stage the changes** that were automatically fixed
4. **Commit again**

Example workflow:
```bash
# Make changes to code
git add .
git commit -m "Add new feature"

# If pre-commit fails with formatting issues:
# The tools often fix issues automatically
git add .  # Stage the auto-fixes
git commit -m "Add new feature"  # Commit again
```

### Large Files Rejected

If pre-commit rejects large files:

```bash
# Check file sizes
find . -type f -size +1M

# Either:
# 1. Remove/reduce the file size
# 2. Add to .gitignore if it shouldn't be tracked
# 3. Use Git LFS for legitimate large files
```

### Python Import Errors

If you get import errors in hooks:

```bash
# Check that backend service is running
make dev

# Check that dependencies are installed
make install-deps

# Run Django check manually
docker compose exec backend python manage.py check

# Or check service health
make health
```

## Best Practices

### Development Workflow

1. **Install hooks early**: Run `make install-hooks` when you first clone the repo
2. **Commit often**: Small, frequent commits are easier to fix if hooks fail
3. **Test before committing**: Run `make lint` before committing large changes
4. **Read hook output**: The error messages are usually helpful and actionable

### Code Style Guidelines

1. **Let Black handle formatting**: Don't fight with Black's formatting decisions
2. **Organize imports logically**: isort handles the mechanics, you focus on logic
3. **Fix linting issues promptly**: Don't let Ruff warnings accumulate
4. **Write type hints**: MyPy can catch bugs early with proper type hints

### Security Practices

1. **Never commit secrets**: The hooks will catch `.env.*.local` files
2. **Review Bandit warnings**: Security issues should be addressed immediately
3. **Keep dependencies updated**: Run `make security-check` regularly

## CI/CD Integration

Pre-commit hooks are also enforced in CI/CD:

- **GitHub Actions**: The CI pipeline runs all these checks
- **Branch Protection**: PRs cannot be merged if CI checks fail
- **Consistent Environment**: Same tools and versions in CI and local development

This ensures that code quality is maintained across all environments and contributors.

## Updating Hook Versions

To update pre-commit hook versions:

```bash
# Update all hooks to latest versions
pre-commit autoupdate

# Update specific hook
pre-commit autoupdate --repo https://github.com/psf/black

# Test updated hooks
make run-hooks
```

## Troubleshooting

### Clean Pre-commit Cache

If hooks behave unexpectedly:

```bash
# Clean pre-commit cache
pre-commit clean

# Reinstall hooks
pre-commit install --install-hooks

# Test
make run-hooks
```

### Skip Specific Files

Add patterns to exclude files in `.pre-commit-config.yaml`:

```yaml
- id: black
  exclude: ^path/to/legacy/code/
```

### Performance Issues

If pre-commit is slow:

```bash
# Run hooks in parallel (if supported)
make run-hooks

# Skip slow hooks during development
SKIP=bandit git commit -m "WIP: development changes"
```

Remember: Pre-commit hooks are there to help maintain code quality and catch issues early. Embrace them as part of your development workflow!
