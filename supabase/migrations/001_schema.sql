-- Kayumanggi Civic Super App MVP
-- Core PostgreSQL schema for Supabase

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Citizen',
  username text unique,
  avatar_url text,
  bio text,
  city text,
  barangay text,
  is_verified boolean not null default false,
  civic_score integer not null default 0 check (civic_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('citizen','moderator','lgu_staff','admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  body text not null check (length(trim(body)) between 1 and 10000),
  kind text not null default 'civic' check (kind in ('civic','community','government','emergency','media')),
  visibility text not null default 'public' check (visibility in ('public','followers','private')),
  group_id uuid,
  page_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like','support','care','insightful')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, reaction)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create table if not exists public.friendships (
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a <> user_b)
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  description text,
  visibility text not null default 'public' check (visibility in ('public','private')),
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname='posts_group_id_fkey') then
    alter table public.posts add constraint posts_group_id_fkey foreign key (group_id) references public.groups(id) on delete cascade;
  end if;
end $$;

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member','moderator','admin')),
  status text not null default 'active' check (status in ('pending','active','blocked')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  category text,
  description text,
  verified boolean not null default false,
  logo_url text,
  cover_url text,
  created_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname='posts_page_id_fkey') then
    alter table public.posts add constraint posts_page_id_fkey foreign key (page_id) references public.pages(id) on delete cascade;
  end if;
end $$;

create table if not exists public.page_followers (
  page_id uuid not null references public.pages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (page_id, user_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text,
  kind text not null default 'direct' check (kind in ('direct','group','project')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member','admin')),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 10000),
  attachment_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  price numeric(12,2) not null default 0 check (price >= 0),
  category text not null default 'General',
  condition text,
  location text,
  image_url text,
  status text not null default 'active' check (status in ('draft','active','reserved','sold','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete restrict,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid references public.profiles(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'requested' check (status in ('requested','accepted','completed','cancelled','disputed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  civic_credits numeric(14,2) not null default 0 check (civic_credits >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null,
  kind text not null check (kind in ('reward','adjustment','marketplace_demo','volunteer_reward')),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.civic_projects (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  sector text not null,
  status text not null default 'active' check (status in ('planned','active','delayed','completed','cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  budget numeric(16,2),
  spent numeric(16,2),
  location text,
  audited boolean not null default false,
  started_at date,
  target_end_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.civic_issues (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  status text not null default 'submitted' check (status in ('submitted','under_review','assigned','resolved','rejected')),
  location_text text,
  evidence_path text,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.officials (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text not null,
  branch text,
  jurisdiction text,
  party text,
  bio text,
  photo_url text,
  civic_score integer check (civic_score between 0 and 100),
  is_current boolean not null default true,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.official_deeds (
  id uuid primary key default gen_random_uuid(),
  official_id uuid not null references public.officials(id) on delete cascade,
  title text not null,
  detail text,
  rating text check (rating in ('positive','neutral','negative')),
  evidence_count integer not null default 0,
  deed_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.official_votes (
  official_id uuid not null references public.officials(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote text not null check (vote in ('trust','neutral','distrust')),
  created_at timestamptz not null default now(),
  primary key (official_id, user_id)
);

create table if not exists public.partylists (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  platform jsonb not null default '[]'::jsonb,
  verified boolean not null default false
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  acronym text,
  description text,
  website text,
  verified boolean not null default false
);

create table if not exists public.elections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  election_date date not null,
  scope text not null default 'local',
  status text not null default 'mock' check (status in ('mock','upcoming','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  full_name text not null,
  position text not null,
  party text,
  bio text,
  civic_score integer check (civic_score between 0 and 100),
  platform jsonb not null default '[]'::jsonb,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.mock_votes (
  election_id uuid not null references public.elections(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (election_id, user_id)
);

create table if not exists public.debate_threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  status text not null default 'open' check (status in ('open','locked','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.debate_votes (
  thread_id uuid not null references public.debate_threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote smallint not null check (vote in (-1,1)),
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  question text not null,
  description text,
  status text not null default 'active' check (status in ('draft','active','closed')),
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0
);

create table if not exists public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

create table if not exists public.charity_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  organization text,
  target_amount numeric(14,2),
  pledged_amount numeric(14,2) not null default 0,
  verified boolean not null default false,
  status text not null default 'active' check (status in ('draft','active','completed','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.donation_pledges (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.charity_campaigns(id) on delete cascade,
  donor_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  note text,
  status text not null default 'pledged' check (status in ('pledged','confirmed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  category text not null default 'community',
  cover_url text,
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'going' check (status in ('going','interested','not_going')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  excerpt text,
  body text,
  category text not null default 'civic',
  source_name text,
  image_url text,
  official boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid references public.profiles(id) on delete set null,
  title text not null,
  company text not null,
  location text,
  employment_type text,
  description text,
  status text not null default 'open' check (status in ('open','closed','archived')),
  posted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  note text,
  resume_path text,
  status text not null default 'submitted' check (status in ('draft','submitted','reviewing','shortlisted','rejected','hired','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);

create table if not exists public.resumes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text,
  summary text,
  experience jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb,
  skills text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.lost_found_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('lost','found','missing_person')),
  title text not null,
  description text not null,
  location_text text,
  evidence_path text,
  status text not null default 'open' check (status in ('open','matched','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.environmental_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  location_text text,
  evidence_path text,
  status text not null default 'submitted' check (status in ('submitted','reviewing','actioned','resolved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.civic_resources (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  module text not null,
  title text not null,
  subtitle text,
  description text,
  status text,
  action_label text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module text not null,
  request_type text not null,
  title text not null,
  details text,
  status text not null default 'submitted' check (status in ('draft','submitted','processing','completed','rejected','cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_author on public.posts(author_id);
create index if not exists idx_comments_post on public.comments(post_id, created_at);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_marketplace_status on public.marketplace_listings(status, created_at desc);
create index if not exists idx_civic_issues_status on public.civic_issues(status, created_at desc);
create index if not exists idx_resources_module on public.civic_resources(module, sort_order);
create index if not exists idx_news_published on public.news_articles(published_at desc);
create index if not exists idx_events_starts on public.events(starts_at);
create index if not exists idx_jobs_status on public.jobs(status, posted_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();
drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at before update on public.comments for each row execute function public.set_updated_at();
drop trigger if exists groups_set_updated_at on public.groups;
create trigger groups_set_updated_at before update on public.groups for each row execute function public.set_updated_at();
drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at before update on public.conversations for each row execute function public.set_updated_at();
drop trigger if exists marketplace_set_updated_at on public.marketplace_listings;
create trigger marketplace_set_updated_at before update on public.marketplace_listings for each row execute function public.set_updated_at();
drop trigger if exists orders_set_updated_at on public.marketplace_orders;
create trigger orders_set_updated_at before update on public.marketplace_orders for each row execute function public.set_updated_at();
drop trigger if exists projects_set_updated_at on public.civic_projects;
create trigger projects_set_updated_at before update on public.civic_projects for each row execute function public.set_updated_at();
drop trigger if exists issues_set_updated_at on public.civic_issues;
create trigger issues_set_updated_at before update on public.civic_issues for each row execute function public.set_updated_at();
drop trigger if exists jobs_apps_set_updated_at on public.job_applications;
create trigger jobs_apps_set_updated_at before update on public.job_applications for each row execute function public.set_updated_at();
drop trigger if exists lost_found_set_updated_at on public.lost_found_reports;
create trigger lost_found_set_updated_at before update on public.lost_found_reports for each row execute function public.set_updated_at();
drop trigger if exists environmental_set_updated_at on public.environmental_reports;
create trigger environmental_set_updated_at before update on public.environmental_reports for each row execute function public.set_updated_at();
drop trigger if exists resources_set_updated_at on public.civic_resources;
create trigger resources_set_updated_at before update on public.civic_resources for each row execute function public.set_updated_at();
drop trigger if exists service_requests_set_updated_at on public.service_requests;
create trigger service_requests_set_updated_at before update on public.service_requests for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1), 'Citizen'))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'citizen') on conflict do nothing;
  insert into public.wallets (user_id, civic_credits) values (new.id, 0) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
