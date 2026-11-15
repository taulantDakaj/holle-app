# Holle-App

Bestell-App für **Geflügelverkauf Holle**.

- **Kunden-Bestellseite:** `https://taulantdakaj.github.io/holle-app/`
- **Verwaltung:** `https://taulantdakaj.github.io/holle-app/#/admin`

## Aufbau
- Web-App (React + Vite), wird bei jeder Änderung automatisch über GitHub Pages veröffentlicht.
- Daten liegen in Supabase (EU). Kunden können nur bestellen, aber keine Daten lesen.
  Nur eingetragene Mitarbeiter (Tabelle `staff`) sehen Bestellungen.
- `supabase/setup.sql` – einmalige Einrichtung der Datenbank inkl. Startdaten.
- `supabase/mitarbeiter.sql` – Mitarbeiter freischalten.

## Version 1
- Kunden bestellen selbst (Tiere, Haltepunkt/Termin oder Rietberg, Kontaktdaten)
- Bestellungen aufnehmen (WhatsApp, Telefon …), bestätigen (mit fertiger WhatsApp-Nachricht), abgeholt, stornieren
- Fahrt-Plan: Lade-Plan (Summe je Tier) und Liste je Haltepunkt, druckbar
- Sortiment: Verfügbarkeit und Preise pflegen
- Fahrten und Haltepunkte verwalten
