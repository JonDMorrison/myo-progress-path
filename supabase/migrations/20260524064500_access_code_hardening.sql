create or replace function public.generate_access_code(
  p_program_variant text,
  p_requires_video boolean,
  p_description text default null,
  p_max_uses integer default null,
  p_expires_at timestamp with time zone default null
)
returns public.access_codes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_row public.access_codes;
begin
  if not exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role in ('therapist','admin','super_admin')
  ) then
    raise exception 'not authorized';
  end if;

  if p_program_variant not in ('frenectomy','non_frenectomy','standard') then
    raise exception 'invalid program variant';
  end if;

  loop
    v_code := 'MONTROSE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.access_codes where code = v_code);
  end loop;

  insert into public.access_codes (
    code,
    program_variant,
    requires_video,
    description,
    active,
    approval_required,
    created_by,
    expires_at,
    max_uses
  ) values (
    v_code,
    p_program_variant,
    p_requires_video,
    p_description,
    true,
    true,
    auth.uid(),
    p_expires_at,
    p_max_uses
  ) returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.record_access_code_use(p_code_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.access_codes
  set uses = uses + 1
  where id = p_code_id
    and active = true;
end;
$$;
