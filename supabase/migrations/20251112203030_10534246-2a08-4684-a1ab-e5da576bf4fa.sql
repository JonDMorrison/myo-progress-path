-- Correct installation of pg_net to provide net.* functions
-- Remove wrongly-installed extension (if any) and install without overriding schema
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Ensure the net schema is accessible
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO postgres, anon, authenticated, service_role;