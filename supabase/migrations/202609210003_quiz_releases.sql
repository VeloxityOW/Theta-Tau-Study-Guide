-- Release pledge material by quiz instead of managing individual cards.
create table public.quiz_releases (
  quiz_name text primary key,
  is_visible boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.quiz_releases enable row level security;

create policy "signed-in users can read quiz releases"
  on public.quiz_releases for select to authenticated using (true);

create policy "staff manage quiz releases"
  on public.quiz_releases for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

grant select, insert, update, delete on public.quiz_releases to authenticated;

insert into public.quiz_releases (quiz_name, is_visible) values
  ('Quiz 1', true),
  ('Quiz 2', false),
  ('Quiz 3', false),
  ('Quiz 4', false),
  ('Quiz 5', false),
  ('Quiz 6', false)
on conflict (quiz_name) do nothing;
