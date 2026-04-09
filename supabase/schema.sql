-- mypantry database schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────

create table households (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

create table household_members (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null check (role in ('owner', 'member')) default 'member',
  joined_at    timestamptz not null default now(),
  unique (household_id, user_id)
);

create table items (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name         text not null,
  quantity     numeric not null default 0,
  unit         text not null,
  location     text not null check (location in ('fridge', 'pantry', 'freezer')),
  category     text not null,
  min_quantity numeric not null default 0,
  expiry_date  date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table shopping_list_items (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  item_name    text not null,
  quantity     numeric not null default 1,
  unit         text not null,
  checked      boolean not null default false,
  added_by     uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- updated_at trigger for items
-- ─────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_updated_at
  before update on items
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────
-- Row-level security
-- ─────────────────────────────────────────

alter table households          enable row level security;
alter table household_members   enable row level security;
alter table items               enable row level security;
alter table shopping_list_items enable row level security;

-- households: members can read; owners can update/delete
create policy "members can read household"
  on households for select
  using (
    id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "owners can update household"
  on households for update
  using (
    id in (select household_id from household_members where user_id = auth.uid() and role = 'owner')
  );

-- household_members: members can read their own household's members
create policy "members can read household members"
  on household_members for select
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

-- items: household members can read/insert/update/delete
create policy "members can read items"
  on items for select
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "members can insert items"
  on items for insert
  with check (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "members can update items"
  on items for update
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "members can delete items"
  on items for delete
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

-- shopping_list_items: same as items
create policy "members can read shopping list"
  on shopping_list_items for select
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "members can insert shopping list items"
  on shopping_list_items for insert
  with check (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "members can update shopping list items"
  on shopping_list_items for update
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "members can delete shopping list items"
  on shopping_list_items for delete
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );
