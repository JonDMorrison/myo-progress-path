alter table public.patients
  add column if not exists access_code_id uuid,
  add column if not exists access_approved_at timestamp with time zone,
  add column if not exists access_approved_by uuid references public.users(id),
  add column if not exists access_requested_at timestamp with time zone default now();

update public.patients
set access_approved_at = coalesce(access_approved_at, created_at),
    access_requested_at = coalesce(access_requested_at, created_at)
where access_approved_at is null;

create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  program_variant text not null check (program_variant in ('frenectomy','non_frenectomy','standard')),
  requires_video boolean not null default true,
  description text,
  active boolean not null default true,
  approval_required boolean not null default true,
  created_by uuid references public.users(id),
  created_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone,
  max_uses integer,
  uses integer not null default 0
);

alter table public.patients
  drop constraint if exists patients_access_code_id_fkey;

alter table public.patients
  add constraint patients_access_code_id_fkey foreign key (access_code_id) references public.access_codes(id);

create index if not exists idx_access_codes_code on public.access_codes(lower(code));
create index if not exists idx_patients_access_approved_at on public.patients(access_approved_at);

alter table public.access_codes enable row level security;

drop policy if exists "Staff can manage access codes" on public.access_codes;
create policy "Staff can manage access codes" on public.access_codes
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('therapist','admin','super_admin')
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('therapist','admin','super_admin')
    )
  );

drop policy if exists "Authenticated users can read active access codes" on public.access_codes;
create policy "Authenticated users can read active access codes" on public.access_codes
  for select using (auth.uid() is not null and active = true);

create or replace function public.approve_patient_access(p_patient_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.patients
  set access_approved_at = now(),
      access_approved_by = auth.uid()
  where id = p_patient_id
    and exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('therapist','admin','super_admin')
    );
end;
$$;

insert into public.access_codes (code, program_variant, requires_video, description, active, approval_required)
values
  ('MONTROSE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)), 'frenectomy', false, 'Frenectomy no-video generated code', true, true),
  ('MONTROSE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)), 'frenectomy', true, 'Frenectomy video generated code', true, true),
  ('MONTROSE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)), 'non_frenectomy', false, 'Non-frenectomy no-video generated code', true, true),
  ('MONTROSE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)), 'non_frenectomy', true, 'Non-frenectomy video generated code', true, true)
on conflict (code) do nothing;
