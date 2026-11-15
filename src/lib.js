import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://azukcqhiyutyzpokkxva.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_VIAheNDttflhoVjwUQ-RRw_NbFyWAgc';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const SHOP_PHONE = '0157 80267793';
export const SHOP_WA = '4915780267793';
export const DATENSCHUTZ_URL = 'https://www.gefluegelverkauf-holle.de/datenschutz/';

const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export function fmtDate(d, withYear = true) {
  if (!d) return '';
  const x = new Date(d + (d.length === 10 ? 'T12:00:00' : ''));
  const dd = String(x.getDate()).padStart(2, '0');
  const mm = String(x.getMonth() + 1).padStart(2, '0');
  return `${WD[x.getDay()]}, ${dd}.${mm}.${withYear ? x.getFullYear() : ''}`;
}
export function fmtDateTime(ts) {
  const x = new Date(ts);
  return x.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
export function fmtPrice(p) {
  if (p === null || p === undefined || p === '') return '';
  return Number(p).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}
export function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** 0151 1234567 -> 491511234567 */
export function waNumber(phone) {
  let n = (phone || '').replace(/[^0-9+]/g, '');
  if (n.startsWith('+')) n = n.slice(1);
  else if (n.startsWith('00')) n = n.slice(2);
  else if (n.startsWith('0')) n = '49' + n.slice(1);
  return n;
}
export function waLink(phone, text) {
  return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text || '')}`;
}

export function groupBy(arr, fn) {
  const m = new Map();
  for (const x of arr) {
    const k = fn(x);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(x);
  }
  return m;
}

export const STATUS = {
  neu: { label: 'Neu', cls: 'st-neu' },
  bestaetigt: { label: 'Bestätigt', cls: 'st-ok' },
  abgeholt: { label: 'Abgeholt', cls: 'st-done' },
  storniert: { label: 'Storniert', cls: 'st-cancel' },
};
export const SOURCES = {
  kunde: 'Kunden-App',
  whatsapp: 'WhatsApp',
  telefon: 'Telefon',
  instagram: 'Instagram',
  vor_ort: 'Vor Ort',
  sonstiges: 'Sonstiges',
};

export function itemsText(items) {
  return (items || []).map((i) => `${i.qty}× ${i.product_name}`).join(', ');
}

/** Beschreibung der Abholung einer Bestellung (aus geladenem Admin-Datensatz) */
export function pickupText(o, withAddress = false) {
  if (o.pickup_type === 'rietberg') return `Rietberg, ${fmtDate(o.pickup_date)} (nach Absprache)`;
  const ts = o.trip_stops;
  if (!ts) return 'Haltepunkt fehlt';
  const addr = withAddress && ts.stops?.address ? ` (${ts.stops.address})` : '';
  return `${ts.stops?.name}${addr}, ${fmtDate(ts.trips?.trip_date)}${ts.stop_time ? ', ' + ts.stop_time + ' Uhr' : ''}`;
}

export function confirmText(o) {
  return (
    `Hallo ${o.customer_name.split(' ')[0]}, deine Bestellung ${o.order_no} bei Geflügelverkauf Holle ist bestätigt:\n` +
    (o.order_items || []).map((i) => `• ${i.qty}× ${i.product_name}`).join('\n') +
    `\n\nAbholung: ${pickupText(o, true)}\n` +
    `Bezahlung bei Abholung (bar, PayPal oder Überweisung).\n` +
    `Falls etwas dazwischenkommt, sag bitte mindestens 24–36 Stunden vorher Bescheid.\n\nViele Grüße\nGeflügelverkauf Holle`
  );
}
