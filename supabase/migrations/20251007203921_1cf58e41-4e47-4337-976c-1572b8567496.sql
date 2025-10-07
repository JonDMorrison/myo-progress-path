-- Update handle_new_user trigger to support role metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role text;
  v_name text;
  default_clinic_id uuid;
BEGIN
  -- Extract role from metadata, default to 'patient'
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  
  -- Extract name from metadata, or use email prefix
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  
  -- Get default clinic (only needed for non-super-admin users)
  IF v_role != 'super_admin' THEN
    SELECT id INTO default_clinic_id FROM clinics LIMIT 1;
  END IF;
  
  -- Insert or update user
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role::user_role)
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, users.name),
      role = COALESCE(EXCLUDED.role, users.role);
  
  RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();