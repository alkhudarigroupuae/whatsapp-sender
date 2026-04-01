-- Phone / SMS OTP authentication
alter table users add column if not exists phone text;
create unique index if not exists users_phone_uidx on users(phone) where phone is not null;

create table if not exists otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  expires_at timestamptz not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_codes_phone on otp_codes(phone, created_at desc);

-- Password reset tokens
create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_resets_token on password_resets(token);
