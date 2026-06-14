-- Add requires_video to v_master_patient_list so the therapist Patients
-- list can display the patient's tier (video / self-guided) alongside
-- their program pathway. CREATE OR REPLACE VIEW requires existing column
-- order be preserved, so the new column is appended at the end.
create or replace view public.v_master_patient_list as
 SELECT p.id AS patient_id,
    p.user_id,
    p.name AS patient_name,
    p.email AS patient_email,
    COALESCE(p.program_variant, 'frenectomy'::text) AS program_variant,
    p.created_at AS enrolled_at,
    p.assigned_therapist_id AS therapist_id,
    tu.name AS therapist_name,
    tu.email AS therapist_email,
    w.number AS current_week_number,
    pwp.status AS current_week_status,
    GREATEST(pwp.updated_at, pwp.submitted_at, pwp.approved_at) AS last_activity,
    NULL::numeric AS adherence_14d,
    NULL::uuid AS clinic_id,
    NULL::text AS clinic_name,
        CASE
            WHEN p.assigned_therapist_id IS NULL THEN 'inactive'::text
            WHEN pwp.status = 'approved'::text AND w.number >= 24 THEN 'completed'::text
            ELSE 'active'::text
        END AS patient_status,
    p.requires_video
   FROM patients p
     LEFT JOIN users tu ON tu.id = p.assigned_therapist_id
     LEFT JOIN LATERAL ( SELECT pwp2.status,
            pwp2.updated_at,
            pwp2.submitted_at,
            pwp2.approved_at,
            pwp2.week_id
           FROM patient_week_progress pwp2
          WHERE pwp2.patient_id = p.id
          ORDER BY pwp2.created_at DESC
         LIMIT 1) pwp ON true
     LEFT JOIN weeks w ON w.id = pwp.week_id;
