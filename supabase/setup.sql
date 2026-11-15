-- =====================================================================
-- Holle-App · Datenbank-Einrichtung (einmalig im Supabase SQL Editor ausführen)
-- =====================================================================

-- ---------- Mitarbeiter (wer darf in die Verwaltung) ----------
create table if not exists staff (
  email      text primary key,
  name       text,
  role       text not null default 'mitarbeiter' check (role in ('admin','mitarbeiter')),
  created_at timestamptz not null default now()
);

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from staff
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- Sortiment ----------
create table if not exists products (
  id         bigint generated always as identity primary key,
  category   text    not null,
  name       text    not null,
  price      numeric(8,2),          -- leer = Preis auf Anfrage
  price_note text,                  -- z. B. "je nach Alter"
  available  boolean not null default true,
  sort       int     not null default 100,
  note       text
);

-- ---------- Haltepunkte ----------
create table if not exists stops (
  id      bigint generated always as identity primary key,
  name    text not null,            -- für Kunden sichtbar (nur Ort)
  region  text,
  address text,                     -- intern, für Kunden NICHT sichtbar
  note    text,                     -- intern
  active  boolean not null default true,
  sort    int not null default 100
);

-- ---------- Fahrten (Tour an einem Datum) ----------
create table if not exists trips (
  id        bigint generated always as identity primary key,
  trip_date date not null,
  name      text not null,
  note      text,
  active    boolean not null default true
);

create table if not exists trip_stops (
  id        bigint generated always as identity primary key,
  trip_id   bigint not null references trips(id) on delete cascade,
  stop_id   bigint not null references stops(id),
  stop_time text,                   -- z. B. "11:00"
  sort      int not null default 100,
  unique (trip_id, stop_id)
);

-- ---------- Bestellungen ----------
create sequence if not exists order_no_seq start 1001;

create table if not exists orders (
  id            bigint generated always as identity primary key,
  order_no      text unique not null default ('H-' || nextval('order_no_seq')),
  created_at    timestamptz not null default now(),
  source        text not null default 'kunde'
                check (source in ('kunde','whatsapp','telefon','vor_ort','instagram','sonstiges')),
  status        text not null default 'neu'
                check (status in ('neu','bestaetigt','abgeholt','storniert')),
  customer_name text not null,
  phone         text not null,
  city          text,
  pickup_type   text not null default 'tour' check (pickup_type in ('tour','rietberg')),
  trip_stop_id  bigint references trip_stops(id) on delete set null,
  pickup_date   date,               -- bei Rietberg: Wunschtermin
  customer_note text,
  internal_note text,
  created_by    text
);

create table if not exists order_items (
  id           bigint generated always as identity primary key,
  order_id     bigint not null references orders(id) on delete cascade,
  product_id   bigint references products(id) on delete set null,
  product_name text not null,
  category     text,
  qty          int not null check (qty > 0),
  unit_price   numeric(8,2)
);

create index if not exists orders_trip_stop_idx on orders(trip_stop_id);
create index if not exists order_items_order_idx on order_items(order_id);

-- ---------- Sicherheit: nur Mitarbeiter sehen/ändern Daten ----------
alter table staff       enable row level security;
alter table products    enable row level security;
alter table stops       enable row level security;
alter table trips       enable row level security;
alter table trip_stops  enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

do $$
declare t text;
begin
  foreach t in array array['products','stops','trips','trip_stops','orders','order_items'] loop
    execute format('drop policy if exists staff_all on %I', t);
    execute format('create policy staff_all on %I for all to authenticated using (is_staff()) with check (is_staff())', t);
  end loop;
end $$;

drop policy if exists staff_read on staff;
create policy staff_read on staff for select to authenticated using (is_staff());

-- ---------- Öffentlich: Daten für das Kunden-Bestellformular ----------
create or replace function get_shop_data() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'products', coalesce((
      select json_agg(json_build_object(
        'id', p.id, 'category', p.category, 'name', p.name,
        'price', p.price, 'price_note', p.price_note, 'note', p.note)
        order by p.sort, p.category, p.name)
      from products p where p.available), '[]'::json),
    'trips', coalesce((
      select json_agg(json_build_object(
        'id', t.id, 'date', t.trip_date, 'name', t.name,
        'stops', (select coalesce(json_agg(json_build_object(
                    'trip_stop_id', ts.id, 'name', s.name, 'time', ts.stop_time)
                    order by ts.sort, s.name), '[]'::json)
                  from trip_stops ts join stops s on s.id = ts.stop_id
                  where ts.trip_id = t.id and s.active))
        order by t.trip_date, t.name)
      from trips t
      where t.active and t.trip_date >= current_date
        and t.trip_date <= current_date + 120), '[]'::json)
  );
$$;

-- ---------- Öffentlich: Kunde schickt Bestellung ab ----------
create or replace function submit_order(p jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_name  text := trim(coalesce(p->>'customer_name',''));
  v_phone text := trim(coalesce(p->>'phone',''));
  v_city  text := trim(coalesce(p->>'city',''));
  v_note  text := left(trim(coalesce(p->>'customer_note','')), 1000);
  v_type  text := coalesce(p->>'pickup_type','tour');
  v_ts    bigint := nullif(p->>'trip_stop_id','')::bigint;
  v_date  date := nullif(p->>'pickup_date','')::date;
  v_items jsonb := coalesce(p->'items','[]'::jsonb);
  v_order orders%rowtype;
  v_item  jsonb;
  v_prod  products%rowtype;
  v_qty   int;
begin
  if length(v_name) < 2 or length(v_name) > 100 then raise exception 'Bitte Namen angeben.'; end if;
  if length(regexp_replace(v_phone, '[^0-9]', '', 'g')) < 6 or length(v_phone) > 30 then
    raise exception 'Bitte gültige Handynummer angeben.'; end if;
  if length(v_city) > 100 then raise exception 'Wohnort zu lang.'; end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 or jsonb_array_length(v_items) > 40 then
    raise exception 'Bitte mindestens ein Tier auswählen.'; end if;

  if v_type = 'tour' then
    if not exists (select 1 from trip_stops ts join trips t on t.id = ts.trip_id
                   where ts.id = v_ts and t.active and t.trip_date >= current_date) then
      raise exception 'Bitte einen gültigen Haltepunkt wählen.'; end if;
    v_date := (select t.trip_date from trip_stops ts join trips t on t.id = ts.trip_id where ts.id = v_ts);
  elsif v_type = 'rietberg' then
    v_ts := null;
    if v_date is null or v_date < current_date then raise exception 'Bitte einen Wunschtermin angeben.'; end if;
  else
    raise exception 'Ungültige Abholart.';
  end if;

  -- einfacher Spam-Schutz
  if (select count(*) from orders where phone = v_phone and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Zu viele Bestellungen mit dieser Nummer. Bitte ruf uns kurz an.'; end if;

  insert into orders (source, customer_name, phone, city, pickup_type, trip_stop_id, pickup_date, customer_note, created_by)
  values ('kunde', v_name, v_phone, nullif(v_city,''), v_type, v_ts, v_date, nullif(v_note,''), 'kunde')
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty := (v_item->>'qty')::int;
    if v_qty is null or v_qty < 1 or v_qty > 1000 then raise exception 'Ungültige Anzahl.'; end if;
    select * into v_prod from products where id = (v_item->>'product_id')::bigint and available;
    if not found then raise exception 'Ein ausgewähltes Tier ist nicht mehr verfügbar.'; end if;
    insert into order_items (order_id, product_id, product_name, category, qty, unit_price)
    values (v_order.id, v_prod.id, v_prod.name, v_prod.category, v_qty, v_prod.price);
  end loop;

  return json_build_object('order_no', v_order.order_no, 'pickup_date', v_date);
end $$;

revoke all on function submit_order(jsonb) from public;
revoke all on function get_shop_data() from public;
grant execute on function submit_order(jsonb) to anon, authenticated;
grant execute on function get_shop_data() to anon, authenticated;
grant usage, select on sequence order_no_seq to authenticated;

-- Live-Aktualisierung neuer Bestellungen in der Verwaltung
do $$ begin
  alter publication supabase_realtime add table orders;
exception when others then null;
end $$;

-- =====================================================================
-- Startdaten (bitte in der App unter „Sortiment“ und „Fahrten“ prüfen)
-- =====================================================================
insert into products (category, name, price, price_note, sort) values
 ('Legehybriden','Braune Tetra',null,null,10),
 ('Legehybriden','Weiße Leghorn',null,null,11),
 ('Legehybriden','Schwarze Bovan',null,null,12),
 ('Legehybriden','Sussex hell',null,null,13),
 ('Legehybriden','Sussex dunkel',null,null,14),
 ('Legehybriden','Italiener silber',null,null,15),
 ('Legehybriden','Italiener rebhuhnfarbig',null,null,16),
 ('Legehybriden','Königsberger',null,null,17),
 ('Legehybriden','Rhodeländer',null,null,18),
 ('Legehybriden','Blausperber',null,null,19),
 ('Legehybriden','Tricolor',null,'legt beige Eier',20),
 ('Legehybriden','Dalmatiner',null,null,21),
 ('Legehybriden','Welsumer (Zwerg)',null,null,22),
 ('Rassehühner','Ayam Cemani',null,null,30),
 ('Rassehühner','Bielefelder Kennhuhn',null,null,31),
 ('Rassehühner','Brahma',null,null,32),
 ('Rassehühner','Cochin gelb',null,null,33),
 ('Rassehühner','Eulenbarthuhn',null,null,34),
 ('Rassehühner','Französische Marans',null,null,35),
 ('Rassehühner','Paduaner',null,null,36),
 ('Rassehühner','Zwerg-Paduaner',null,null,37),
 ('Rassehühner','Schwedische Blumenhühner',null,null,38),
 ('Rassehühner','Seidenhühner',null,null,39),
 ('Rassehühner','Weißhauben',null,null,40),
 ('Rassehühner','Zwerg-Amrock',null,null,41),
 ('Rassehühner','Zwerg-New Hampshire',null,null,42),
 ('Rassehühner','Zwerg-Wyandotten',null,null,43),
 ('Enten','Laufenten',null,'Preis je nach Alter',50),
 ('Enten','Landenten',null,'Preis je nach Alter',51),
 ('Gänse','Gänse',null,'Preis je nach Alter',60),
 ('Puten','Puten',null,'Preis je nach Alter',70),
 ('Perlhühner','Perlhühner',null,'Preis je nach Alter',80),
 ('Wachteln','Wachteln',null,null,90),
 ('Masthähnchen','Masthähnchen (3 Wochen)',4.50,null,100),
 ('Masthähnchen','Masthähnchen schlachtreif',null,null,101);

insert into stops (name, region, address, note, sort) values
 ('Warburg','Warburg-Tour','Raiffeisen Markt',null,10),
 ('Beverungen','Warburg-Tour',null,null,11),
 ('Hann. Münden','Warburg-Tour','Farmerstore',null,12),
 ('Rosdorf','Warburg-Tour','Farmerstore',null,13),
 ('Gudensberg','Warburg-Tour','großer Parkplatz','Uhrzeit wechselt (09:30 oder 15:15)',14),
 ('Hessisch Lichtenau','Nordhessen','OnOvO Tierbedarf, Am Hambacher Weg 4',null,15),
 ('Waldkappel','Nordhessen','Rewe Einfahrt',null,16),
 ('Lohfelden','Eichsfeld-Tour','Autohof Lohfeldener Rüssel','nur auf Bestellung',20),
 ('Eschwege','Eichsfeld-Tour','Sandrocks Tiernahrung, Friedhofsweg 17',null,21),
 ('Nordhausen','Eichsfeld-Tour','Scheunenhof Sundhausen',null,22),
 ('Worbis','Eichsfeld-Tour',null,null,23),
 ('Hildesheim','Hildesheim-Tour','MTG Fleige, Parkplatz vorne',null,30),
 ('Vechelde','Hildesheim-Tour','Raiffeisen Markt',null,31),
 ('Hameln','Hildesheim-Tour',null,null,32),
 ('Hemmendorf','Hildesheim-Tour','Marktplatz 3',null,33),
 ('Coppenbrügge','Hildesheim-Tour','Bahnhof',null,34),
 ('Hemeringen','Hildesheim-Tour',null,null,35),
 ('Alfeld','Hildesheim-Tour','Angel & Zooparadies Alfeld',null,36),
 ('Eldagsen','Hildesheim-Tour','Raiffeisen-Markt-Parkplatz',null,37),
 ('Dramfeld','sonstige',null,null,40),
 ('Stockelsdorf','neu ab 2027',null,null,50),
 ('Rosengarten','neu ab 2027',null,null,51),
 ('Bispingen','neu ab 2027',null,null,52);

-- Hilfsfunktion nur für die Startdaten
create or replace function _seed_trip(d date, n text, stop_names text[]) returns void
language plpgsql as $$
declare tid bigint; i int;
begin
  insert into trips (trip_date, name) values (d, n) returning id into tid;
  for i in 1 .. array_length(stop_names,1) loop
    insert into trip_stops (trip_id, stop_id, sort)
    select tid, id, i from stops where name = stop_names[i];
  end loop;
end $$;

select _seed_trip('2026-11-21','Nordhessen-Tour', array['Warburg','Gudensberg','Hessisch Lichtenau','Eschwege']);

select _seed_trip(d::date, 'Warburg-Tour',
  array['Warburg','Beverungen','Hann. Münden','Rosdorf','Gudensberg','Hessisch Lichtenau'])
from unnest(array['2027-03-06','2027-03-20','2027-04-17','2027-05-15','2027-06-19','2027-07-17','2027-08-21']) d;

select _seed_trip(d::date, 'Eichsfeld/Nordhessen-Tour',
  array['Lohfelden','Eschwege','Nordhausen','Worbis','Hessisch Lichtenau'])
from unnest(array['2027-02-27','2027-03-13','2027-03-27','2027-04-10','2027-04-24']) d;

select _seed_trip(d::date, 'Hildesheim/Hameln-Tour',
  array['Hildesheim','Vechelde','Hameln','Hemmendorf','Coppenbrügge','Hemeringen','Alfeld','Eldagsen'])
from unnest(array['2027-02-27','2027-03-13','2027-03-27','2027-04-10','2027-04-24']) d;

-- Eschwege jeden Samstag (27.02.–30.10.2027), außer an Tagen der Eichsfeld-Tour
select _seed_trip(d::date, 'Eschwege', array['Eschwege'])
from generate_series('2027-02-27'::date, '2027-10-30'::date, interval '7 days') d
where d::date not in ('2027-02-27','2027-03-13','2027-03-27','2027-04-10','2027-04-24');

drop function _seed_trip(date, text, text[]);

-- Haltezeiten, die bekannt sind
update trip_stops ts set stop_time = '06:40' from stops s where s.id = ts.stop_id and s.name = 'Lohfelden';
update trip_stops ts set stop_time = '11:00' from stops s, trips t
  where s.id = ts.stop_id and t.id = ts.trip_id and s.name = 'Hessisch Lichtenau' and t.name = 'Warburg-Tour';
update trip_stops ts set stop_time = '14:00' from stops s, trips t
  where s.id = ts.stop_id and t.id = ts.trip_id and s.name = 'Hessisch Lichtenau' and t.name = 'Eichsfeld/Nordhessen-Tour';

