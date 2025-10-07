-- Remove premium feature flag from app_settings
DELETE FROM app_settings WHERE key = 'features';