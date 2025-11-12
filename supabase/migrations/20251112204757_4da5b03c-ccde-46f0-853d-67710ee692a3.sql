-- Clean reinstall of pg_net so functions are available under net.*
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    EXECUTE 'DROP EXTENSION pg_net CASCADE';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'net') THEN
    EXECUTE 'DROP SCHEMA net CASCADE';
  END IF;
END
$$;

-- Recreate the extension (this creates the net schema and functions)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Ensure privileges for runtime roles
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA net GRANT EXECUTE ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- Recreate handle_new_user with safe email block and proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $function$
DECLARE
  v_role text;
  v_name text;
  default_clinic_id uuid;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

  SELECT id INTO default_clinic_id FROM clinics LIMIT 1;
  IF default_clinic_id IS NULL THEN
    INSERT INTO public.clinics (name) VALUES ('Montrose Dental Centre')
    RETURNING id INTO default_clinic_id;
  END IF;

  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role::user_role)
  ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        role = COALESCE(EXCLUDED.role, users.role);

  IF v_role = 'patient' THEN
    INSERT INTO public.patients (user_id, clinic_id, status, program_variant)
    VALUES (NEW.id, default_clinic_id, 'active', 'frenectomy')
    ON CONFLICT (user_id) DO NOTHING;

    BEGIN
      PERFORM net.http_post(
        url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-onboarding-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key', true)
        ),
        body := jsonb_build_object(
          'userId', NEW.id::text,
          'email', NEW.email,
          'name', v_name
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Onboarding email failed: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$function$;

-- Diagnostic test for pg_net (non-blocking)
DO $do$
DECLARE
  resp jsonb;
BEGIN
  BEGIN
    SELECT net.http_post(
      url := 'https://httpbin.org/post',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := '{"test":"ok"}'::jsonb
    ) INTO resp;
    RAISE NOTICE 'pg_net diagnostic status: %', COALESCE(resp->>'status', 'unknown');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_net diagnostic failed: %', SQLERRM;
  END;
END
$do$;