-- Fix security issue: Set view to use SECURITY INVOKER mode
ALTER VIEW v_weekly_metrics SET (security_invoker = on);