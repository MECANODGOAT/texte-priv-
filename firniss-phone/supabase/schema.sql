-- firniss.phone : schéma de la base de données.
-- À exécuter une fois dans Supabase > SQL Editor, puis exécuter seed.sql.

create extension if not exists pgcrypto;

-- ---------- Administrateurs ----------
create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ---------- Produits ----------
create table if not exists products (
  id text primary key,
  name text not null,
  generation int not null,
  is_pro boolean not null default false,
  condition text not null check (condition in ('neuf', 'recond')),
  camera text not null check (camera in ('duo', 'diag', 'trio', 'plateau')),
  has_island boolean not null default true,
  is_new boolean not null default false,
  colors jsonb not null default '[]',   -- [{ "name": "Noir", "hex": "#222", "image": null }]
  storage jsonb not null default '[]',  -- [{ "go": 128, "price": 499 }]  (prix en euros de référence)
  stock int not null default 0 check (stock >= 0),
  active boolean not null default true,
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------- Moyens de paiement ----------
create table if not exists payment_methods (
  code text primary key,
  name text not null,
  country text not null check (country in ('MA', 'GA')),
  instructions text not null default '',
  active boolean not null default true,
  sort int not null default 0
);

-- ---------- Commandes ----------
create sequence if not exists order_number_seq start 1001;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  number int not null unique default nextval('order_number_seq'),
  customer_name text not null,
  phone text not null,
  email text,
  country text not null check (country in ('MA', 'GA')),
  city text not null,
  address text not null,
  note text,
  payment_method text not null references payment_methods (code),
  currency text not null check (currency in ('MAD', 'XAF')),
  total int not null check (total >= 0),
  status text not null default 'en_attente_paiement'
    check (status in ('en_attente_paiement', 'payee', 'expediee', 'livree', 'annulee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders (id) on delete cascade,
  product_id text not null references products (id),
  product_name text not null,
  color text not null,
  storage_go int not null,
  unit_price int not null,
  quantity int not null check (quantity between 1 and 10)
);

create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists order_items_order_idx on order_items (order_id);

-- ---------- Sécurité (RLS) ----------
-- Le site public passe par le serveur (clé de service) : aucun accès direct anonyme.
-- Les administrateurs connectés peuvent tout lire et modifier.
alter table admins enable row level security;
alter table products enable row level security;
alter table payment_methods enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "admin lit son statut" on admins;
create policy "admin lit son statut" on admins for select using (user_id = auth.uid());

drop policy if exists "admin gère produits" on products;
create policy "admin gère produits" on products for all using (is_admin()) with check (is_admin());

drop policy if exists "admin gère paiements" on payment_methods;
create policy "admin gère paiements" on payment_methods for all using (is_admin()) with check (is_admin());

drop policy if exists "admin gère commandes" on orders;
create policy "admin gère commandes" on orders for all using (is_admin()) with check (is_admin());

drop policy if exists "admin lit lignes" on order_items;
create policy "admin lit lignes" on order_items for select using (is_admin());

-- Passage d'une commande au statut "payée" : décrémente le stock une seule fois.
create or replace function set_order_status(p_order uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare old_status text;
begin
  if not is_admin() then raise exception 'Accès refusé'; end if;
  select status into old_status from orders where id = p_order for update;
  if old_status is null then raise exception 'Commande introuvable'; end if;

  if p_status = 'payee' and old_status = 'en_attente_paiement' then
    update products p set stock = greatest(p.stock - i.qty, 0), updated_at = now()
    from (select product_id, sum(quantity) qty from order_items where order_id = p_order group by product_id) i
    where p.id = i.product_id;
  elsif p_status = 'annulee' and old_status in ('payee', 'expediee') then
    update products p set stock = p.stock + i.qty, updated_at = now()
    from (select product_id, sum(quantity) qty from order_items where order_id = p_order group by product_id) i
    where p.id = i.product_id;
  end if;

  update orders set status = p_status, updated_at = now() where id = p_order;
end;
$$;

-- ---------- Photos des produits ----------
insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "photos publiques" on storage.objects;
create policy "photos publiques" on storage.objects for select using (bucket_id = 'products');

drop policy if exists "admin ajoute photos" on storage.objects;
create policy "admin ajoute photos" on storage.objects for insert with check (bucket_id = 'products' and is_admin());

drop policy if exists "admin supprime photos" on storage.objects;
create policy "admin supprime photos" on storage.objects for delete using (bucket_id = 'products' and is_admin());
