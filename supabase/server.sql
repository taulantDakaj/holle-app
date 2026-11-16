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
