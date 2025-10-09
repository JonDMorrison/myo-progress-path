-- Update handle_new_user() to trigger onboarding email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role text;
  v_name text;
  default_clinic_id uuid;
BEGIN
  -- Extract role from metadata, default to 'patient'
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  
  -- Extract name from metadata, or use email prefix
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  
  -- Get default clinic
  SELECT id INTO default_clinic_id FROM clinics LIMIT 1;
  
  -- If no clinic exists, create a default one
  IF default_clinic_id IS NULL THEN
    INSERT INTO public.clinics (name) VALUES ('Montrose Dental Centre')
    RETURNING id INTO default_clinic_id;
  END IF;
  
  -- Insert or update user
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role::user_role)
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, users.name),
      role = COALESCE(EXCLUDED.role, users.role);
  
  -- If role is patient, create patient record and send onboarding email
  IF v_role = 'patient' THEN
    INSERT INTO public.patients (user_id, clinic_id, status, program_variant)
    VALUES (NEW.id, default_clinic_id, 'active', 'frenectomy')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Trigger onboarding email (async, non-blocking)
    -- This uses pg_net to call the edge function
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
  END IF;
  
  RETURN NEW;
END;
$function$;