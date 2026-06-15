alter table public.messages
  add column if not exists video_url text,
  add column if not exists photo_url text,
  add column if not exists therapist_feedback_id uuid;

do $$
begin
  alter table public.messages
    add constraint messages_therapist_feedback_id_fkey
    foreign key (therapist_feedback_id)
    references public.therapist_feedback(id)
    on delete set null;
exception
  when duplicate_object then null;
end $$;

update public.messages m
set
  video_url = coalesce(m.video_url, tf.video_url),
  photo_url = coalesce(m.photo_url, tf.photo_url),
  therapist_feedback_id = coalesce(m.therapist_feedback_id, tf.id)
from public.therapist_feedback tf
where m.patient_id = tf.patient_id
  and m.therapist_id = tf.therapist_id
  and m.week_id is not distinct from tf.week_id
  and abs(extract(epoch from (coalesce(m.created_at, now())::timestamptz - coalesce(tf.created_at, now())::timestamptz))) <= 15
  and (
    m.body = tf.feedback
    or m.body ilike '%[video attached]%'
    or m.body ilike '%[photo attached]%'
  )
  and (tf.video_url is not null or tf.photo_url is not null);
