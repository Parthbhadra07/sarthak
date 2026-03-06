-- Run this in Supabase SQL Editor

create table if not exists public.products (
  id text primary key,
  category text,
  name text not null,
  unit_price numeric,
  box_price numeric,
  tax_pct numeric not null default 0 check (tax_pct >= 0),
  image_url text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_idx on public.products(active);
create index if not exists products_category_idx on public.products(category);

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  items jsonb not null,
  totals jsonb not null,
  customer jsonb not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);

