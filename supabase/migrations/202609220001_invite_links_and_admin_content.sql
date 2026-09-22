-- Reusable, capped PNM invite links plus admin-only question-library edits.
create extension if not exists pgcrypto;

create table public.invite_links (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  label text not null default 'PNM invite link',
  max_uses integer not null check (max_uses between 1 and 500),
  use_count integer not null default 0 check (use_count >= 0),
  active boolean not null default true,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.invite_links enable row level security;
create policy "staff can read invite links" on public.invite_links for select to authenticated using (public.is_staff());
create policy "staff can create invite links" on public.invite_links for insert to authenticated with check (public.is_staff());
create policy "staff can update invite links" on public.invite_links for update to authenticated using (public.is_staff()) with check (public.is_staff());
grant select, insert, update on public.invite_links to authenticated;

create or replace function public.consume_invite_link(p_token text)
returns table(id uuid, label text)
language plpgsql security definer set search_path = public
as $$
begin
  return query
  update public.invite_links
     set use_count = use_count + 1
   where token_hash = encode(digest(p_token, 'sha256'), 'hex')
     and active = true
     and use_count < max_uses
     and (expires_at is null or expires_at > now())
  returning invite_links.id, invite_links.label;
end;
$$;

-- Existing policy allowed NMEs to alter the shared library. Admins only now.
drop policy if exists "staff manage study question changes" on public.study_questions;
create policy "admins manage study question changes"
  on public.study_questions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
