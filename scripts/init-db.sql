-- Initialize PostGIS extensions for Safe Job Platform
-- This script runs automatically when the PostgreSQL container starts

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable additional useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- Set up connection logging for development
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
ALTER SYSTEM SET log_statement = 'ddl';

-- Reload configuration
SELECT pg_reload_conf();

-- Verify PostGIS installation
SELECT PostGIS_Version();
