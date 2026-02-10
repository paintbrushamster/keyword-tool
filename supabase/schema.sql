-- ===========================================
-- EtsyKeyword SaaS - Database Schema
-- Run this in your Supabase SQL Editor
-- ===========================================

-- User profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro')),
  subscription_status text not null default 'inactive' check (subscription_status in ('active', 'trialing', 'canceled', 'past_due', 'inactive')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  trial_ends_at timestamptz,
  keyword_searches_today integer not null default 0,
  ai_uses_today integer not null default 0,
  last_usage_reset date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can read and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keyword search history
create table if not exists public.keyword_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  query text not null,
  results_count integer,
  created_at timestamptz not null default now()
);

alter table public.keyword_searches enable row level security;

create policy "Users can view own searches"
  on public.keyword_searches for select
  using (auth.uid() = user_id);

create policy "Users can insert own searches"
  on public.keyword_searches for insert
  with check (auth.uid() = user_id);

-- AI optimization history
create table if not exists public.ai_optimizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  keyword text not null,
  description text,
  result_keywords jsonb,
  result_title text,
  result_description text,
  created_at timestamptz not null default now()
);

alter table public.ai_optimizations enable row level security;

create policy "Users can view own optimizations"
  on public.ai_optimizations for select
  using (auth.uid() = user_id);

create policy "Users can insert own optimizations"
  on public.ai_optimizations for insert
  with check (auth.uid() = user_id);

-- Function to reset daily usage counters
create or replace function public.reset_daily_usage()
returns void as $$
begin
  update public.profiles
  set keyword_searches_today = 0,
      ai_uses_today = 0,
      last_usage_reset = current_date
  where last_usage_reset < current_date;
end;
$$ language plpgsql security definer;

-- Index for faster queries
create index if not exists idx_keyword_searches_user_id on public.keyword_searches(user_id);
create index if not exists idx_ai_optimizations_user_id on public.ai_optimizations(user_id);
create index if not exists idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
