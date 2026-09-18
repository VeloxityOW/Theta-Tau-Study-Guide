-- Theta Tau Pledge Portal: members, roles, and saved study progress.
create type public.portal_role as enum ('pnm', 'nme', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role public.portal_role not null default 'pnm',
  created_at timestamptz not null default now()
);

create table public.pledge_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  term text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.class_memberships (
  class_id uuid not null references public.pledge_classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (class_id, user_id)
);

create table public.question_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null,
  correct_count integer not null default 0 check (correct_count >= 0),
  wrong_count integer not null default 0 check (wrong_count >= 0),
  mastered boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_name text not null,
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  completed_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('nme', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.pledge_classes to authenticated;
grant select, insert, update, delete on public.class_memberships to authenticated;
grant select, insert, update, delete on public.question_progress to authenticated;
grant select, insert on public.quiz_attempts to authenticated;

alter table public.profiles enable row level security;
alter table public.pledge_classes enable row level security;
alter table public.class_memberships enable row level security;
alter table public.question_progress enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "users read own profile; staff read all" on public.profiles for select
  using (id = auth.uid() or public.is_staff());
create policy "users update own display name; admins update profiles" on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "signed-in users see active classes" on public.pledge_classes for select using (active or public.is_staff());
create policy "admins manage classes" on public.pledge_classes for all using (public.is_admin());

create policy "members see own memberships; staff read all" on public.class_memberships for select using (user_id = auth.uid() or public.is_staff());
create policy "admins manage memberships" on public.class_memberships for all using (public.is_admin());

create policy "users manage own progress; staff read all" on public.question_progress for select using (user_id = auth.uid() or public.is_staff());
create policy "users insert own progress" on public.question_progress for insert with check (user_id = auth.uid());
create policy "users update own progress" on public.question_progress for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users see own attempts; staff read all" on public.quiz_attempts for select using (user_id = auth.uid() or public.is_staff());
create policy "users create own attempts" on public.quiz_attempts for insert with check (user_id = auth.uid());

-- After your first login, promote yourself in the SQL Editor with:
-- update public.profiles set role = 'admin' where email = 'your-email@example.com';
