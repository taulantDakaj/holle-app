-- =====================================================================
-- Holle-App · Umstellung auf das Bestellbuch-Schema
-- Einmal im Supabase SQL Editor ausführen (kann gefahrlos wiederholt werden).
-- =====================================================================

-- ---------- Bestellbuch-Daten (Bestellungen, Einkauf, Einstellungen) ----------
create table if not exists bb_docs (
  coll       text not null,             -- 'orders', 'einkauf', 'einstellungen'
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (coll, id)
);
create index if not exists bb_docs_datum_idx on bb_docs ((data->>'datum')) where coll = 'orders';

alter table bb_docs enable row level security;
drop policy if exists staff_all on bb_docs;
create policy staff_all on bb_docs for all to authenticated using (is_staff()) with check (is_staff());

do $$ begin
  alter publication supabase_realtime add table bb_docs;
exception when others then null;
end $$;

-- ---------- Fahrten, die Kunden in der App auswählen können ----------
create table if not exists fahrten (
  id       bigint generated always as identity primary key,
  datum    date not null,
  tour     text not null,
  nur_orte text[],                       -- leer = alle Haltepunkte der Tour
  hinweis  text,
  aktiv    boolean not null default true,
  unique (datum, tour)
);
alter table fahrten drop constraint if exists fahrten_tour_check;
alter table fahrten add constraint fahrten_tour_check check (tour in ('T1','T2','T3','T4','T5','T6'));
alter table fahrten enable row level security;
drop policy if exists staff_all on fahrten;
create policy staff_all on fahrten for all to authenticated using (is_staff()) with check (is_staff());

-- ---------- Tiernamen wie im Bestellbuch ----------
update products set name = 'Masthähnchen 3 Wochen' where name = 'Masthähnchen (3 Wochen)'
  and not exists (select 1 from products where name = 'Masthähnchen 3 Wochen');
update products set name = 'Gänse / Gössel' where name = 'Gössel'
  and not exists (select 1 from products where name = 'Gänse / Gössel');
update products set name = 'Wachtelhennen' where name = 'Wachteln'
  and not exists (select 1 from products where name = 'Wachtelhennen');

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
    'fahrten', coalesce((
      select json_agg(json_build_object(
        'datum', f.datum, 'tour', f.tour, 'nur_orte', f.nur_orte, 'hinweis', f.hinweis)
        order by f.datum, f.tour)
      from fahrten f
      where f.aktiv and f.datum >= current_date and f.datum <= current_date + 150), '[]'::json)
  );
$$;

-- ---------- Öffentlich: Kunde schickt Bestellung ab ----------
drop function if exists submit_order(jsonb);
create or replace function submit_order(p jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_kunde text := left(trim(coalesce(p->>'kunde','')), 100);
  v_tel   text := left(trim(coalesce(p->>'telefon','')), 30);
  v_wohn  text := left(trim(coalesce(p->>'wohnort','')), 100);
  v_bem   text := left(trim(coalesce(p->>'bemerkung','')), 1000);
  v_tour  text := coalesce(p->>'tour','');
  v_ort   text := left(trim(coalesce(p->>'ort','')), 100);
  v_datum date := nullif(p->>'datum','')::date;
  v_items jsonb := coalesce(p->'items','[]'::jsonb);
  v_pos   jsonb := '[]'::jsonb;
  v_item  jsonb;
  v_prod  products%rowtype;
  v_qty   int;
  v_hahn  boolean;
  v_id    text := substr(md5(random()::text || clock_timestamp()::text), 1, 20);
  v_now   text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  if length(v_kunde) < 2 then raise exception 'Bitte Namen angeben.'; end if;
  if length(regexp_replace(v_tel, '[^0-9]', '', 'g')) < 6 then raise exception 'Bitte gültige Handynummer angeben.'; end if;
  if v_datum is null or v_datum < current_date then raise exception 'Bitte einen gültigen Termin wählen.'; end if;
  if v_tour = 'R' then
    v_ort := 'Rietberg Hof';
  elsif v_tour in ('T1','T2','T3','T4','T5','T6') then
    if not exists (select 1 from fahrten where datum = v_datum and tour = v_tour and aktiv) then
      raise exception 'Für diesen Termin gibt es keine Tour mehr. Bitte neu auswählen.'; end if;
    if length(v_ort) < 2 then raise exception 'Bitte einen Haltepunkt wählen.'; end if;
  else
    raise exception 'Ungültige Tour.';
  end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 or jsonb_array_length(v_items) > 40 then
    raise exception 'Bitte mindestens ein Tier auswählen.'; end if;

  if (select count(*) from bb_docs where coll = 'orders' and data->>'telefon' = v_tel
        and data->>'quelle' = 'kunde' and (data->>'created') > to_char(now() - interval '1 day', 'YYYY-MM-DD"T"HH24:MI:SS')) >= 5 then
    raise exception 'Zu viele Bestellungen mit dieser Nummer. Bitte ruf uns kurz an.'; end if;

  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty := (v_item->>'qty')::int;
    v_hahn := coalesce((v_item->>'hahn')::boolean, false);
    if v_qty is null or v_qty < 1 or v_qty > 1000 then raise exception 'Ungültige Anzahl.'; end if;
    select * into v_prod from products where id = (v_item->>'product_id')::bigint and available;
    if not found then raise exception 'Ein ausgewähltes Tier ist nicht mehr verfügbar.'; end if;
    if v_hahn and v_prod.price_hahn is null then raise exception 'Für % gibt es keine Hähne.', v_prod.name; end if;
    v_pos := v_pos || jsonb_build_array(jsonb_build_object(
      'tier', v_prod.name || case when v_hahn then ' Hahn' else '' end,
      'anzahl', v_qty,
      'preis', case when v_hahn then v_prod.price_hahn else v_prod.price end));
  end loop;

  insert into bb_docs (coll, id, data) values ('orders', v_id, jsonb_build_object(
    'kunde', v_kunde, 'telefon', v_tel, 'wohnort', v_wohn, 'adresse', '',
    'datum', v_datum, 'tour', v_tour, 'ort', v_ort, 'positionen', v_pos,
    'status', 'neu', 'quelle', 'kunde', 'bemerkung', v_bem,
    'created', v_now, 'updated', v_now));

  return json_build_object('nr', upper(substr(v_id, 1, 6)), 'datum', v_datum);
end $$;

revoke all on function submit_order(jsonb) from public;
revoke all on function get_shop_data() from public;
grant execute on function submit_order(jsonb) to anon, authenticated;
grant execute on function get_shop_data() to anon, authenticated;

-- ---------- Fahrten laut Webseite (nur beim ersten Mal) ----------
do $seed$
declare d date;
begin
  if exists (select 1 from fahrten) then return; end if;

  insert into fahrten (datum, tour, nur_orte, hinweis) values
    ('2026-11-21','T4', array['Warburg','Gudensberg','Hessisch Lichtenau','Eschwege'], 'Wintertour – kleine Auswahl, bitte vorher anfragen');

  foreach d in array array['2027-02-27','2027-03-13','2027-03-27','2027-04-10','2027-04-24']::date[] loop
    insert into fahrten (datum, tour) values (d,'T1'), (d,'T2');
  end loop;
  foreach d in array array['2027-03-06','2027-03-20','2027-04-17','2027-05-15','2027-06-19','2027-07-17','2027-08-21']::date[] loop
    insert into fahrten (datum, tour) values (d,'T4'), (d,'T3');
  end loop;
  -- Eschwege jeden Samstag bis Ende Oktober 2027
  for d in select g::date from generate_series('2027-02-27'::date, '2027-10-30'::date, interval '7 days') g loop
    if not exists (select 1 from fahrten where datum = d) then
      insert into fahrten (datum, tour, nur_orte) values (d, 'T4', array['Eschwege']);
    end if;
  end loop;
end $seed$;

-- ---------- Neu ab März 2027: Tour 5 Norddeutschland (2./4. Samstag) und Markt Weikersheim (1. Sonntag) ----------
do $neu$
declare d date; n int;
begin
  for d in select g::date from generate_series('2027-03-01'::date, '2027-10-31'::date, interval '1 day') g loop
    n := ceil(extract(day from d) / 7.0);
    if extract(dow from d) = 6 and n in (2,4) then
      insert into fahrten (datum, tour) values (d, 'T5') on conflict (datum, tour) do nothing;
    elsif extract(dow from d) = 0 and n = 1 then
      insert into fahrten (datum, tour, hinweis) values (d, 'T6', 'Markt 7:00–10:30 Uhr') on conflict (datum, tour) do nothing;
    end if;
  end loop;
end $neu$;

-- =====================================================================
-- Push-Benachrichtigung bei neuer Kunden-Bestellung (über die kostenlose App „ntfy“)
-- =====================================================================
do $$ begin
  create extension if not exists pg_net;
exception when others then raise notice 'pg_net nicht verfügbar';
end $$;

create table if not exists app_settings (key text primary key, value text);
alter table app_settings enable row level security;
drop policy if exists staff_all on app_settings;
create policy staff_all on app_settings for all to authenticated using (is_staff()) with check (is_staff());
insert into app_settings (key, value)
  values ('ntfy_topic', 'holle-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12))
  on conflict (key) do nothing;

create or replace function push_senden(titel text, text_ text) returns void
language plpgsql security definer set search_path = public as $$
declare v_topic text := (select value from app_settings where key = 'ntfy_topic');
begin
  if v_topic is null or v_topic = '' then return; end if;
  begin
    perform net.http_post(
      url := 'https://ntfy.sh',
      body := jsonb_build_object('topic', v_topic, 'title', titel, 'message', text_,
                'tags', jsonb_build_array('chicken'), 'priority', 4,
                'click', 'https://taulantdakaj.github.io/holle-app/admin.html'),
      headers := '{"Content-Type":"application/json"}'::jsonb);
  exception when others then null; -- eine Bestellung darf nie an der Benachrichtigung scheitern
  end;
end $$;
revoke all on function push_senden(text, text) from public, anon, authenticated;

create or replace function bb_neu_benachrichtigen() returns trigger
language plpgsql security definer set search_path = public as $$
declare t text;
begin
  if new.coll = 'orders' and new.data->>'status' = 'neu' and new.data->>'quelle' = 'kunde' then
    select string_agg((p->>'anzahl') || '× ' || (p->>'tier'), ', ') into t
      from jsonb_array_elements(new.data->'positionen') p;
    perform push_senden('Neue Bestellung: ' || (new.data->>'kunde'),
      coalesce(t, '') || E'\n' || to_char((new.data->>'datum')::date, 'DD.MM.') || ' · ' || (new.data->>'ort'));
  end if;
  return new;
end $$;
drop trigger if exists bb_neu_push on bb_docs;
create trigger bb_neu_push after insert on bb_docs for each row execute function bb_neu_benachrichtigen();

create or replace function push_test() returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() then raise exception 'Kein Zugriff'; end if;
  perform push_senden('Holle-App', 'Test: Benachrichtigungen funktionieren 🐔');
end $$;
revoke all on function push_test() from public, anon;
grant execute on function push_test() to authenticated;
