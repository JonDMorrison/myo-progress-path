-- Grant super_admin role to jon@getclear.ca
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'jon@getclear.ca';