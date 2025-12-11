-- Add policy for super_admins to manage exercises
CREATE POLICY "Super admins can manage exercises"
ON public.exercises
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());