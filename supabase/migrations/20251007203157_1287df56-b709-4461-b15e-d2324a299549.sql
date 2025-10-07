-- Fix security warning: Enable SECURITY INVOKER on the view
ALTER VIEW v_master_patient_list SET (security_invoker = on);