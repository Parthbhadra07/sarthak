-- Run this if you already created tables earlier.
-- Adds categories + unit/box price + tax%.

alter table public.products
  add column if not exists category text,
  add column if not exists unit_price numeric,
  add column if not exists box_price numeric,
  add column if not exists tax_pct numeric not null default 0;

create index if not exists products_category_idx on public.products(category);

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

-- IMPORTANT: if your old schema had `products.price` as NOT NULL, it will break inserts
-- because the app now writes to `unit_price`/`box_price` instead of `price`.
-- Make `price` nullable (and optionally backfill it).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'price'
  ) then
    execute 'alter table public.products alter column price drop not null';
    -- Optional backfill: keep old column meaningful
    execute 'update public.products set price = coalesce(price, unit_price, box_price) where price is null';
  end if;
end $$;

