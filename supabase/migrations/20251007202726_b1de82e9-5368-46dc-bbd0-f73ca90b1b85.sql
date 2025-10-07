-- Step 1: Add super_admin role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';