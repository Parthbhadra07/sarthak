-- Run this if you already created tables earlier.
-- Adds categories + unit/box price + tax%.

alter table public.products
  add column if not exists category text,
  add column if not exists unit_price numeric,
  add column if not exists box_price numeric,
  add column if not exists tax_pct numeric not null default 0;

create index if not exists products_category_idx on public.products(category);

-- Optional: if you previously used the old `price` column, you can migrate it to unit_price:
-- update public.products set unit_price = price where unit_price is null;

