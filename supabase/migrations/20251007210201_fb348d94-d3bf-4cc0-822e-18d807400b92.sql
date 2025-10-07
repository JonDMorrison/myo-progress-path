-- Create audit log table (immutable, append-only)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  actor_email text,
  action text not null,
  target_type text not null,
  target_id uuid,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Enable RLS on audit_log
alter table public.audit_log enable row level security;

-- Only super admins and system can insert audit logs
create policy "System can insert audit logs"
  on public.audit_log for insert
  with check (true);

-- Super admins can read all audit logs
create policy "Super admins can read audit logs"
  on public.audit_log for select
  using (is_super_admin());

-- Staff can read audit logs for their actions
create policy "Staff can read their own audit logs"
  on public.audit_log for select
  using (
    actor_id = auth.uid() 
    and exists (
      select 1 from public.users 
      where id = auth.uid() 
      and role in ('therapist', 'admin')
    )
  );

-- Prevent updates and deletes (immutable logs)
create rule prevent_audit_update as
  on update to public.audit_log
  do instead nothing;

create rule prevent_audit_delete as
  on delete to public.audit_log
  do instead nothing;

-- Add MFA column to users table
alter table public.users 
  add column if not exists mfa_enabled boolean default false,
  add column if not exists mfa_enforced_at timestamptz;

-- Create patient exports bucket for data export
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('patient-exports', 'patient-exports', false, 52428800, array['application/zip', 'application/json'])
on conflict (id) do nothing;

-- Storage policies for patient exports (super admin only)
create policy "Super admins can upload patient exports"
  on storage.objects for insert
  with check (
    bucket_id = 'patient-exports' 
    and is_super_admin()
  );

create policy "Super admins can read patient exports"
  on storage.objects for select
  using (
    bucket_id = 'patient-exports' 
    and is_super_admin()
  );

create policy "Super admins can delete patient exports"
  on storage.objects for delete
  using (
    bucket_id = 'patient-exports' 
    and is_super_admin()
  );

-- Create index on audit_log for common queries
create index if not exists idx_audit_log_actor on public.audit_log(actor_id);
create index if not exists idx_audit_log_target on public.audit_log(target_type, target_id);
create index if not exists idx_audit_log_created on public.audit_log(created_at desc);
create index if not exists idx_audit_log_action on public.audit_log(action);