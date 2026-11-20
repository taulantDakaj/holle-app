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

-- ---------- Bestand für die Kunden-App (leer = unbegrenzt) ----------
alter table products add column if not exists bestand int;
alter table products drop constraint if exists products_bestand_check;
alter table products add constraint products_bestand_check check (bestand is null or bestand >= 0);
alter table products add column if not exists bild_url text;
alter table products add column if not exists beschreibung text;

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
        'price', p.price, 'price_hahn', p.price_hahn, 'price_note', p.price_note, 'note', p.note, 'bestand', p.bestand, 'bild_url', p.bild_url, 'beschreibung', p.beschreibung)
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
    select * into v_prod from products where id = (v_item->>'product_id')::bigint and available for update;
    if not found then raise exception 'Ein ausgewähltes Tier ist nicht mehr verfügbar.'; end if;
    if v_hahn and v_prod.price_hahn is null then raise exception 'Für % gibt es keine Hähne.', v_prod.name; end if;
    if v_prod.bestand is not null then
      if v_qty > v_prod.bestand then
        raise exception 'Von % sind nur noch % Stück verfügbar.', v_prod.name, v_prod.bestand; end if;
      update products set bestand = bestand - v_qty where id = v_prod.id;
    end if;
    v_pos := v_pos || jsonb_build_array(jsonb_build_object(
      'tier', v_prod.name || case when v_hahn then ' Hahn' else '' end,
      'anzahl', v_qty,
      'preis', case when v_hahn then v_prod.price_hahn else v_prod.price end));
  end loop;

  perform set_config('holle.bestand_fertig', '1', true);
  insert into bb_docs (coll, id, data) values ('orders', v_id, jsonb_build_object(
    'kunde', v_kunde, 'telefon', v_tel, 'wohnort', v_wohn, 'adresse', '',
    'datum', v_datum, 'tour', v_tour, 'ort', v_ort, 'positionen', v_pos,
    'status', 'neu', 'quelle', 'kunde', 'bemerkung', v_bem,
    'created', v_now, 'updated', v_now));

  perform set_config('holle.bestand_fertig', '', true);
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
declare
  v_tg_token text := (select value from app_settings where key = 'telegram_token');
  v_tg_chat  text := (select value from app_settings where key = 'telegram_chat_id');
  v_topic    text := (select value from app_settings where key = 'ntfy_topic');
begin
  begin
    if coalesce(v_tg_token, '') <> '' and coalesce(v_tg_chat, '') <> '' then
      -- Telegram (bevorzugt)
      perform net.http_post(
        url := 'https://api.telegram.org/bot' || v_tg_token || '/sendMessage',
        body := jsonb_build_object('chat_id', v_tg_chat, 'text', '🐔 ' || titel || E'\n' || text_ ||
                  E'\n\nhttps://taulantdakaj.github.io/holle-app/admin.html', 'disable_web_page_preview', true),
        headers := '{"Content-Type":"application/json"}'::jsonb);
    elsif coalesce(v_topic, '') <> '' then
      -- ntfy (Ausweichweg)
      perform net.http_post(url := 'https://ntfy.sh',
        body := jsonb_build_object('topic', v_topic, 'title', titel, 'message', text_,
                  'tags', jsonb_build_array('chicken'), 'priority', 4,
                  'click', 'https://taulantdakaj.github.io/holle-app/admin.html'),
        headers := '{"Content-Type":"application/json"}'::jsonb);
    end if;
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

-- ---------- Rechte aufräumen (nur Kunden-Funktionen öffentlich) ----------
revoke all on function public.bb_neu_benachrichtigen() from public, anon, authenticated;
revoke all on function public.push_senden(text, text) from public, anon, authenticated;
revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;
revoke execute on function public.push_test() from public, anon;

-- ---------- Bestand automatisch nachführen (anlegen, ändern, stornieren, löschen) ----------
create or replace function bestand_produkt(p_tier text) returns bigint
language sql stable set search_path = public as $$
  with b as (select trim(regexp_replace(trim(coalesce(p_tier,'')), '\s+Hahn$', '', 'i')) as n),
  m as (select coalesce((select v from (values
      ('bielefelder kennhuhn','Bielefelder Kennhühner'), ('schwedisches blumenhuhn','Schwedische Blumenhühner'),
      ('zwerg lachshuhn','Zwerg Lachshühner'), ('zwerg wyandotte','Zwerg Wyandotten'), ('große wyandotte','Große Wyandotten'),
      ('deutsches lachshuhn','Deutsche Lachshühner'), ('bartzwerg','Bartzwerge'), ('seidenhuhn','Seidenhühner'),
      ('watermaalscher zwerg','Watermaalsche Zwerge'), ('weißhaube','Weißhauben'),
      ('moderner englischer zwergkämpfer','Mod. Engl. Zwergkämpfer'), ('flugerpel','Flugenten'), ('lauferpel','Laufenten'),
      ('wachtelhähne','Wachtelhennen'), ('wachtelhahn','Wachtelhennen')) x(k, v)
      where k = lower((select n from b))), (select n from b)) as n)
  select id from products where lower(name) = lower((select n from m)) limit 1;
$$;

create or replace function bestand_menge(d jsonb) returns table(pid bigint, menge int)
language sql stable set search_path = public as $$
  select bestand_produkt(e->>'tier'), sum(coalesce(nullif(e->>'anzahl','')::numeric, 0))::int
  from jsonb_array_elements(case when d is null or d->>'status' = 'storniert'
         or jsonb_typeof(d->'positionen') <> 'array' then '[]'::jsonb else d->'positionen' end) e
  group by 1;
$$;

create or replace function bb_bestand_sync() returns trigger
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if coalesce(current_setting('holle.bestand_fertig', true), '') = '1' then return null; end if;
  if coalesce(new.coll, old.coll) <> 'orders' then return null; end if;
  for r in
    select pid, sum(m)::int as diff from (
      select pid, menge as m from bestand_menge(case when tg_op <> 'DELETE' then new.data end)
      union all
      select pid, -menge from bestand_menge(case when tg_op <> 'INSERT' then old.data end)) x
    where pid is not null group by pid having sum(m) <> 0
  loop
    update products set bestand = greatest(0, bestand - r.diff) where id = r.pid and bestand is not null;
  end loop;
  return null;
exception when others then return null;  -- Bestand darf nie das Speichern einer Bestellung verhindern
end $$;

drop trigger if exists bb_bestand on bb_docs;
create trigger bb_bestand after insert or update or delete on bb_docs
  for each row execute function bb_bestand_sync();

revoke all on function bb_bestand_sync() from public, anon, authenticated;
-- ---------- Warteliste, Kunden-Link ----------
create table if not exists warteliste (
  id bigserial primary key,
  product_id bigint references products(id) on delete cascade,
  tier text not null,
  name text not null,
  telefon text not null,
  anzahl int not null default 1,
  bemerkung text not null default '',
  created timestamptz not null default now(),
  benachrichtigt timestamptz,
  erledigt timestamptz
);
alter table warteliste enable row level security;
drop policy if exists staff_all on warteliste;
create policy staff_all on warteliste for all to authenticated using (is_staff()) with check (is_staff());

create or replace function join_waitlist(p jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_name text := left(trim(coalesce(p->>'name','')), 100);
  v_tel  text := left(trim(coalesce(p->>'telefon','')), 30);
  v_anz  int  := coalesce(nullif(p->>'anzahl','')::int, 1);
  v_bem  text := left(trim(coalesce(p->>'bemerkung','')), 300);
  v_prod products%rowtype;
begin
  if length(v_name) < 2 then raise exception 'Bitte Namen angeben.'; end if;
  if length(regexp_replace(v_tel, '[^0-9]', '', 'g')) < 6 then raise exception 'Bitte gültige Handynummer angeben.'; end if;
  if v_anz < 1 or v_anz > 500 then raise exception 'Ungültige Anzahl.'; end if;
  select * into v_prod from products where id = (p->>'product_id')::bigint;
  if not found then raise exception 'Tier nicht gefunden.'; end if;
  if (select count(*) from warteliste where telefon = v_tel and created > now() - interval '1 day') >= 5 then
    raise exception 'Zu viele Einträge mit dieser Nummer. Bitte ruf uns kurz an.'; end if;
  if exists (select 1 from warteliste where telefon = v_tel and product_id = v_prod.id and erledigt is null) then
    update warteliste set anzahl = v_anz, name = v_name, bemerkung = v_bem where telefon = v_tel and product_id = v_prod.id and erledigt is null;
  else
    insert into warteliste (product_id, tier, name, telefon, anzahl, bemerkung) values (v_prod.id, v_prod.name, v_name, v_tel, v_anz, v_bem);
    perform push_senden('Warteliste: ' || v_name, v_anz || '× ' || v_prod.name || coalesce(nullif(' · ' || v_bem, ' · '), ''));
  end if;
  return json_build_object('ok', true);
end $$;

drop function if exists get_my_order(text);
create or replace function get_my_order(p_id text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'nr', upper(substr(id, 1, 6)),
    'vorname', split_part(coalesce(data->>'kunde',''), ' ', 1),
    'datum', data->>'datum', 'tour', data->>'tour', 'ort', data->>'ort',
    'positionen', coalesce(data->'positionen', '[]'::jsonb),
    'status', data->>'status',
    'bezahlt', data ? 'zahlung',
    'stornierbar', (data->>'status') in ('neu','offen') and not (data ? 'zahlung') and (data->>'datum')::date > current_date)
  from bb_docs where coll = 'orders' and id = p_id and length(p_id) >= 16;
$$;

create or replace function cancel_my_order(p_id text, p_grund text default '') returns json
language plpgsql security definer set search_path = public as $$
declare d jsonb;
begin
  select data into d from bb_docs where coll = 'orders' and id = p_id and length(p_id) >= 16 for update;
  if d is null then raise exception 'Bestellung nicht gefunden.'; end if;
  if (d->>'status') not in ('neu','offen') or d ? 'zahlung' then raise exception 'Diese Bestellung kann nicht mehr storniert werden.'; end if;
  if (d->>'datum')::date <= current_date then raise exception 'Am Abholtag bitte kurz anrufen oder per WhatsApp absagen.'; end if;
  update bb_docs set data = data || jsonb_build_object('status','storniert','storniert_von','kunde',
      'bemerkung', concat_ws(' · ', nullif(trim(coalesce(data->>'bemerkung','')), ''),
        case when trim(coalesce(p_grund,'')) <> '' then 'Absage: ' || left(trim(p_grund), 300) else 'Vom Kunden abgesagt' end),
      'updated', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
  where coll = 'orders' and id = p_id;
  perform push_senden('Absage: ' || (d->>'kunde'), to_char((d->>'datum')::date, 'DD.MM.') || ' · ' || (d->>'ort')
    || coalesce(nullif(E'\n' || coalesce(p_grund,''), E'\n'), ''));
  return json_build_object('ok', true);
end $$;

revoke all on function join_waitlist(jsonb) from public;
revoke all on function get_my_order(text) from public;
revoke all on function cancel_my_order(text, text) from public;
grant execute on function join_waitlist(jsonb) to anon, authenticated;
grant execute on function get_my_order(text) to anon, authenticated;
grant execute on function cancel_my_order(text, text) to anon, authenticated;

-- Kunden-App bekommt die Bestell-ID zurück (für den Link „Meine Bestellung“)
do $do$
declare d text := pg_get_functiondef('submit_order(jsonb)'::regprocedure);
begin
  if position('''id'', v_id' in d) = 0 then
    execute replace(d, $x$'datum', v_datum);$x$, $x$'datum', v_datum, 'id', v_id);$x$);
  end if;
end $do$;
-- ---------- Fahrer-Zugang: sieht nur Bestellungen (Tab „Fahrer“) ----------
alter table staff drop constraint if exists staff_role_check;
alter table staff add constraint staff_role_check check (role in ('admin','mitarbeiter','fahrer'));

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and role <> 'fahrer');
$$;
create or replace function is_fahrer() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and role = 'fahrer');
$$;
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and role = 'admin');
$$;
revoke execute on function is_fahrer() from public, anon;
revoke execute on function is_admin() from public, anon;
grant execute on function is_fahrer() to authenticated;
grant execute on function is_admin() to authenticated;

drop policy if exists fahrer_read on bb_docs;
create policy fahrer_read on bb_docs for select to authenticated using (is_fahrer() and coll in ('orders','einstellungen'));
drop policy if exists fahrer_update on bb_docs;
create policy fahrer_update on bb_docs for update to authenticated
  using (is_fahrer() and coll = 'orders') with check (is_fahrer() and coll = 'orders');
drop policy if exists staff_self on staff;
create policy staff_self on staff for select to authenticated using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Admin legt Fahrer-Zugänge in der App an (E-Mail muss kein echtes Postfach sein)
create or replace function fahrer_anlegen(p_email text, p_passwort text, p_name text default '') returns json
language plpgsql security definer set search_path = public, extensions as $$
declare v_email text := lower(trim(p_email)); v_id uuid; v_inst uuid;
begin
  if not is_admin() then raise exception 'Nur der Admin darf Zugänge anlegen.'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Bitte eine gültige E-Mail-Adresse angeben.'; end if;
  if length(coalesce(p_passwort,'')) < 8 then raise exception 'Das Passwort braucht mindestens 8 Zeichen.'; end if;
  if exists (select 1 from staff where lower(email) = v_email and role <> 'fahrer') then
    raise exception 'Diese E-Mail gehört schon zu einem Admin/Mitarbeiter.'; end if;
  select id into v_id from auth.users where lower(email) = v_email;
  if v_id is null then
    select instance_id into v_inst from auth.users limit 1;
    v_id := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current,
      phone_change, phone_change_token, reauthentication_token,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values (coalesce(v_inst, '00000000-0000-0000-0000-000000000000'), v_id, 'authenticated', 'authenticated', v_email,
      crypt(p_passwort, gen_salt('bf')), now(), '', '', '', '', '', '', '', '',
      '{"provider":"email","providers":["email"]}', jsonb_build_object('name', p_name), now(), now());
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (v_id::text, v_id, jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true), 'email', now(), now(), now());
  else
    update auth.users set encrypted_password = crypt(p_passwort, gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()),
      banned_until = null, updated_at = now() where id = v_id;
  end if;
  insert into staff (email, name, role) values (v_email, nullif(trim(p_name),''), 'fahrer')
    on conflict (email) do update set role = 'fahrer', name = coalesce(nullif(trim(excluded.name),''), staff.name);
  return json_build_object('ok', true, 'email', v_email);
end $$;

create or replace function fahrer_entfernen(p_email text) returns json
language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(p_email));
begin
  if not is_admin() then raise exception 'Nur der Admin darf Zugänge entfernen.'; end if;
  if not exists (select 1 from staff where lower(email) = v_email and role = 'fahrer') then raise exception 'Kein Fahrer-Zugang.'; end if;
  delete from staff where lower(email) = v_email and role = 'fahrer';
  delete from auth.users where lower(email) = v_email;
  return json_build_object('ok', true);
end $$;
revoke all on function fahrer_anlegen(text, text, text) from public, anon;
revoke all on function fahrer_entfernen(text) from public, anon;
grant execute on function fahrer_anlegen(text, text, text) to authenticated;
grant execute on function fahrer_entfernen(text) to authenticated;
-- Speichern läuft als Upsert, dafür braucht der Fahrer auch das Insert-Recht auf Bestellungen
drop policy if exists fahrer_insert on bb_docs;
create policy fahrer_insert on bb_docs for insert to authenticated with check (is_fahrer() and coll = 'orders');

-- ---------- Fahrer sieht nur seine Touren (leer = alle) ----------
alter table staff add column if not exists touren text[];
create or replace function fahrer_darf(p_tour text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and role = 'fahrer' and (touren is null or cardinality(touren) = 0 or p_tour = any(touren)));
$$;
revoke execute on function fahrer_darf(text) from public, anon;
grant execute on function fahrer_darf(text) to authenticated;
drop policy if exists fahrer_read on bb_docs;
create policy fahrer_read on bb_docs for select to authenticated
  using (is_fahrer() and (coll = 'einstellungen' or (coll = 'orders' and fahrer_darf(data->>'tour'))));
drop policy if exists fahrer_update on bb_docs;
create policy fahrer_update on bb_docs for update to authenticated
  using (is_fahrer() and coll = 'orders' and fahrer_darf(data->>'tour'))
  with check (is_fahrer() and coll = 'orders' and fahrer_darf(data->>'tour'));
drop policy if exists fahrer_insert on bb_docs;
create policy fahrer_insert on bb_docs for insert to authenticated
  with check (is_fahrer() and coll = 'orders' and fahrer_darf(data->>'tour'));
create or replace function fahrer_touren_setzen(p_email text, p_touren text[]) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Nur der Admin darf das ändern.'; end if;
  update staff set touren = case when p_touren is null or cardinality(p_touren) = 0 then null else p_touren end
    where lower(email) = lower(trim(p_email)) and role = 'fahrer';
  if not found then raise exception 'Kein Fahrer-Zugang.'; end if;
  return json_build_object('ok', true);
end $$;
revoke all on function fahrer_touren_setzen(text, text[]) from public, anon;
grant execute on function fahrer_touren_setzen(text, text[]) to authenticated;

-- ---------- Fahrer sieht nur bestimmte Tage (leer = alle) ----------
alter table staff add column if not exists tage date[];
create or replace function fahrer_darf(p_tour text, p_datum text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and role = 'fahrer'
    and (touren is null or cardinality(touren) = 0 or p_tour = any(touren))
    and (tage is null or cardinality(tage) = 0 or (p_datum ~ '^\d{4}-\d{2}-\d{2}$' and p_datum::date = any(tage))));
$$;
revoke execute on function fahrer_darf(text, text) from public, anon;
grant execute on function fahrer_darf(text, text) to authenticated;
drop policy if exists fahrer_read on bb_docs;
create policy fahrer_read on bb_docs for select to authenticated
  using (is_fahrer() and (coll = 'einstellungen' or (coll = 'orders' and fahrer_darf(data->>'tour', data->>'datum'))));
drop policy if exists fahrer_update on bb_docs;
create policy fahrer_update on bb_docs for update to authenticated
  using (is_fahrer() and coll = 'orders' and fahrer_darf(data->>'tour', data->>'datum'))
  with check (is_fahrer() and coll = 'orders' and fahrer_darf(data->>'tour', data->>'datum'));
drop policy if exists fahrer_insert on bb_docs;
create policy fahrer_insert on bb_docs for insert to authenticated
  with check (is_fahrer() and coll = 'orders' and fahrer_darf(data->>'tour', data->>'datum'));
drop function if exists fahrer_darf(text);
create or replace function fahrer_tage_setzen(p_email text, p_tage date[]) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Nur der Admin darf das ändern.'; end if;
  update staff set tage = case when p_tage is null or cardinality(p_tage) = 0 then null
      else (select array_agg(distinct d order by d) from unnest(p_tage) d) end
    where lower(email) = lower(trim(p_email)) and role = 'fahrer';
  if not found then raise exception 'Kein Fahrer-Zugang.'; end if;
  return json_build_object('ok', true);
end $$;
revoke all on function fahrer_tage_setzen(text, date[]) from public, anon;
grant execute on function fahrer_tage_setzen(text, date[]) to authenticated;

-- ---------- Standort des Fahrers (nur solange die Fahrer-Seite offen ist) ----------
create table if not exists fahrer_position (
  email text primary key, name text,
  lat double precision not null, lng double precision not null, genau double precision,
  zeit timestamptz not null default now());
alter table fahrer_position enable row level security;
drop policy if exists staff_read on fahrer_position;
create policy staff_read on fahrer_position for select to authenticated using (is_staff());
drop policy if exists staff_delete on fahrer_position;
create policy staff_delete on fahrer_position for delete to authenticated using (is_staff());
drop policy if exists eigene on fahrer_position;
create policy eigene on fahrer_position for all to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and (is_fahrer() or is_staff()));

-- ---------- Bild & Beschreibung je Tierart (Bilder liegen im Storage-Bucket „tierbilder“, siehe storage.sql) ----------
alter table products add column if not exists bild_url text;
alter table products add column if not exists beschreibung text;
drop policy if exists fahrer_read on products;
create policy fahrer_read on products for select to authenticated using (is_fahrer());
-- ---------- Stempelkarte für den Kunden (auf seiner Bestellseite) ----------
create or replace function tel_key(t text) returns text
language sql immutable as $$
  select case when length(n) >= 8 then n else '' end from (
    select case
      when x like '+%' then substr(x, 2)
      when x like '00%' then substr(x, 3)
      when x like '0%' then '49' || substr(x, 2)
      else x end as n
    from (select regexp_replace(coalesce(t,''), '[^0-9+]', '', 'g') as x) a) b;
$$;

create or replace function stempel_fuer(p_key text) returns json
language plpgsql stable security definer set search_path = public as $$
declare v_info jsonb; v_rasse int := 0; v_hybrid int := 0; v_st int; v_frei int;
begin
  if coalesce(p_key,'') = '' then return null; end if;
  select data into v_info from bb_docs where coll = 'kunden' and id = p_key;
  if v_info is null or not coalesce((v_info->>'karte')::boolean, false) or coalesce((v_info->>'gewerbe')::boolean, false) then return null; end if;
  select
    coalesce(sum(n) filter (where kat in ('Rassehühner','Zwerghühner')), 0),
    coalesce(sum(n) filter (where kat = 'Hybrid-Legehennen'), 0)
  into v_rasse, v_hybrid
  from (
    select coalesce(nullif(p->>'anzahl','')::numeric, 0)::int as n,
      case when lower(trim(p->>'tier')) in ('maran','sussex','maran+','lohmann') then 'Hybrid-Legehennen'
           else (select category from products where id = bestand_produkt(p->>'tier')) end as kat
    from bb_docs o, jsonb_array_elements(case when jsonb_typeof(o.data->'positionen') = 'array' then o.data->'positionen' else '[]'::jsonb end) p
    where o.coll = 'orders' and o.data->>'status' = 'abgeholt'
      and tel_key(o.data->>'telefon') = p_key
      and (coalesce(v_info->>'seit','') = '' or coalesce(o.data->>'datum','') >= v_info->>'seit')
      and (p->>'tier') !~* '(\mhahn\M|hähne?\M)'
  ) x;
  v_st := v_rasse + floor(v_hybrid / 2.0)::int;
  v_frei := greatest(0, floor(v_st / 10.0)::int - coalesce(nullif(v_info->>'eingeloest','')::int, 0));
  return json_build_object('stempel', v_st, 'rest', v_st - floor(v_st / 10.0)::int * 10, 'frei', v_frei);
end $$;
revoke all on function stempel_fuer(text) from public, anon, authenticated;

create or replace function get_my_order(p_id text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'nr', upper(substr(id, 1, 6)),
    'vorname', split_part(coalesce(data->>'kunde',''), ' ', 1),
    'datum', data->>'datum', 'tour', data->>'tour', 'ort', data->>'ort',
    'positionen', coalesce(data->'positionen', '[]'::jsonb),
    'status', data->>'status',
    'bezahlt', data ? 'zahlung',
    'stornierbar', (data->>'status') in ('neu','offen') and not (data ? 'zahlung') and (data->>'datum')::date > current_date,
    'stempelkarte', stempel_fuer(tel_key(data->>'telefon')))
  from bb_docs where coll = 'orders' and id = p_id and length(p_id) >= 16;
$$;

-- ---------- Kundenbereich „Mein Holle“ ----------
create table if not exists kunden_zugang (
  tel_key text primary key,
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created timestamptz not null default now(),
  zuletzt timestamptz
);
alter table kunden_zugang enable row level security;
drop policy if exists staff_all on kunden_zugang;
create policy staff_all on kunden_zugang for all to authenticated using (is_staff()) with check (is_staff());

create table if not exists news (
  id bigserial primary key,
  titel text not null,
  text text not null default '',
  bild_url text,
  erstellt timestamptz not null default now(),
  sichtbar boolean not null default true,
  gepusht timestamptz
);
alter table news enable row level security;
drop policy if exists staff_all on news;
create policy staff_all on news for all to authenticated using (is_staff()) with check (is_staff());

create table if not exists sprueche (
  id int primary key,
  text text not null,
  aktiv boolean not null default true
);
alter table sprueche enable row level security;
drop policy if exists staff_all on sprueche;
create policy staff_all on sprueche for all to authenticated using (is_staff()) with check (is_staff());
insert into sprueche (id, text) values
(1, 'Ein Tag ohne Hühner ist möglich – aber sinnlos. 🐔'),
(2, 'Glück ist, wenn morgens ein warmes Ei im Nest liegt. 🥚'),
(3, 'Erst kommt das Huhn, dann das Ei – und dann das Frühstück. 🍳'),
(4, 'Hühner sind wie Chips: Bei einem bleibt es nie. 😄'),
(5, 'Wer Hühner hat, braucht keinen Wecker – nur Geduld bis zum ersten Ei.'),
(6, 'Mein Garten, meine Regeln? Nein: Mein Garten, ihre Regeln. 🐓'),
(7, 'Hühner gucken ist das neue Fernsehen. 📺🐔'),
(8, 'Frische Eier vom eigenen Huhn schmecken einfach nach Zuhause.'),
(9, 'Gackern ist Silber, Legen ist Gold. 🥇'),
(10, 'Wer früh aufsteht, findet das Ei zuerst.'),
(11, 'Hühner hören immer zu – sie geben nur selten Ratschläge.'),
(12, 'Ein Huhn im Garten ist besser als zehn im Supermarkt.'),
(13, 'Die beste Therapie hat Federn. 🪶'),
(14, 'Kein Unkraut, keine Schnecken, dafür jede Menge gute Laune.'),
(15, 'Hühner zählen ist wie Schäfchen zählen – nur lustiger.'),
(16, 'Heute schon ein Huhn gestreichelt? 🤗'),
(17, 'Das Leben ist wie ein Hühnerstall: Etwas Ordnung, viel Gegacker.'),
(18, 'Wenn die Hühner glücklich sind, ist das Frühstück gerettet.'),
(19, 'Wer Hühner liebt, liebt auch frühes Aufstehen. Na ja – fast. 😅'),
(20, 'Hinter jedem guten Ei steckt ein zufriedenes Huhn.'),
(21, 'Zuhause ist da, wo die Hühner auf dich warten. 🏡'),
(22, 'Ein Ei am Tag – und die Welt ist in Ordnung.'),
(23, 'Hühner: die einzigen Haustiere, die Frühstück liefern. 🥚'),
(24, 'Ruhe bewahren und Hühner beobachten.'),
(25, 'Wer sagt, Hühner seien dumm, hat noch nie eins beim Futter-Erpressen erlebt. 😄'),
(26, 'Im Hühnerstall gibt es keine schlechten Tage – nur verschiedene Federn.'),
(27, 'Gut Ding will Weile haben – und ein gutes Ei auch.'),
(28, 'Die Hennen wissen genau, wer das Futter bringt. 😉'),
(29, 'Ein Garten ohne Hühner ist nur ein Garten.'),
(30, 'Federn, Freunde, frische Eier – mehr braucht es nicht.'),
(31, 'Morgens Eier sammeln ist wie Ostern – nur jeden Tag. 🐣'),
(32, 'Hühner haben keine Eile – und trotzdem schaffen sie jeden Tag ein Ei.'),
(33, 'Wer Hühner hält, hat immer etwas zu erzählen.'),
(34, 'Auch das größte Omelett fängt mit einem Ei an. 🍳'),
(35, 'Gute Laune ist ansteckend – besonders im Hühnerstall.'),
(36, 'Die Henne denkt mit dem Bauch – und hat meistens recht.'),
(37, 'Ein Schwätzchen am Zaun mit den Hühnern ersetzt manchen Kaffeeklatsch. ☕'),
(38, 'Hühner bringen Leben in jeden Garten – und manchmal ins Beet. 😅'),
(39, 'Das schönste Geräusch am Morgen? Das Gackern nach dem Legen.'),
(40, 'Kleine Hühner, große Freude.'),
(41, 'Jedes Huhn hat seinen eigenen Kopf – genau das macht sie so liebenswert.'),
(42, 'Wer einmal eigene Eier hatte, kauft nie wieder gern im Laden.'),
(43, 'Hühnerglück lässt sich nicht kaufen – nur abholen. 😉'),
(44, 'Zeit mit Hühnern ist nie verschwendet.'),
(45, 'Ein voller Futternapf macht viele Freunde. 🐔🐔🐔'),
(46, 'Die Hühner wissen: Gut gescharrt ist halb gefunden.'),
(47, 'Ob braun, weiß oder grün – jedes Ei ist ein kleines Wunder. 🥚'),
(48, 'Hühner machen glücklich – wissenschaftlich unbewiesen, gefühlt ganz sicher. 😄'),
(49, 'Wer Hühner hat, hat immer Gesellschaft.'),
(50, 'Gackern verbindet. 🧡'),
(51, 'Ein Stall voller Hühner ist ein Herz voller Freude.'),
(52, 'Winterpause? Unsere Hühner freuen sich schon auf den Frühling. 🌱')
on conflict (id) do nothing;

create table if not exists push_abos (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  tel_key text,
  created timestamptz not null default now(),
  fehler int not null default 0
);
alter table push_abos enable row level security;
drop policy if exists staff_read on push_abos;
create policy staff_read on push_abos for select to authenticated using (is_staff());

-- Zugang holen/anlegen (intern)
create or replace function mein_token(p_key text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare t text;
begin
  if coalesce(p_key,'') = '' then return null; end if;
  select token into t from kunden_zugang where tel_key = p_key;
  if t is null then
    insert into kunden_zugang (tel_key) values (p_key) on conflict (tel_key) do nothing;
    select token into t from kunden_zugang where tel_key = p_key;
  end if;
  return t;
end $$;
revoke all on function mein_token(text) from public, anon, authenticated;

-- Für die Verwaltung: Links für mehrere Kunden auf einmal
create or replace function mein_links(p_keys text[]) returns json
language plpgsql security definer set search_path = public as $$
declare r json;
begin
  if not is_staff() then raise exception 'Kein Zugriff.'; end if;
  select coalesce(json_object_agg(k, mein_token(k)), '{}'::json) into r from unnest(p_keys) k where coalesce(k,'') <> '';
  return r;
end $$;
revoke all on function mein_links(text[]) from public, anon;
grant execute on function mein_links(text[]) to authenticated;

create or replace function spruch_der_woche() returns text
language sql stable security definer set search_path = public as $$
  select text from sprueche where aktiv
  order by id
  offset (select (extract(week from current_date)::int + extract(isoyear from current_date)::int * 53) % greatest(count(*),1) from sprueche where aktiv)
  limit 1;
$$;

create or replace function get_mein_holle(p_token text) returns json
language plpgsql stable security definer set search_path = public as $$
declare v_key text; v_name text; v_ort text;
begin
  select tel_key into v_key from kunden_zugang where token = p_token and length(p_token) >= 16;
  if v_key is null then return null; end if;
  select data->>'kunde', data->>'ort' into v_name, v_ort from bb_docs
    where coll = 'orders' and tel_key(data->>'telefon') = v_key and data->>'status' <> 'storniert'
    order by data->>'datum' desc limit 1;
  return json_build_object(
    'vorname', split_part(coalesce(v_name, (select data->>'name' from bb_docs where coll='kunden' and id=v_key), ''), ' ', 1),
    'ort', v_ort,
    'spruch', spruch_der_woche(),
    'news', coalesce((select json_agg(json_build_object('id', id, 'titel', titel, 'text', text, 'bild_url', bild_url, 'datum', erstellt) order by erstellt desc)
       from (select * from news where sichtbar order by erstellt desc limit 8) n), '[]'::json),
    'huehner', coalesce((select json_agg(h order by h.seit desc) from (
        select p->>'tier' as tier, sum(coalesce(nullif(p->>'anzahl','')::numeric,0))::int as anzahl, min(o.data->>'datum') as seit, max(o.data->>'datum') as zuletzt,
          max(pr.id) as product_id, max(pr.bild_url) as bild_url, max(pr.category) as kategorie, bool_or(pr.available) as bestellbar
        from bb_docs o cross join jsonb_array_elements(case when jsonb_typeof(o.data->'positionen')='array' then o.data->'positionen' else '[]'::jsonb end) p
        left join products pr on pr.id = bestand_produkt(p->>'tier')
        where o.coll='orders' and o.data->>'status'='abgeholt' and tel_key(o.data->>'telefon') = v_key
        group by p->>'tier') h), '[]'::json),
    'offen', coalesce((select json_agg(json_build_object('id', id, 'datum', data->>'datum', 'ort', data->>'ort', 'tour', data->>'tour', 'status', data->>'status',
         'positionen', data->'positionen') order by data->>'datum')
       from bb_docs where coll='orders' and tel_key(data->>'telefon') = v_key and data->>'status' in ('neu','offen') and (data->>'datum')::date >= current_date), '[]'::json),
    'stempelkarte', stempel_fuer(v_key)
  );
end $$;
revoke all on function get_mein_holle(text) from public;
grant execute on function get_mein_holle(text) to anon, authenticated;

create or replace function mein_holle_besuch(p_token text) returns void
language sql security definer set search_path = public as $$
  update kunden_zugang set zuletzt = now() where token = p_token;
$$;
revoke all on function mein_holle_besuch(text) from public;
grant execute on function mein_holle_besuch(text) to anon, authenticated;

-- Bestellseite liefert den Link zu „Mein Holle“
create or replace function mein_link_zur_bestellung(p_id text) returns text
language sql security definer set search_path = public as $$
  select mein_token(tel_key(data->>'telefon')) from bb_docs where coll='orders' and id = p_id and length(p_id) >= 16;
$$;
revoke all on function mein_link_zur_bestellung(text) from public;
grant execute on function mein_link_zur_bestellung(text) to anon, authenticated;

-- Mitteilungen: Abo speichern / löschen
create or replace function push_abo_speichern(p jsonb, p_token text default null) returns json
language plpgsql security definer set search_path = public as $$
declare v_key text;
begin
  if coalesce(p->>'endpoint','') !~ '^https://' or coalesce(p->'keys'->>'p256dh','') = '' or coalesce(p->'keys'->>'auth','') = '' then
    raise exception 'Ungültiges Abo.'; end if;
  if (select count(*) from push_abos where created > now() - interval '1 hour') > 300 then raise exception 'Bitte später nochmal.'; end if;
  select tel_key into v_key from kunden_zugang where token = p_token;
  insert into push_abos (endpoint, p256dh, auth, tel_key) values (left(p->>'endpoint', 1000), left(p->'keys'->>'p256dh', 200), left(p->'keys'->>'auth', 100), v_key)
    on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth, tel_key = coalesce(excluded.tel_key, push_abos.tel_key), fehler = 0;
  return json_build_object('ok', true);
end $$;
create or replace function push_abo_loeschen(p_endpoint text) returns void
language sql security definer set search_path = public as $$ delete from push_abos where endpoint = p_endpoint; $$;
revoke all on function push_abo_speichern(jsonb, text) from public;
revoke all on function push_abo_loeschen(text) from public;
grant execute on function push_abo_speichern(jsonb, text) to anon, authenticated;
grant execute on function push_abo_loeschen(text) to anon, authenticated;

create or replace function push_anzahl() returns int
language sql stable security definer set search_path = public as $$ select case when is_staff() then (select count(*)::int from push_abos) end; $$;
revoke all on function push_anzahl() from public, anon;
grant execute on function push_anzahl() to authenticated;
-- ---------- Von-bis-Preise (Wochenpreise je nach Alter) ----------
alter table products add column if not exists price_bis numeric(8,2);
alter table products add column if not exists price_hahn_bis numeric(8,2);

create or replace function eur_txt(x numeric) returns text
language sql immutable as $$ select replace(replace(to_char(x, 'FM99990.00'), '.', ','), ',00', '') || ' €' $$;

-- Stockenten (früher „Wildenten“)
update products set name = 'Stockenten' where name = 'Wildenten';

update products p set price = v.von, price_bis = v.bis, price_hahn = v.hvon, price_hahn_bis = v.hbis, price_note = v.notiz
from (values
  ('Mularden',            7.00, 8.50, null::numeric, null::numeric, '1 Woche 7 € · 2 Wochen 7,50 € · 3 Wochen 8,50 €'),
  ('Flugenten',           7.00, 8.50, 8.00, 10.00, 'Ente 7 / 7,50 / 8,50 € · Erpel 8 / 9 / 10 € (1 / 2 / 3 Wochen)'),
  ('Dänenenten',          7.00, 8.00, null, null, '1 Woche 7 € · 2 Wochen 7,50 € · 3 Wochen 8 €'),
  ('Stockenten',          7.00, 8.50, null, null, '1 Woche 7 € · 2 Wochen 7,50 € · 3 Wochen 8,50 €'),
  ('Laufenten',          10.00,12.00, null, null, '2 Wochen 10 € · 3 Wochen 12 €'),
  ('Sachsenenten',        7.00, 9.00, null, null, '1 Woche 7 € · 2 Wochen 8 € · 3 Wochen 9 €'),
  ('Perlhühner',         13.00,15.00, null, null, '6 Wochen 13 € · 10 Wochen 15 €'),
  ('Weiße Puten',        11.00,15.00,12.00, 16.00, '5–6 Wochen · Henne 11–15 €, Hahn 12–16 € (Preis je nach Woche)'),
  ('Bronzeputen',        12.00,17.00, null, null, '5–6 Wochen · 12–17 € (Preis je nach Woche)'),
  ('Masthähnchen 3 Wochen', 4.50, 5.00, null, null, '4,50–5 € je nach Alter'),
  ('Masthähnchen schlachtreif', 8.50,10.00, null, null, '8,50–10 € je nach Größe')
) v(name, von, bis, hvon, hbis, notiz)
where p.name = v.name;

update products set price = 8.00, price_bis = null, price_note = 'legereif' where name = 'Wachtelhennen';

-- Gänse nach Farbe
insert into products (category, name, price, price_bis, price_note, available, sort, beschreibung)
values ('Enten & Gänse', 'Weiße Gänse', 12.00, 15.00, '14 Tage 12 € · 21 Tage 15 €', true, 60,
        'Junge weiße Gänse (Gössel). Wachsam, brauchen Weide und Wasser. Aufzucht anfangs geschützt und warm.'),
       ('Enten & Gänse', 'Graue Gänse', 13.00, 16.00, '14 Tage 13 € · 21 Tage 16 €', true, 60,
        'Junge graue Gänse (Gössel). Robust und wachsam, brauchen Weide und Wasser. Aufzucht anfangs geschützt und warm.')
on conflict (name) do update set price = excluded.price, price_bis = excluded.price_bis, price_note = excluded.price_note, available = true;
update products set available = false where name = 'Gänse / Gössel';

create or replace function get_shop_data() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'products', coalesce((
      select json_agg(json_build_object(
        'id', p.id, 'category', p.category, 'name', p.name,
        'price', p.price, 'price_bis', p.price_bis, 'price_hahn', p.price_hahn, 'price_hahn_bis', p.price_hahn_bis,
        'price_note', p.price_note, 'note', p.note, 'bestand', p.bestand,
        'bild_url', p.bild_url, 'beschreibung', p.beschreibung)
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

-- Kunden-Bestellung: bei Von-bis-Preis kein fester Preis, sondern Preisspanne als Info
do $do$
declare d text := pg_get_functiondef('submit_order(jsonb)'::regprocedure);
begin
  if position('preis_info' in d) = 0 then
    d := replace(d, $x$'preis', case when v_hahn then v_prod.price_hahn else v_prod.price end));$x$,
      $x$'preis', case when v_hahn then (case when v_prod.price_hahn_bis is null then v_prod.price_hahn end)
                       else (case when v_prod.price_bis is null then v_prod.price end) end,
      'preis_info', case when v_hahn and v_prod.price_hahn_bis is not null then replace(eur_txt(v_prod.price_hahn), ' €', '') || '–' || eur_txt(v_prod.price_hahn_bis) || ' je nach Alter'
                         when not v_hahn and v_prod.price_bis is not null then replace(eur_txt(v_prod.price), ' €', '') || '–' || eur_txt(v_prod.price_bis) || ' je nach Alter' end));$x$);
    execute d;
  end if;
end $do$;

-- Zuordnung alter Name
create or replace function bestand_produkt(p_tier text) returns bigint
language sql stable set search_path = public as $$
  with b as (select trim(regexp_replace(trim(coalesce(p_tier,'')), '\s+Hahn$', '', 'i')) as n),
  m as (select coalesce((select v from (values
      ('bielefelder kennhuhn','Bielefelder Kennhühner'), ('schwedisches blumenhuhn','Schwedische Blumenhühner'),
      ('zwerg lachshuhn','Zwerg Lachshühner'), ('zwerg wyandotte','Zwerg Wyandotten'), ('große wyandotte','Große Wyandotten'),
      ('deutsches lachshuhn','Deutsche Lachshühner'), ('bartzwerg','Bartzwerge'), ('seidenhuhn','Seidenhühner'),
      ('watermaalscher zwerg','Watermaalsche Zwerge'), ('weißhaube','Weißhauben'),
      ('moderner englischer zwergkämpfer','Mod. Engl. Zwergkämpfer'), ('flugerpel','Flugenten'), ('lauferpel','Laufenten'),
      ('wachtelhähne','Wachtelhennen'), ('wachtelhahn','Wachtelhennen'), ('wildenten','Stockenten'), ('wildente','Stockenten'),
      ('gänse / gössel','Weiße Gänse')) x(k, v)
      where k = lower((select n from b))), (select n from b)) as n)
  select id from products where lower(name) = lower((select n from m)) limit 1;
$$;
-- ---------- Hybrid: „Großer Hahn“ mit Wunschsorte (je 2 € unter der Henne) ----------
update products set price_hahn = null, price_hahn_bis = null where category = 'Hybrid-Legehennen';
update products set price = 7.50 where name = 'Wachtelhennen';
insert into products (category, name, price, price_note, note, available, sort, beschreibung)
values ('Hybrid-Legehennen', 'Großer Hahn (Hybrid)', null, 'je 2 € günstiger als die Henne der Wunschsorte',
        'Nicht von jeder Sorte verfügbar – Wunschsorte angeben', true, 999,
        'Ausgewachsener Hybrid-Hahn als Beschützer für deine Hennen. Nicht von jeder Sorte verfügbar – gib deine Wunschsorte an, wir richten uns danach. Preis: je 2 € günstiger als die Henne der Sorte.')
on conflict (name) do update set price_note = excluded.price_note, note = excluded.note, available = true;

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
  v_wunsch products%rowtype;
  v_qty   int;
  v_hahn  boolean;
  v_grhahn int := 0;
  v_hennen int := 0;
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
    select * into v_prod from products where id = (v_item->>'product_id')::bigint and available for update;
    if not found then raise exception 'Ein ausgewähltes Tier ist nicht mehr verfügbar.'; end if;
    if v_prod.bestand is not null then
      if v_qty > v_prod.bestand then
        raise exception 'Von % sind nur noch % Stück verfügbar.', v_prod.name, v_prod.bestand; end if;
      update products set bestand = bestand - v_qty where id = v_prod.id;
    end if;

    if v_prod.name = 'Großer Hahn (Hybrid)' then
      select * into v_wunsch from products where id = nullif(v_item->>'wunsch_id','')::bigint
        and category = 'Hybrid-Legehennen' and name <> 'Großer Hahn (Hybrid)' and available;
      if not found then raise exception 'Bitte eine Wunschsorte für den großen Hahn wählen.'; end if;
      v_grhahn := v_grhahn + v_qty;
      v_pos := v_pos || jsonb_build_array(jsonb_build_object(
        'tier', 'Großer Hahn (Wunsch: ' || v_wunsch.name || ')',
        'anzahl', v_qty,
        'preis', case when v_wunsch.price is not null and v_wunsch.price_bis is null then greatest(v_wunsch.price - 2, 0) end));
      continue;
    end if;

    if v_hahn and v_prod.price_hahn is null then raise exception 'Für % gibt es keine Hähne.', v_prod.name; end if;
    if not v_hahn then v_hennen := v_hennen + v_qty; end if;
    v_pos := v_pos || jsonb_build_array(jsonb_build_object(
      'tier', v_prod.name || case when v_hahn then ' Hahn' else '' end,
      'anzahl', v_qty,
      'preis', case when v_hahn then (case when v_prod.price_hahn_bis is null then v_prod.price_hahn end)
                       else (case when v_prod.price_bis is null then v_prod.price end) end,
      'preis_info', case when v_hahn and v_prod.price_hahn_bis is not null then replace(eur_txt(v_prod.price_hahn), ' €', '') || '–' || eur_txt(v_prod.price_hahn_bis) || ' je nach Alter'
                         when not v_hahn and v_prod.price_bis is not null then replace(eur_txt(v_prod.price), ' €', '') || '–' || eur_txt(v_prod.price_bis) || ' je nach Alter' end));
  end loop;

  if v_grhahn > 0 and v_hennen = 0 then
    raise exception 'Den großen Hahn gibt es nur zusätzlich zu Hennen. Bitte wähle auch Hennen aus.'; end if;

  perform set_config('holle.bestand_fertig', '1', true);
  insert into bb_docs (coll, id, data) values ('orders', v_id, jsonb_build_object(
    'kunde', v_kunde, 'telefon', v_tel, 'wohnort', v_wohn, 'adresse', '',
    'datum', v_datum, 'tour', v_tour, 'ort', v_ort, 'positionen', v_pos,
    'status', 'neu', 'quelle', 'kunde', 'bemerkung', v_bem,
    'created', v_now, 'updated', v_now));

  perform set_config('holle.bestand_fertig', '', true);
  return json_build_object('nr', upper(substr(v_id, 1, 6)), 'datum', v_datum, 'id', v_id);
end $$;
revoke all on function submit_order(jsonb) from public;
grant execute on function submit_order(jsonb) to anon, authenticated;

-- Rabatt auf der Kundenseite anzeigen
create or replace function get_my_order(p_id text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'nr', upper(substr(id, 1, 6)),
    'vorname', split_part(coalesce(data->>'kunde',''), ' ', 1),
    'datum', data->>'datum', 'tour', data->>'tour', 'ort', data->>'ort',
    'positionen', coalesce(data->'positionen', '[]'::jsonb),
    'rabatt', data->'rabatt',
    'status', data->>'status',
    'bezahlt', data ? 'zahlung',
    'stornierbar', (data->>'status') in ('neu','offen') and not (data ? 'zahlung') and (data->>'datum')::date > current_date,
    'stempelkarte', stempel_fuer(tel_key(data->>'telefon')))
  from bb_docs where coll = 'orders' and id = p_id and length(p_id) >= 16;
$$;

-- Abweichende Uhrzeiten je Termin (Sondertouren)
alter table fahrten add column if not exists zeiten jsonb;
create or replace function get_shop_data() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'products', coalesce((
      select json_agg(json_build_object(
        'id', p.id, 'category', p.category, 'name', p.name,
        'price', p.price, 'price_bis', p.price_bis, 'price_hahn', p.price_hahn, 'price_hahn_bis', p.price_hahn_bis,
        'price_note', p.price_note, 'note', p.note, 'bestand', p.bestand,
        'bild_url', p.bild_url, 'beschreibung', p.beschreibung)
        order by p.sort, p.category, p.name)
      from products p where p.available), '[]'::json),
    'fahrten', coalesce((
      select json_agg(json_build_object(
        'datum', f.datum, 'tour', f.tour, 'nur_orte', f.nur_orte, 'hinweis', f.hinweis, 'zeiten', f.zeiten)
        order by f.datum, f.tour)
      from fahrten f
      where f.aktiv and f.datum >= current_date and f.datum <= current_date + 150), '[]'::json)
  );
$$;

-- Partner-Codes (z. B. KUCKUCKSHOF): Rabatt für Kunden, Guthaben für Partner, Live-Übersicht per Link
create table if not exists partner (
  code text primary key check (code ~ '^[A-Z0-9]{3,30}$'),
  name text not null,
  rabatt_pro_tier numeric not null default 1,
  provision_pro_tier numeric not null default 1,
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  aktiv boolean not null default true,
  start date,
  created timestamptz not null default now()
);
create table if not exists partner_einloesung (
  id bigint generated always as identity primary key,
  code text not null references partner(code) on delete cascade,
  datum date not null default current_date,
  betrag numeric not null check (betrag > 0),
  notiz text,
  created timestamptz not null default now()
);
alter table partner enable row level security;
alter table partner_einloesung enable row level security;
drop policy if exists staff_all on partner;
create policy staff_all on partner for all to authenticated using (is_staff()) with check (is_staff());
drop policy if exists staff_all on partner_einloesung;
create policy staff_all on partner_einloesung for all to authenticated using (is_staff()) with check (is_staff());

-- Code im Shop prüfen
create or replace function partner_check(p_code text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('code', code, 'name', name, 'rabatt', rabatt_pro_tier)
  from partner where code = upper(trim(coalesce(p_code,''))) and aktiv;
$$;
grant execute on function partner_check(text) to anon, authenticated;

-- Bestellung: Basis bleibt, Partnercode wird danach angehängt
do $$ begin
  if not exists (select 1 from pg_proc where proname = 'submit_order_basis') then
    alter function submit_order(jsonb) rename to submit_order_basis;
  end if;
end $$;
revoke all on function submit_order_basis(jsonb) from public, anon, authenticated;

create or replace function submit_order(p jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  r json;
  v_p partner%rowtype;
  v_n int;
begin
  r := submit_order_basis(p);
  if coalesce(trim(p->>'code'), '') <> '' then
    select * into v_p from partner where code = upper(trim(p->>'code')) and aktiv;
    if found then
      update bb_docs set data = data || jsonb_build_object(
          'partner', v_p.code,
          'rabatt', case when v_p.rabatt_pro_tier > 0 then jsonb_build_object('art', 'euro',
            'wert', v_p.rabatt_pro_tier * (select coalesce(sum((e->>'anzahl')::int), 0) from jsonb_array_elements(data->'positionen') e),
            'grund', 'Code ' || v_p.code || ' (' || replace(v_p.rabatt_pro_tier::text, '.', ',') || ' € je Tier)') end)
        where coll = 'orders' and id = r->>'id';
    end if;
  end if;
  return r;
end $$;
revoke all on function submit_order(jsonb) from public;
grant execute on function submit_order(jsonb) to anon, authenticated;

-- Live-Übersicht für den Partner (nur über den geheimen Link)
create or replace function partner_uebersicht(p_token text) returns json
language sql stable security definer set search_path = public as $$
  with pt as (select * from partner where token = p_token and length(p_token) >= 20),
  o as (
    select d.data, d.id,
      (select coalesce(sum((e->>'anzahl')::int), 0) from jsonb_array_elements(coalesce(d.data->'positionen','[]'::jsonb)) e) as tiere
    from bb_docs d, pt where d.coll = 'orders' and d.data->>'partner' = pt.code
  ),
  zeilen as (
    select json_agg(json_build_object(
      'bestellt', o.data->>'created',
      'datum', o.data->>'datum',
      'kunde', split_part(trim(o.data->>'kunde'), ' ', 1) ||
               case when position(' ' in trim(o.data->>'kunde')) > 0
                    then ' ' || left(split_part(trim(o.data->>'kunde'), ' ', array_length(regexp_split_to_array(trim(o.data->>'kunde'), '\s+'), 1)), 1) || '.' else '' end,
      'tiere', o.tiere,
      'status', o.data->>'status',
      'abgeholt', case when o.data->>'status' = 'abgeholt' then o.tiere else 0 end)
      order by o.data->>'created' desc) as liste,
      coalesce(sum(case when o.data->>'status' = 'abgeholt' then o.tiere else 0 end), 0) as abgeholt,
      coalesce(sum(case when o.data->>'status' not in ('storniert','abgeholt') then o.tiere else 0 end), 0) as offen,
      count(*) as anzahl
    from o
  ),
  monate as (
    select json_agg(json_build_object('monat', m, 'abgeholt', n) order by m) as liste from (
      select left(o.data->>'datum', 7) m, sum(o.tiere) n from o where o.data->>'status' = 'abgeholt' group by 1) x
  ),
  ein as (
    select coalesce(sum(betrag), 0) as summe,
      json_agg(json_build_object('datum', datum, 'betrag', betrag, 'notiz', notiz) order by datum) as liste
    from partner_einloesung e, pt where e.code = pt.code
  )
  select json_build_object(
    'name', pt.name, 'code', pt.code, 'aktiv', pt.aktiv,
    'rabatt', pt.rabatt_pro_tier, 'provision', pt.provision_pro_tier,
    'bestellungen', coalesce(zeilen.liste, '[]'::json),
    'anzahl', zeilen.anzahl, 'abgeholt', zeilen.abgeholt, 'offen', zeilen.offen,
    'verdient', zeilen.abgeholt * pt.provision_pro_tier,
    'eingeloest', ein.summe,
    'guthaben', zeilen.abgeholt * pt.provision_pro_tier - ein.summe,
    'einloesungen', coalesce(ein.liste, '[]'::json),
    'monate', coalesce(monate.liste, '[]'::json),
    'stand', now())
  from pt, zeilen, monate, ein;
$$;
grant execute on function partner_uebersicht(text) to anon, authenticated;

-- Sonderzeiten auch auf der Kundenseite (Bestellseite + Mein Holle)
create or replace function fahrt_zeit(p_datum text, p_tour text, p_ort text) returns text
language sql stable security definer set search_path = public as $$
  select nullif(f.zeiten->>p_ort, '') from fahrten f
  where f.datum = nullif(p_datum,'')::date and f.tour = p_tour and f.aktiv limit 1;
$$;
-- get_my_order / get_mein_holle liefern zusätzlich 'zeit' (siehe Live-Migration kundenseite_sonderzeiten)
