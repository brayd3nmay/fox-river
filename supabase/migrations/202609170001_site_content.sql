-- Owner identities are managed by the project administrator, never by the public app.
create table public.site_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.site_owners enable row level security;
revoke all on public.site_owners from anon, authenticated;

create function public.is_site_owner() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.site_owners where user_id = auth.uid()); $$;
revoke all on function public.is_site_owner() from public;
grant execute on function public.is_site_owner() to anon, authenticated;

create table public.site_content (
  id text primary key check (id in ('draft', 'published')),
  content jsonb,
  version integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  check (content is null or jsonb_typeof(content) = 'object')
);
insert into public.site_content(id) values ('draft'), ('published');
alter table public.site_content enable row level security;
revoke all on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;
create policy "Visitors read published content only" on public.site_content
  for select to anon, authenticated using (id = 'published' or public.is_site_owner());

create function public.save_site_draft(new_content jsonb, expected_version integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare current_version integer;
begin
  if not public.is_site_owner() then raise exception 'Owner access required' using errcode = '42501'; end if;
  if new_content is null or jsonb_typeof(new_content) <> 'object' or octet_length(new_content::text) > 500000 then
    raise exception 'Invalid content';
  end if;
  select version into current_version from public.site_content where id = 'draft' for update;
  if expected_version is null or current_version <> expected_version then
    raise exception 'This draft changed in another session. Reload before saving.' using errcode = '40001';
  end if;
  update public.site_content set content = new_content, version = current_version + 1,
    updated_at = now(), updated_by = auth.uid() where id = 'draft';
  return current_version + 1;
end; $$;

create function public.publish_site_draft(expected_version integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare draft public.site_content;
begin
  if not public.is_site_owner() then raise exception 'Owner access required' using errcode = '42501'; end if;
  select * into draft from public.site_content where id = 'draft' for update;
  if expected_version is null or draft.version <> expected_version then
    raise exception 'This draft changed in another session. Reload before publishing.' using errcode = '40001';
  end if;
  if draft.content is null then raise exception 'Save a draft before publishing'; end if;
  update public.site_content set content = draft.content, version = draft.version,
    updated_at = now(), updated_by = auth.uid() where id = 'published';
  return draft.version;
end; $$;

revoke all on function public.save_site_draft(jsonb, integer) from public;
revoke all on function public.publish_site_draft(integer) from public;
grant execute on function public.save_site_draft(jsonb, integer) to authenticated;
grant execute on function public.publish_site_draft(integer) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 52428800, array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']);
create policy "Approved owners upload site media" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-media' and public.is_site_owner() and (storage.foldername(name))[1] = auth.uid()::text);
-- Files use immutable UUID names. Replacement uploads create a new object, preserving old published media.
create policy "Owners inspect site media" on storage.objects
  for select to authenticated using (bucket_id = 'site-media' and public.is_site_owner());
