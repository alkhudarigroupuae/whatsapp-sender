create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  plan text not null default 'free' check (plan in ('free','pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_subscription_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_plan on users(plan);
create index if not exists idx_users_stripe_customer_id on users(stripe_customer_id);
create index if not exists idx_users_stripe_subscription_id on users(stripe_subscription_id);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  name text,
  phone text not null,
  company text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_user_id, phone)
);

create index if not exists idx_contacts_owner_created on contacts(owner_user_id, created_at desc);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  campaign_idea text not null,
  product_description text not null,
  promotion_details text not null,
  campaign_description text not null,
  media jsonb,
  status text not null default 'draft' check (status in ('draft','queued','sending','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_campaigns_owner_created on campaigns(owner_user_id, created_at desc);

create table if not exists message_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  phone text not null,
  message text not null,
  media jsonb,
  status text not null default 'queued' check (status in ('queued','sent','failed','retrying')),
  attempt_count int not null default 0,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_message_logs_owner_campaign_created on message_logs(owner_user_id, campaign_id, created_at desc);
create index if not exists idx_message_logs_owner_campaign_status on message_logs(owner_user_id, campaign_id, status);

create table if not exists send_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  log_id uuid not null references message_logs(id) on delete cascade,
  phone text not null,
  message text not null,
  media_path text,
  status text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  attempt_count int not null default 0,
  next_run_at timestamptz not null,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_send_jobs_next_run on send_jobs(status, next_run_at);
create index if not exists idx_send_jobs_owner_campaign on send_jobs(owner_user_id, campaign_id);

create table if not exists usage (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  period_key text not null,
  sent_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_user_id, period_key)
);

create table if not exists rate_limits (
  key text primary key,
  window_start timestamptz not null,
  sent_count int not null,
  updated_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

