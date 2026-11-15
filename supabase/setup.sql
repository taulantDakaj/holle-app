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
  price      numeric(8,2),          -- Preis Henne bzw. Stückpreis; leer = Preis auf Anfrage
  price_hahn numeric(8,2),          -- Preis Hahn; leer = kein Hahn bestellbar
  price_note text,                  -- z. B. "je nach Alter"
  available  boolean not null default true,
  sort       int     not null default 100,
  note       text
);

alter table products add column if not exists price_hahn numeric(8,2);
create unique index if not exists products_name_key on products(name);

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
        'price', p.price, 'price_hahn', p.price_hahn, 'price_note', p.price_note, 'note', p.note)
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
    if coalesce((v_item->>'hahn')::boolean, false) then
      if v_prod.price_hahn is null then raise exception 'Für % gibt es keine Hähne.', v_prod.name; end if;
      insert into order_items (order_id, product_id, product_name, category, qty, unit_price)
      values (v_order.id, v_prod.id, v_prod.name || ' (Hahn)', v_prod.category, v_qty, v_prod.price_hahn);
    else
      insert into order_items (order_id, product_id, product_name, category, qty, unit_price)
      values (v_order.id, v_prod.id, v_prod.name, v_prod.category, v_qty, v_prod.price);
    end if;
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
-- Sortiment & Preise (Stand Preisliste November 2026)
-- Kann jederzeit erneut ausgeführt werden: aktualisiert Preise nach Namen.
-- =====================================================================
delete from products where name in ('Königsberger','Welsumer (Zwerg)','Bielefelder Kennhuhn','Cochin gelb','Eulenbarthuhn','Zwerg-Paduaner','Zwerg-Amrock','Zwerg-New Hampshire','Zwerg-Wyandotten','Gänse','Puten');
update products set category = 'Hybrid-Legehennen' where category = 'Legehybriden';

insert into products (category, name, price, price_hahn, price_note, sort) values
 ('Hybrid-Legehennen','Braune Tetra',13,11,null,1),
 ('Hybrid-Legehennen','Schwarze Bovan',14,12,null,2),
 ('Hybrid-Legehennen','Weiße Leghorn',13,11,null,3),
 ('Hybrid-Legehennen','Sussex hell',14,12,null,4),
 ('Hybrid-Legehennen','Sussex dunkel',16,14,null,5),
 ('Hybrid-Legehennen','Blausperber',14,12,null,6),
 ('Hybrid-Legehennen','Goldsperber',16,14,null,7),
 ('Hybrid-Legehennen','Grünleger',16,14,null,8),
 ('Hybrid-Legehennen','Blauleger',20,18,null,9),
 ('Hybrid-Legehennen','Maran+',16,14,null,10),
 ('Hybrid-Legehennen','Rhodeländer',16,14,null,11),
 ('Hybrid-Legehennen','Italiener silber',16,14,null,12),
 ('Hybrid-Legehennen','Italiener rebhuhnfarbig',16,14,null,13),
 ('Hybrid-Legehennen','Königsberger silberblau',16,14,null,14),
 ('Hybrid-Legehennen','Dalmatiner',20,18,null,15),
 ('Hybrid-Legehennen','Tricolor',20,18,'legt beige Eier',16),
 ('Rassehühner','Amrock',30,20,null,17),
 ('Rassehühner','Araucana',22,20,null,18),
 ('Rassehühner','Ayam Cemani',30,20,null,19),
 ('Rassehühner','Barnevelder',30,20,null,20),
 ('Rassehühner','Bielefelder Kennhühner',30,20,null,21),
 ('Rassehühner','Brahma',42,20,null,22),
 ('Rassehühner','Cream Legbar',30,20,null,23),
 ('Rassehühner','Deutsche Lachshühner',36,20,null,24),
 ('Rassehühner','Eulenbart',30,20,null,25),
 ('Rassehühner','Französische Marans',30,20,null,26),
 ('Rassehühner','Große Cochin',30,20,null,27),
 ('Rassehühner','Große Wyandotten',30,20,null,28),
 ('Rassehühner','Houdan',35,20,null,29),
 ('Rassehühner','New Hampshire',30,20,null,30),
 ('Rassehühner','Olivleger',30,20,null,31),
 ('Rassehühner','Orpington',40,20,null,32),
 ('Rassehühner','Paduaner',35,20,null,33),
 ('Rassehühner','Schwedische Blumenhühner',30,20,null,34),
 ('Rassehühner','Seidenhühner',35,20,null,35),
 ('Rassehühner','Sulmtaler',30,20,null,36),
 ('Rassehühner','Vorwerk',30,20,null,37),
 ('Rassehühner','Weißhauben',30,20,null,38),
 ('Rassehühner','Welsumer',30,20,null,39),
 ('Zwerghühner','Bartzwerge',30,20,null,40),
 ('Zwerghühner','Mod. Engl. Zwergkämpfer',30,20,null,41),
 ('Zwerghühner','Sebright',30,20,null,42),
 ('Zwerghühner','Watermaalsche Zwerge',30,20,null,43),
 ('Zwerghühner','Zwerg Amrock',30,20,null,44),
 ('Zwerghühner','Zwerg Bielefelder',22,20,null,45),
 ('Zwerghühner','Zwerg Cochin',30,20,null,46),
 ('Zwerghühner','Zwerg Lachshühner',30,20,null,47),
 ('Zwerghühner','Zwerg New Hampshire',30,20,null,48),
 ('Zwerghühner','Zwerg Paduaner',30,20,null,49),
 ('Zwerghühner','Zwerg Sussex',30,20,null,50),
 ('Zwerghühner','Zwerg Welsumer',18,20,null,51),
 ('Zwerghühner','Zwerg Wyandotten',30,20,null,52),
 ('Enten & Gänse','Flugenten',null,null,'Preis auf Anfrage',53),
 ('Enten & Gänse','Laufenten',null,null,'Preis auf Anfrage',54),
 ('Enten & Gänse','Landenten',null,null,'Preis auf Anfrage',55),
 ('Enten & Gänse','Dänenenten',null,null,'Preis auf Anfrage',56),
 ('Enten & Gänse','Sachsenenten',null,null,'Preis auf Anfrage',57),
 ('Enten & Gänse','Mularden',null,null,'Preis auf Anfrage',58),
 ('Enten & Gänse','Wildenten',null,null,'Preis auf Anfrage',59),
 ('Enten & Gänse','Gössel',null,null,'12–16 € je nach Alter',60),
 ('Weiteres Geflügel','Masthähnchen (3 Wochen)',4.5,null,null,61),
 ('Weiteres Geflügel','Masthähnchen schlachtreif',null,null,'Preis auf Anfrage',62),
 ('Weiteres Geflügel','Wachteln',7,null,null,63),
 ('Weiteres Geflügel','Perlhühner',null,null,'11–15 € je nach Alter',64),
 ('Weiteres Geflügel','Weiße Puten',null,null,'11–15 € je nach Alter',65),
 ('Weiteres Geflügel','Bronzeputen',null,null,'12–16 € je nach Alter',66)
on conflict (name) do update set
  category = excluded.category, price = excluded.price, price_hahn = excluded.price_hahn,
  price_note = excluded.price_note, sort = excluded.sort;

-- =====================================================================
-- Haltepunkte und Fahrten (Fahrplan laut Webseite, Stand November 2026)
-- Kann erneut ausgeführt werden: Haltepunkte werden aktualisiert, Fahrten ohne
-- Bestellungen werden neu aufgebaut, Fahrten mit Bestellungen bleiben erhalten.
-- =====================================================================
create unique index if not exists stops_name_key on stops(name);

insert into stops (name, region, address, note, sort) values
  ('Diemelstadt','Nordhessen/Eichsfeld/Thüringen','SVG Rastplatz A44',null,10),
  ('Burghasungen','Nordhessen/Eichsfeld/Thüringen','Pendlerparkplatz A44',null,11),
  ('Lohfelden','Nordhessen/Eichsfeld/Thüringen','Autohof Lohfeldener Rüssel','nur auf Bestellung, Uhrzeit nach Absprache',12),
  ('Dramfeld','Nordhessen/Eichsfeld/Thüringen','Hauptstraße 59, Rosdorf',null,13),
  ('Teistungen','Nordhessen/Eichsfeld/Thüringen','Gemeindehaus Parkplatz',null,14),
  ('Worbis','Nordhessen/Eichsfeld/Thüringen','Leinefelde-Worbis, Honsel Tankstelle',null,15),
  ('Nordhausen','Nordhessen/Eichsfeld/Thüringen','Scheunenhof, Sundhausen',null,16),
  ('Dingelstädt','Nordhessen/Eichsfeld/Thüringen','Am Schützenplatz',null,17),
  ('Groß Bartloff','Nordhessen/Eichsfeld/Thüringen','Edeka',null,18),
  ('Geismar','Nordhessen/Eichsfeld/Thüringen','Am Anger',null,19),
  ('Eschwege','Werra-Meißner','Sandrocks Tiernahrung, Friedhofsweg 17',null,20),
  ('Hemeringen','Hameln/Alfeld/Hildesheim','Falcova GmbH',null,30),
  ('Hameln','Hameln/Alfeld/Hildesheim','Hastenbecker Weg 82',null,31),
  ('Coppenbrügge','Hameln/Alfeld/Hildesheim','Bahnhof / Küchentreff',null,32),
  ('Hemmendorf','Hameln/Alfeld/Hildesheim','Marktplatz 3',null,33),
  ('Burgstemmen','Hameln/Alfeld/Hildesheim','Neuer Weg 1-3',null,34),
  ('Eldagsen','Hameln/Alfeld/Hildesheim','Raiffeisenmarkt',null,35),
  ('Alfeld','Hameln/Alfeld/Hildesheim','Zooparadies Kempf',null,36),
  ('Hildesheim','Hameln/Alfeld/Hildesheim','MTG Fleige, Frankenstr. 2',null,37),
  ('Holle','Hameln/Alfeld/Hildesheim','Am Mohldberg 1',null,38),
  ('Steinlah','Hameln/Alfeld/Hildesheim','Gebrüder Kassel Mühle',null,39),
  ('Vechelde','Hameln/Alfeld/Hildesheim','Raiffeisenmarkt',null,40),
  ('Groß Lafferde','Hameln/Alfeld/Hildesheim','Zum Marktplatz (Marktstr. 50)',null,41),
  ('Schellerten','Hameln/Alfeld/Hildesheim','Edeka / Bushaltestelle',null,42),
  ('Warburg','Warburg/Gudensberg/Eschwege','Raiffeisen Markt',null,50),
  ('Gudensberg','Warburg/Gudensberg/Eschwege','Fritzlarer Str. 43',null,51),
  ('Hessisch Lichtenau','Warburg/Gudensberg/Eschwege','OnOvO Tierbedarf, Am Hambacher Weg 4',null,52),
  ('Waldkappel','Warburg/Gudensberg/Eschwege','Rewe Einfahrt',null,53),
  ('Beverungen','OnOvO-Tour','Stadtmühle onOvo',null,60),
  ('Hann. Münden','OnOvO-Tour','Farmerstore onOvo',null,61),
  ('Rosdorf','OnOvO-Tour','Farmerstore onOvo',null,62),
  ('Stockelsdorf','neu ab 2027',null,null,70),
  ('Rosengarten','neu ab 2027',null,null,71),
  ('Bispingen','neu ab 2027',null,null,72)
on conflict (name) do update set
  region = excluded.region, address = excluded.address,
  note = coalesce(excluded.note, stops.note), sort = excluded.sort;

delete from trips t
where not exists (select 1 from orders o join trip_stops ts on ts.id = o.trip_stop_id where ts.trip_id = t.id);

create or replace function _seed_trip(d date, n text, stop_names text[], times text[]) returns void
language plpgsql as $$
declare tid bigint; i int;
begin
  if exists (select 1 from trips where trip_date = d and name = n) then return; end if;
  insert into trips (trip_date, name) values (d, n) returning id into tid;
  for i in 1 .. array_length(stop_names,1) loop
    insert into trip_stops (trip_id, stop_id, stop_time, sort)
    select tid, id, times[i], i from stops where name = stop_names[i];
  end loop;
end $$;

do $seed$
declare d date;
begin
  perform _seed_trip('2026-11-21', 'Wintertour (kleine Auswahl)', array['Gudensberg','Hessisch Lichtenau','Eschwege','Warburg'], array['09:30','11:00','13:00','14:30']);

  foreach d in array array['2027-02-27','2027-03-13','2027-03-27','2027-04-10','2027-04-24']::date[] loop
    perform _seed_trip(d, 'Tour Nordhessen, Eichsfeld & Thüringen', array['Diemelstadt','Burghasungen','Lohfelden','Dramfeld','Teistungen','Worbis','Nordhausen','Dingelstädt','Groß Bartloff','Geismar','Eschwege'], array['06:00','06:15','ca. 06:40','07:15','08:15','09:00','10:00','11:15','12:00','12:15','13:00']);
    perform _seed_trip(d, 'Tour Hameln, Alfeld & Hildesheim', array['Hemeringen','Hameln','Coppenbrügge','Hemmendorf','Burgstemmen','Eldagsen','Alfeld','Hildesheim','Holle','Steinlah','Vechelde','Groß Lafferde','Schellerten'], array['06:30','07:00','07:20','07:30','08:00','08:30','09:30','10:30','11:15','12:00','13:15','14:00','14:30']);
  end loop;

  foreach d in array array['2027-03-06','2027-03-20','2027-04-17','2027-05-15','2027-06-19','2027-07-17','2027-08-21']::date[] loop
    perform _seed_trip(d, 'Tour Warburg, Gudensberg & Eschwege', array['Warburg','Gudensberg','Hessisch Lichtenau','Waldkappel','Eschwege'], array['08:00','09:30','11:00','12:15','13:00']);
    perform _seed_trip(d, 'OnOvO-Tour', array['Beverungen','Hann. Münden','Rosdorf'], array['09:00','10:30','12:00']);
  end loop;

  -- Eschwege jeden Samstag 13:00 (27.02.–30.10.2027), sofern nicht schon in einer Tour
  for d in select g::date from generate_series('2027-02-27'::date, '2027-10-30'::date, interval '7 days') g loop
    if d <> all (array['2027-02-27','2027-03-13','2027-03-27','2027-04-10','2027-04-24','2027-03-06','2027-03-20','2027-04-17','2027-05-15','2027-06-19','2027-07-17','2027-08-21']::date[]) then
      perform _seed_trip(d, 'Eschwege', array['Eschwege'], array['13:00']);
    end if;
  end loop;
end $seed$;

drop function _seed_trip(date, text, text[], text[]);
