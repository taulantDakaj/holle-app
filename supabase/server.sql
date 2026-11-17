-- Nur auf dem echten Supabase-Server ausführen (pg_cron, pg_net, Edge Function)
-- ---------- Wöchentliche Datensicherung per Telegram (Edge Function „backup“) ----------
create extension if not exists pg_cron;
insert into app_settings (key, value) values ('backup_secret', encode(extensions.gen_random_bytes(24), 'hex'))
  on conflict (key) do nothing;

create or replace function backup_senden() returns bigint
language plpgsql security definer set search_path = public, extensions as $$
declare v_id bigint;
begin
  select net.http_post(
    url := 'https://azukcqhiyutyzpokkxva.supabase.co/functions/v1/backup',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-backup-secret', (select value from app_settings where key = 'backup_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000) into v_id;
  return v_id;
end $$;
revoke all on function backup_senden() from public, anon, authenticated;

create or replace function backup_jetzt() returns json
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Nur der Admin darf das.'; end if;
  perform backup_senden();
  return json_build_object('ok', true);
end $$;
revoke all on function backup_jetzt() from public, anon;
grant execute on function backup_jetzt() to authenticated;

create or replace function backup_status() returns json
language sql stable security definer set search_path = public as $$
  select case when is_admin() then (select value::json from app_settings where key = 'backup_letztes') end;
$$;
revoke all on function backup_status() from public, anon;
grant execute on function backup_status() to authenticated;

-- jeden Sonntag ca. 20 Uhr (19:07 UTC im Winter)
select cron.unschedule(jobid) from cron.job where jobname = 'holle-backup';
select cron.schedule('holle-backup', '7 19 * * 0', 'select public.backup_senden()');
create or replace function news_push(p_id bigint) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare n news%rowtype;
begin
  if not is_staff() then raise exception 'Kein Zugriff.'; end if;
  select * into n from news where id = p_id;
  if not found then raise exception 'News nicht gefunden.'; end if;
  perform net.http_post(
    url := 'https://azukcqhiyutyzpokkxva.supabase.co/functions/v1/push-senden',
    headers := jsonb_build_object('Content-Type','application/json','x-push-secret',(select value from app_settings where key='push_secret')),
    body := jsonb_build_object('titel', n.titel, 'text', left(n.text, 200), 'url', '/#/mein'),
    timeout_milliseconds := 60000);
  update news set gepusht = now() where id = p_id;
  return json_build_object('ok', true);
end $$;
revoke all on function news_push(bigint) from public, anon;
grant execute on function news_push(bigint) to authenticated;

create or replace function push_status() returns json
language sql stable security definer set search_path = public as $$
  select case when is_staff() then json_build_object('abos', (select count(*) from push_abos),
    'letztes', (select value::json from app_settings where key='push_letztes')) end;
$$;
revoke all on function push_status() from public, anon;
grant execute on function push_status() to authenticated;

-- Code-Eingabe für „Mein Holle“ (iPhone-Home-Bildschirm hat eigenen Speicher)
create table if not exists mein_code_versuche (zeit timestamptz not null default now());
alter table mein_code_versuche enable row level security;
create or replace function mein_code_einloesen(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare c text := lower(regexp_replace(coalesce(p_code,''), '[^a-zA-Z0-9]', '', 'g')); t text;
begin
  if length(c) <> 8 then raise exception 'Der Code hat 8 Zeichen.'; end if;
  delete from mein_code_versuche where zeit < now() - interval '1 hour';
  if (select count(*) from mein_code_versuche) > 200 then raise exception 'Gerade zu viele Versuche. Bitte später nochmal.'; end if;
  insert into mein_code_versuche default values;
  select token into t from kunden_zugang where left(token, 8) = c limit 1;
  if t is null then raise exception 'Code nicht gefunden. Bitte nochmal prüfen.'; end if;
  return t;
end $$;
revoke all on function mein_code_einloesen(text) from public;
grant execute on function mein_code_einloesen(text) to anon, authenticated;
