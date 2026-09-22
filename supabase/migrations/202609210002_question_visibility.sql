-- Controls which question cards are released to PNMs each week.
alter table public.study_questions
  add column if not exists is_visible boolean not null default true;
