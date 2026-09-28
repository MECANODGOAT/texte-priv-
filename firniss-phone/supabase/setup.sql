-- =====================================================================
-- firniss.phone : installation complète de la base de données
-- 1. Remplacez VOTRE_EMAIL@exemple.com tout en bas par l'e-mail de votre compte admin.
-- 2. Collez tout ce fichier dans Supabase > SQL Editor, puis cliquez sur « Run ».
-- Le fichier peut être relancé sans risque.
-- =====================================================================


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

-- ---------- Données de départ ----------

insert into products (id, name, generation, is_pro, condition, camera, has_island, is_new, colors, storage, stock, active, sort) values
  ('iphone-18-pro-max', 'iPhone 18 Pro Max', 18, true, 'neuf', 'plateau', true, true, '[{"name":"Bordeaux","hex":"#6b1e2e","image":null},{"name":"Bleu nuit","hex":"#1f2d4d","image":null},{"name":"Argent","hex":"#cfd2d6","image":null}]'::jsonb, '[{"go":256,"price":1479},{"go":512,"price":1709},{"go":1024,"price":1939}]'::jsonb, 5, true, 0),
  ('iphone-18-pro', 'iPhone 18 Pro', 18, true, 'neuf', 'plateau', true, true, '[{"name":"Bleu nuit","hex":"#1f2d4d","image":null},{"name":"Bordeaux","hex":"#6b1e2e","image":null},{"name":"Argent","hex":"#cfd2d6","image":null}]'::jsonb, '[{"go":256,"price":1329},{"go":512,"price":1559},{"go":1024,"price":1789}]'::jsonb, 5, true, 1),
  ('iphone-17-pro-max', 'iPhone 17 Pro Max', 17, true, 'neuf', 'plateau', true, false, '[{"name":"Orange cosmique","hex":"#f07a24","image":null},{"name":"Bleu intense","hex":"#2f3c5a","image":null},{"name":"Argent","hex":"#d7d9dc","image":null}]'::jsonb, '[{"go":256,"price":1249},{"go":512,"price":1479},{"go":1024,"price":1709}]'::jsonb, 5, true, 2),
  ('iphone-17', 'iPhone 17', 17, false, 'neuf', 'duo', true, false, '[{"name":"Noir","hex":"#2a2a2e","image":null},{"name":"Blanc","hex":"#eeeeec","image":null},{"name":"Bleu brume","hex":"#9fb7d1","image":null},{"name":"Lavande","hex":"#cdbbe6","image":null},{"name":"Sauge","hex":"#b9c9ad","image":null}]'::jsonb, '[{"go":256,"price":879},{"go":512,"price":1109}]'::jsonb, 5, true, 3),
  ('iphone-16-pro-max', 'iPhone 16 Pro Max', 16, true, 'recond', 'trio', true, false, '[{"name":"Titane noir","hex":"#3a3a3c","image":null},{"name":"Titane blanc","hex":"#e6e4df","image":null},{"name":"Titane naturel","hex":"#b6b0a6","image":null},{"name":"Titane désert","hex":"#bfa48f","image":null}]'::jsonb, '[{"go":256,"price":949},{"go":512,"price":1169},{"go":1024,"price":1399}]'::jsonb, 5, true, 4),
  ('iphone-16', 'iPhone 16', 16, false, 'recond', 'duo', true, false, '[{"name":"Noir","hex":"#2c2c2e","image":null},{"name":"Blanc","hex":"#f0f0ee","image":null},{"name":"Rose","hex":"#f0a3d4","image":null},{"name":"Sarcelle","hex":"#9ccfcb","image":null},{"name":"Outremer","hex":"#7d8fe0","image":null}]'::jsonb, '[{"go":128,"price":649},{"go":256,"price":759},{"go":512,"price":979}]'::jsonb, 5, true, 5),
  ('iphone-15-pro', 'iPhone 15 Pro', 15, true, 'recond', 'trio', true, false, '[{"name":"Titane naturel","hex":"#bab4aa","image":null},{"name":"Titane bleu","hex":"#3d4555","image":null},{"name":"Titane blanc","hex":"#e3e1dc","image":null},{"name":"Titane noir","hex":"#3b3b3d","image":null}]'::jsonb, '[{"go":128,"price":699},{"go":256,"price":809},{"go":512,"price":1029}]'::jsonb, 5, true, 6),
  ('iphone-15', 'iPhone 15', 15, false, 'recond', 'diag', true, false, '[{"name":"Noir","hex":"#35383b","image":null},{"name":"Bleu","hex":"#c9dde6","image":null},{"name":"Vert","hex":"#d5e2c8","image":null},{"name":"Jaune","hex":"#f3e7a6","image":null},{"name":"Rose","hex":"#f0cdd3","image":null}]'::jsonb, '[{"go":128,"price":529},{"go":256,"price":639},{"go":512,"price":859}]'::jsonb, 5, true, 7),
  ('iphone-14-pro-max', 'iPhone 14 Pro Max', 14, true, 'recond', 'trio', true, false, '[{"name":"Violet intense","hex":"#594f63","image":null},{"name":"Or","hex":"#ecdcc0","image":null},{"name":"Argent","hex":"#e3e4e5","image":null},{"name":"Noir sidéral","hex":"#3b3a3c","image":null}]'::jsonb, '[{"go":128,"price":589},{"go":256,"price":699},{"go":512,"price":919}]'::jsonb, 5, true, 8),
  ('iphone-14', 'iPhone 14', 14, false, 'recond', 'diag', false, false, '[{"name":"Minuit","hex":"#2b3038","image":null},{"name":"Lumière stellaire","hex":"#f2ece3","image":null},{"name":"(PRODUCT)RED","hex":"#c8102e","image":null},{"name":"Bleu","hex":"#a9bfd4","image":null},{"name":"Violet","hex":"#d5c5e3","image":null},{"name":"Jaune","hex":"#f4e28d","image":null}]'::jsonb, '[{"go":128,"price":419},{"go":256,"price":529},{"go":512,"price":749}]'::jsonb, 5, true, 9),
  ('iphone-13-pro', 'iPhone 13 Pro', 13, true, 'recond', 'trio', false, false, '[{"name":"Graphite","hex":"#4a4a4c","image":null},{"name":"Or","hex":"#f0dfc2","image":null},{"name":"Argent","hex":"#e4e5e3","image":null},{"name":"Bleu alpin","hex":"#a7c1d9","image":null},{"name":"Vert alpin","hex":"#576856","image":null}]'::jsonb, '[{"go":128,"price":459},{"go":256,"price":569},{"go":512,"price":789}]'::jsonb, 5, true, 10),
  ('iphone-13', 'iPhone 13', 13, false, 'recond', 'diag', false, false, '[{"name":"Minuit","hex":"#2b3038","image":null},{"name":"Lumière stellaire","hex":"#f2ece3","image":null},{"name":"(PRODUCT)RED","hex":"#c8102e","image":null},{"name":"Bleu","hex":"#2f5874","image":null},{"name":"Rose","hex":"#f5d3d6","image":null},{"name":"Vert","hex":"#44574a","image":null}]'::jsonb, '[{"go":128,"price":349},{"go":256,"price":459},{"go":512,"price":679}]'::jsonb, 5, true, 11),
  ('iphone-12', 'iPhone 12', 12, false, 'recond', 'duo', false, false, '[{"name":"Noir","hex":"#25262a","image":null},{"name":"Blanc","hex":"#f4f4f2","image":null},{"name":"(PRODUCT)RED","hex":"#c8102e","image":null},{"name":"Vert","hex":"#cfe6d3","image":null},{"name":"Bleu","hex":"#2b4a7a","image":null},{"name":"Violet","hex":"#b7a9d2","image":null}]'::jsonb, '[{"go":64,"price":269},{"go":128,"price":299},{"go":256,"price":369}]'::jsonb, 5, true, 12),
  ('iphone-11', 'iPhone 11', 11, false, 'recond', 'duo', false, false, '[{"name":"Violet","hex":"#c9b8e8","image":null},{"name":"Jaune","hex":"#f9e79a","image":null},{"name":"Vert","hex":"#b9e2cf","image":null},{"name":"Noir","hex":"#27272a","image":null},{"name":"Blanc","hex":"#f4f4f2","image":null},{"name":"(PRODUCT)RED","hex":"#c8102e","image":null}]'::jsonb, '[{"go":64,"price":199},{"go":128,"price":229},{"go":256,"price":289}]'::jsonb, 5, true, 13)
on conflict (id) do nothing;

insert into payment_methods (code, name, country, instructions, active, sort) values
  ('wafacash', 'Wafacash', 'MA', 'Envoyez le montant par Wafacash au nom de [VOTRE NOM], puis envoyez-nous le code de transfert par WhatsApp.', true, 0),
  ('banque-populaire', 'Banque Populaire', 'MA', 'Faites un virement vers le RIB [VOTRE RIB BANQUE POPULAIRE], puis envoyez-nous le reçu par WhatsApp.', true, 1),
  ('cih', 'CIH Bank', 'MA', 'Faites un virement vers le RIB [VOTRE RIB CIH], puis envoyez-nous le reçu par WhatsApp.', true, 2),
  ('airtel-money', 'Airtel Money', 'GA', 'Envoyez le montant par Airtel Money au [VOTRE NUMÉRO AIRTEL], puis envoyez-nous la capture de la transaction par WhatsApp.', true, 3),
  ('moov-money', 'Moov Money', 'GA', 'Envoyez le montant par Moov Money au [VOTRE NUMÉRO MOOV], puis envoyez-nous la capture de la transaction par WhatsApp.', true, 4),
  ('wave', 'Wave', 'GA', 'Envoyez le montant par Wave au [VOTRE NUMÉRO WAVE], puis envoyez-nous la capture de la transaction par WhatsApp.', true, 5)
on conflict (code) do nothing;

-- ---------- Compte administrateur ----------
-- Créez d'abord le compte dans Authentication > Users > Add user, puis mettez son e-mail ici.
insert into admins (user_id)
select id from auth.users where email = 'VOTRE_EMAIL@exemple.com'
on conflict (user_id) do nothing;
