-- =====================================================================
-- Holle-App · Gutscheine verkaufen
-- Kunden bestellen Gutscheine in der App (#/gutschein).
-- Gespeichert in bb_docs (coll = 'gutscheine'), sichtbar in der Verwaltung
-- unter Nachrichten → Gutscheine. Kann gefahrlos wiederholt werden.
-- =====================================================================

create or replace function submit_gutschein(p jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_name  text := left(trim(coalesce(p->>'name','')), 100);
  v_tel   text := left(trim(coalesce(p->>'telefon','')), 30);
  v_mail  text := left(trim(coalesce(p->>'email','')), 120);
  v_wert  int  := nullif(regexp_replace(coalesce(p->>'wert',''), '[^0-9]', '', 'g'), '')::int;
  v_anz   int  := coalesce(nullif(regexp_replace(coalesce(p->>'anzahl',''), '[^0-9]', '', 'g'), '')::int, 1);
  v_art   text := coalesce(p->>'art', '');
  v_an    text := coalesce(p->>'an', 'mich');
  v_adr   text := left(trim(coalesce(p->>'adresse','')), 300);
  v_fuer  text := left(trim(coalesce(p->>'fuer','')), 60);
  v_von   text := left(trim(coalesce(p->>'von','')), 60);
  v_mot   text := coalesce(p->>'motiv', 'weihnachten');
  v_bem   text := left(trim(coalesce(p->>'bemerkung','')), 500);
  v_id    text := substr(md5(random()::text || clock_timestamp()::text), 1, 20);
  v_now   text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  if length(v_name) < 2 then raise exception 'Bitte Namen angeben.'; end if;
  if length(regexp_replace(v_tel, '[^0-9]', '', 'g')) < 6 then raise exception 'Bitte gültige Handynummer angeben.'; end if;
  if v_wert is null or v_wert < 10 or v_wert > 500 then raise exception 'Bitte einen Betrag zwischen 10 und 500 € wählen.'; end if;
  if v_anz < 1 or v_anz > 10 then raise exception 'Bitte 1 bis 10 Gutscheine wählen.'; end if;
  if v_art not in ('post', 'abholung') then raise exception 'Bitte wählen, wie der Gutschein zu dir kommt.'; end if;
  if v_an not in ('mich', 'beschenkt') then v_an := 'mich'; end if;
  if v_mot not in ('weihnachten', 'neutral') then v_mot := 'weihnachten'; end if;
  if v_art = 'post' and length(v_adr) < 10 then raise exception 'Bitte die vollständige Postadresse angeben.'; end if;

  if (select count(*) from bb_docs where coll = 'gutscheine' and data->>'telefon' = v_tel
        and (data->>'created') > to_char(now() - interval '1 day', 'YYYY-MM-DD"T"HH24:MI:SS')) >= 5 then
    raise exception 'Zu viele Bestellungen mit dieser Nummer. Bitte ruf uns kurz an.'; end if;

  insert into bb_docs (coll, id, data) values ('gutscheine', v_id, jsonb_build_object(
    'nr', 'G-' || upper(substr(v_id, 1, 5)),
    'name', v_name, 'telefon', v_tel, 'email', v_mail,
    'wert', v_wert, 'anzahl', v_anz, 'summe', v_wert * v_anz,
    'art', v_art, 'an', v_an, 'adresse', v_adr,
    'fuer', v_fuer, 'von', v_von, 'motiv', v_mot, 'bemerkung', v_bem,
    'status', 'neu', 'quelle', 'kunde',
    'created', v_now, 'updated', v_now));

  perform push_senden('Gutschein-Bestellung: ' || v_name,
    v_anz || '× ' || v_wert || ' € (' || (v_wert * v_anz) || ' €) · '
    || case when v_art = 'post' then 'per Post' else 'Abholung Rietberg' end
    || case when v_mot = 'neutral' then ' · neutral' else ' · Weihnachten' end);

  return json_build_object('nr', 'G-' || upper(substr(v_id, 1, 5)), 'summe', v_wert * v_anz);
end $$;

revoke all on function submit_gutschein(jsonb) from public;
grant execute on function submit_gutschein(jsonb) to anon, authenticated;
