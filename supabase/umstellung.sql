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
        'price', p.price, 'price_hahn', p.price_hahn, 'price_note', p.price_note, 'note', p.note, 'bestand', p.bestand)
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
