
-- Fix: Drop the problematic FK, clean up, then recreate
ALTER TABLE public.audit_log DROP CONSTRAINT IF EXISTS audit_log_actor_id_fkey;

-- Now delete the test users
DELETE FROM public.users WHERE email IN (
  'asadmaqbool265@gmail.com','jon@testing.com','samantha.raniak@fakemail23.com','samantha.raniak@fakemail22.com','samantha.raniak@fakemail21.com','test@testerson.com','test@tester.com','samantha.raniak@fakemail7.com','samantha.raniak@fakemail100.com','jonathan@testing.com','jon@timetesting.com','elexaexender@gmail.com','samantha.raniak@fakemail4.com','samantha.raniak@fakemail3.com','samantha.raniak@fakemail2.com','samantha.raniak@fakemail.com','mitch_soetisna@hotmail.com','deleted_b4bce0a3-c749-4699-9ad2-0ccf11d64f3e@anonymized.local','jonathandmorrison@gmail.com'
);

-- Recreate FK
ALTER TABLE public.audit_log 
  ADD CONSTRAINT audit_log_actor_id_fkey 
  FOREIGN KEY (actor_id) REFERENCES auth.users(id);
