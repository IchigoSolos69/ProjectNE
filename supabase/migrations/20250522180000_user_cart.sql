-- Persisted cart per authenticated user (guests use localStorage via Zustand)
create table public.user_cart_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity int not null check (quantity > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index user_cart_items_user_id_idx on public.user_cart_items (user_id);

alter table public.user_cart_items enable row level security;

create policy "Users can view own cart items"
  on public.user_cart_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own cart items"
  on public.user_cart_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cart items"
  on public.user_cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cart items"
  on public.user_cart_items for delete
  using (auth.uid() = user_id);

create trigger user_cart_items_updated_at
  before update on public.user_cart_items
  for each row execute function public.set_updated_at();
