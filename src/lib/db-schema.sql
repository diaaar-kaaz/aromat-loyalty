-- Aromat Loyalty System — Supabase Schema

create table customers (
  id uuid default gen_random_uuid() primary key,
  phone text unique not null,
  name text not null,
  level text not null default 'nan' check (level in ('nan', 'kumis', 'altyn', 'vip')),
  total_spent integer not null default 0,
  bonus_balance integer not null default 0,
  created_at timestamptz default now()
);

create table bonus_transactions (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('earn', 'spend')),
  note text,
  created_at timestamptz default now()
);

-- Indexes for fast lookup
create index on customers (phone);
create index on bonus_transactions (customer_id);
create index on bonus_transactions (created_at desc);

-- Allow public read/write (RLS disabled for simplicity on alpha)
alter table customers enable row level security;
alter table bonus_transactions enable row level security;

create policy "Allow all" on customers for all using (true) with check (true);
create policy "Allow all" on bonus_transactions for all using (true) with check (true);
