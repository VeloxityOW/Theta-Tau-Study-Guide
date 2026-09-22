-- Live portal additions: shared question edits and staff-managed access.
create table public.study_questions (
  id text primary key,
  question text not null,
  answer text not null,
  mode text not null default 'exact' check (mode in ('exact', 'contains', 'multi')),
  category text,
  quiz text,
  is_custom boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.study_questions enable row level security;

create policy "signed-in users can read study question changes"
  on public.study_questions for select to authenticated using (true);

create policy "staff manage study question changes"
  on public.study_questions for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create or replace function public.touch_study_question()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

create trigger study_questions_touched
  before insert or update on public.study_questions
  for each row execute procedure public.touch_study_question();

grant select, insert, update, delete on public.study_questions to authenticated;
