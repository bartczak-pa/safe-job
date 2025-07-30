-- Initialize PostGIS extensions for Safe Job Platform
-- This script runs automatically when the PostgreSQL container starts

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Enable additional useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for performance
-- These will be used by Django's GIS functionality
CREATE INDEX IF NOT EXISTS idx_spatial_ref_sys_srid ON spatial_ref_sys(srid);

-- Set up connection logging for development
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
ALTER SYSTEM SET log_statement = 'all';

-- Reload configuration
SELECT pg_reload_conf();

-- Verify PostGIS installation
SELECT PostGIS_Version();
