# Environment Configuration

This directory contains environment configuration files for different deployment environments.

## Files Structure

- `.env.example` - Template file with all available configuration options
- `.env.development.template` - Development template with placeholder values
- `.env.development.local` - Active development configuration (generated with secure passwords)
- `.env.production` - Production environment template

## Usage

### Development Setup

1. **Initial Setup**: The development environment is already configured with secure passwords in `.env.development.local`

2. **New Development Setup**: If you need to create a new development environment:
   ```bash
   cp .envs/.env.example .envs/.env.development.local
   # Edit the file and add your configuration
   ```

3. **Generate Secure Passwords**: Use the setup script to generate secure passwords:
   ```bash
   ./scripts/setup-dev.sh
   ```

### Production Setup

1. Copy the production template:
   ```bash
   cp .envs/.env.production .envs/.env.production.local
   ```

2. Update all placeholder values with secure production values

3. Update docker-compose.yml or deployment scripts to use the production env file

## Security Notes

- **Never commit `.env.*.local` files** - they contain secrets
- **Always use secure passwords** in production
- **Review all environment variables** before deployment
- **Use different databases** for different environments

## Current Active Environment

The project currently uses: `.envs/.env.development.local`

This is referenced in:
- `docker-compose.yml`
- Root `.env` symlink (for compatibility)

## CI/CD Environment

For GitHub Actions CI/CD, the system uses: `.envs/.env.test`

This provides:
- Fast in-memory SQLite with Spatialite for tests
- Locmem caching for speed
- Minimal logging for clean test output
- Disabled rate limiting for reliable tests

## Environment Variable Summary

| Environment | File | Database | Cache | Purpose |
|-------------|------|----------|-------|---------|
| Development | `.env.development.local` | PostgreSQL + PostGIS | Redis | Local development |
| Testing | `.env.test` | SQLite + Spatialite | In-memory | CI/CD & automated tests |
| Production | `.env.production` | PostgreSQL + PostGIS | Redis | Production deployment |
