-- Fix infinite recursion: Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = _user_id;
$$;

-- Drop and recreate users_staff policy without recursion
DROP POLICY IF EXISTS "users_staff" ON public.users;
CREATE POLICY "users_staff" 
ON public.users 
FOR SELECT 
USING (
  public.get_user_role(auth.uid()) IN ('therapist', 'admin')
);

-- Update handle_new_user to create patient record for patient role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- If role is patient, create patient record
  IF v_role = 'patient' THEN
    INSERT INTO public.patients (user_id, clinic_id, status, program_variant)
    VALUES (NEW.id, default_clinic_id, 'active', 'frenectomy')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;