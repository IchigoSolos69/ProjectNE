-- Premium home goods e-commerce schema
-- Run via Supabase SQL editor or: supabase db push

-- ---------------------------------------------------------------------------
-- Extensions & enums
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

create type public.order_status as enum (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- ---------------------------------------------------------------------------
-- Categories (top-level + subcategories via parent_id)
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories (id) on delete cascade,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index categories_parent_id_idx on public.categories (parent_id);
create index categories_slug_idx on public.categories (slug);
create index categories_parent_id_sort_order_idx on public.categories (parent_id, sort_order);
create index categories_sort_order_null_parent_idx on public.categories (sort_order) where parent_id is null;

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  price_paise int not null check (price_paise > 0),
  compare_at_price_paise int check (compare_at_price_paise is null or compare_at_price_paise > 0),
  images text[] not null default '{}',
  sku text unique,
  inventory int not null default 0 check (inventory >= 0),
  is_active boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', name), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored
);

create index products_category_id_idx on public.products (category_id);
create index products_slug_idx on public.products (slug);
create index products_is_active_idx on public.products (is_active) where is_active = true;
create index products_category_id_active_idx on public.products (category_id) where is_active = true;
create index products_category_price_asc_idx on public.products (category_id, price_paise asc) where is_active = true;
create index products_category_price_desc_idx on public.products (category_id, price_paise desc) where is_active = true;
create index products_category_created_at_desc_idx on public.products (category_id, created_at desc) where is_active = true;
create index products_price_paise_idx on public.products (price_paise);
create index products_created_at_desc_idx on public.products (created_at desc);
create index products_search_vector_idx on public.products using gin (search_vector);

-- ---------------------------------------------------------------------------
-- User profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  default_pincode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_unique_idx on public.profiles (email) where email is not null;
create index profiles_phone_idx on public.profiles (phone) where phone is not null;
create index profiles_created_at_desc_idx on public.profiles (created_at desc);

-- ---------------------------------------------------------------------------
-- Orders & line items
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  status public.order_status not null default 'pending',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  delhivery_waybill text,
  subtotal_paise int not null check (subtotal_paise >= 0),
  shipping_paise int not null default 0 check (shipping_paise >= 0),
  total_paise int not null check (total_paise > 0),
  shipping_address jsonb not null,
  customer_email text not null,
  customer_phone text not null,
  customer_pincode text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_razorpay_order_id_idx on public.orders (razorpay_order_id);
create index orders_user_id_created_at_desc_idx on public.orders (user_id, created_at desc);
create index orders_created_at_desc_idx on public.orders (created_at desc);
create index orders_delhivery_waybill_idx on public.orders (delhivery_waybill) where delhivery_waybill is not null;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity int not null check (quantity > 0),
  unit_price_paise int not null check (unit_price_paise > 0),
  product_name text not null,
  product_slug text not null
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.phone
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Catalog: public read
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy "Active products are viewable by everyone"
  on public.products for select
  using (is_active = true);

-- Profiles: own row only
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Orders: users see and create their own
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Users can insert items for own orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

-- ---------------------------------------------------------------------------
-- Inventory Helper Functions
-- ---------------------------------------------------------------------------
-- Safe atomic single-product inventory decrement function
create or replace function public.decrement_product_inventory(
  p_product_id uuid,
  p_quantity int
)
returns boolean
language plpgsql
security definer
as $$
begin
  update public.products
  set inventory = inventory - p_quantity
  where id = p_product_id and inventory >= p_quantity;
  
  return found;
end;
$$;

-- Safe atomic multi-product inventory decrement function to prevent overselling and deadlocks
create or replace function public.decrement_products_inventory(
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  r record;
  missing_product_id uuid;
  insufficient_items jsonb := '[]'::jsonb;
begin
  -- 1. Check if all products exist first
  select (value->>'product_id')::uuid into missing_product_id
  from jsonb_array_elements(p_items)
  where (value->>'product_id')::uuid not in (select id from public.products);
  
  if missing_product_id is not null then
    return jsonb_build_object(
      'success', false,
      'error', 'Product not found: ' || missing_product_id::text,
      'code', 'PRODUCT_NOT_FOUND',
      'product_id', missing_product_id
    );
  end if;

  -- 2. Lock rows in alphabetical order of UUID to prevent deadlocks and check stock
  for r in 
    with parsed_items as (
      select (value->>'product_id')::uuid as product_id, (value->>'quantity')::int as quantity
      from jsonb_array_elements(p_items)
    )
    select p.id, p.name, p.inventory, i.quantity
    from parsed_items i
    join public.products p on p.id = i.product_id
    order by p.id
    for update
  loop
    if r.inventory < r.quantity then
      insufficient_items := insufficient_items || jsonb_build_object(
        'product_id', r.id,
        'name', r.name,
        'requested', r.quantity,
        'available', r.inventory
      );
    end if;
  end loop;

  -- 3. If any item has insufficient inventory, abort and return detail
  if jsonb_array_length(insufficient_items) > 0 then
    return jsonb_build_object(
      'success', false,
      'error', 'Insufficient inventory for some items',
      'code', 'INSUFFICIENT_INVENTORY',
      'items', insufficient_items
    );
  end if;

  -- 4. Perform the decrement since all items are verified
  update public.products p
  set inventory = p.inventory - (i.quantity)
  from (
    select (value->>'product_id')::uuid as product_id, (value->>'quantity')::int as quantity
    from jsonb_array_elements(p_items)
  ) i
  where p.id = i.product_id;

  return jsonb_build_object('success', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Seed: category tree
-- ---------------------------------------------------------------------------
insert into public.categories (name, slug, parent_id, description, sort_order) values
  ('Beddings', 'beddings', null, 'Luxury sheets, duvets, and comforters', 1),
  ('Bath Towels', 'bath-towels', null, 'Premium cotton towels and mats', 2),
  ('Pillow Covers', 'pillow-covers', null, 'Egyptian cotton pillow covers', 3);

insert into public.categories (name, slug, parent_id, sort_order)
select v.name, v.slug, c.id, v.sort_order
from public.categories c
cross join (values
  ('beddings', 'Sheets', 'sheets', 1),
  ('beddings', 'Duvets', 'duvets', 2),
  ('beddings', 'Comforters', 'comforters', 3),
  ('bath-towels', 'Hand', 'hand', 1),
  ('bath-towels', 'Face', 'face', 2),
  ('bath-towels', 'Bath', 'bath', 3),
  ('bath-towels', 'Mats', 'mats', 4),
  ('pillow-covers', 'Standard', 'standard', 1),
  ('pillow-covers', 'King', 'king', 2),
  ('pillow-covers', 'Euro', 'euro', 3)
) as v(parent_slug, name, slug, sort_order)
where c.slug = v.parent_slug and c.parent_id is null;

-- Sample products (prices in paise: ₹4999 = 499900)
insert into public.products (category_id, name, slug, description, price_paise, compare_at_price_paise, images, sku, inventory)
select
  sub.id,
  v.name,
  v.slug,
  v.description,
  v.price_paise,
  v.compare_at_price_paise,
  v.images,
  v.sku,
  v.inventory
from (values
  ('sheets', 'Sateen Sheet Set — Ivory', 'sateen-sheet-set-ivory', '400 thread count long-staple cotton.', 899900, 1099900, array['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'], 'BED-SHT-001', 50),
  ('duvets', 'All-Season Duvet — Cloud', 'all-season-duvet-cloud', 'Lightweight fill with breathable cotton shell.', 1299900, null, array['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'], 'BED-DUV-001', 30),
  ('bath', 'Spa Bath Towel — Slate', 'spa-bath-towel-slate', '700 GSM zero-twist cotton.', 349900, 399900, array['https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800'], 'BTH-BTH-001', 80),
  ('standard', 'Envelope Pillow Cover — Sand', 'envelope-pillow-cover-sand', 'Hidden zipper, OEKO-TEX certified.', 199900, null, array['https://images.unsplash.com/photo-1584100936595-c0654b55a2f2?w=800'], 'PIL-STD-001', 100)
) as v(sub_slug, name, slug, description, price_paise, compare_at_price_paise, images, sku, inventory)
join public.categories sub on sub.slug = v.sub_slug and sub.parent_id is not null;
