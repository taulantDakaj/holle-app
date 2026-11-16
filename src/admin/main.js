/* Holle-App Verwaltung: Anmeldung + Speicher-Brücke (Supabase) für das Bestellbuch */
import { supabase } from '../lib.js';
import './bb_css.css';
import './admin.css';

const $ = (s) => document.querySelector(s);

/* ---------- Speicher-Brücke: gleiche Schnittstelle wie der Claude-Speicher des alten Bestellbuchs ---------- */
function split(path) {
  const i = path.indexOf('/');
  return [path.slice(0, i), path.slice(i + 1)];
}
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(15)), (b) => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('').slice(0, 20);

/* ---------- Offline: Zwischenspeicher + Warteschlange ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
};
const istNetzFehler = (e) => !navigator.onLine || /fetch|network|load failed|netzwerk|timeout|abort/i.test(String((e && (e.message || e.details)) || e));
const OUTBOX = 'holle-outbox';
const outbox = () => LS.get(OUTBOX, []);

function offlineBanner() {
  let b = document.getElementById('offline-banner');
  if (!b) { b = document.createElement('div'); b.id = 'offline-banner'; b.hidden = true; document.body.appendChild(b); }
  const n = outbox().length;
  if (!navigator.onLine || n) {
    b.hidden = false;
    b.className = navigator.onLine ? 'sync' : 'off';
    b.textContent = navigator.onLine
      ? `⏳ ${n} Änderung${n === 1 ? '' : 'en'} werden gesendet …`
      : `📴 Offline – du kannst weiterarbeiten.${n ? (n === 1 ? ' 1 Änderung wartet und wird automatisch gesendet.' : ` ${n} Änderungen warten und werden automatisch gesendet.`) : ''}`;
  } else if (!b.hidden && b.className !== 'ok') {
    b.className = 'ok'; b.textContent = '✓ Wieder online – alles gesendet.';
    setTimeout(() => { if (b.className === 'ok') b.hidden = true; }, 3000);
  }
}

function makeDb() {
  const listeners = new Map(); // coll -> Set(fn)
  const cache = new Map();     // coll -> rows
  let channel = null;
  const cacheKey = (c) => 'holle-cache-' + c;
  const overlay = (coll, rows) => {
    // ausstehende Änderungen über die Server-Daten legen
    const m = new Map(rows.map((r) => [r.id, r]));
    outbox().filter((o) => o.coll === coll).forEach((o) => { if (o.op === 'del') m.delete(o.id); else m.set(o.id, { id: o.id, data: o.data }); });
    return [...m.values()];
  };
  const notify = (coll) => {
    const rows = overlay(coll, cache.get(coll) || LS.get(cacheKey(coll), []));
    (listeners.get(coll) || []).forEach((s) => s.onData(rows));
  };
  const refetch = async (coll) => {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase.from('bb_docs').select('id,data').eq('coll', coll).range(from, from + 999);
      if (error) throw error;
      rows.push(...data);
      if (data.length < 1000) break;
    }
    return rows;
  };
  const fire = async (coll) => {
    const subs = listeners.get(coll);
    if (!subs || !subs.size) return;
    try {
      const rows = await refetch(coll);
      cache.set(coll, rows); LS.set(cacheKey(coll), rows);
      notify(coll);
    } catch (e) {
      if (istNetzFehler(e)) { notify(coll); offlineBanner(); }
      else subs.forEach((s) => s.onErr && s.onErr(e));
    }
  };
  let flushing = false;
  const flush = async () => {
    if (flushing || !navigator.onLine) { offlineBanner(); return; }
    flushing = true;
    const touched = new Set();
    try {
      let q = outbox();
      while (q.length) {
        const o = q[0];
        const { error } = o.op === 'del'
          ? await supabase.from('bb_docs').delete().eq('coll', o.coll).eq('id', o.id)
          : await supabase.from('bb_docs').upsert({ coll: o.coll, id: o.id, data: o.data, updated_at: o.ts });
        if (error && istNetzFehler(error)) break;          // später nochmal
        // bei anderen Fehlern (z. B. keine Rechte) Eintrag verwerfen, sonst hängt die Schlange
        if (error) console.warn('Änderung verworfen', o, error);
        touched.add(o.coll);
        q = outbox().slice(1); LS.set(OUTBOX, q);
      }
    } finally { flushing = false; }
    touched.forEach((c) => fire(c));
    offlineBanner();
  };
  window.addEventListener('online', flush);
  window.addEventListener('offline', offlineBanner);
  setInterval(flush, 30000);
  setTimeout(flush, 1500);

  const ensureChannel = () => {
    if (channel) return;
    channel = supabase
      .channel('bb_docs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bb_docs' }, (p) => {
        const coll = (p.new && p.new.coll) || (p.old && p.old.coll);
        if (coll) fire(coll); else listeners.forEach((_, c) => fire(c));
      })
      .subscribe();
    setInterval(() => listeners.forEach((_, c) => fire(c)), 60000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') { flush(); listeners.forEach((_, c) => fire(c)); }
    });
  };
  const subscribe = (coll, onData, onErr) => {
    ensureChannel();
    if (!listeners.has(coll)) listeners.set(coll, new Set());
    const sub = { onData, onErr };
    listeners.get(coll).add(sub);
    // sofort aus dem Speicher anzeigen (nach dem Laden der Seite, nicht mittendrin)
    setTimeout(() => { if (!cache.has(coll) && LS.get(cacheKey(coll), null)) { try { onData(overlay(coll, LS.get(cacheKey(coll), []))); } catch (e) { console.warn(e); } } }, 0);
    fire(coll);
    return () => listeners.get(coll).delete(sub);
  };
  const lokal = (coll, id, data) => {
    const rows = (cache.get(coll) || LS.get(cacheKey(coll), [])).filter((r) => r.id !== id);
    if (data !== undefined) rows.push({ id, data });
    cache.set(coll, rows); LS.set(cacheKey(coll), rows);
  };
  const write = async (coll, id, data) => {
    const ts = new Date().toISOString();
    if (outbox().length || !navigator.onLine) { // Reihenfolge wahren
      LS.set(OUTBOX, [...outbox(), { op: 'set', coll, id, data, ts }]); notify(coll); offlineBanner(); flush(); return;
    }
    const { error } = await supabase.from('bb_docs').upsert({ coll, id, data, updated_at: ts });
    if (error) {
      if (!istNetzFehler(error)) throw error;
      LS.set(OUTBOX, [...outbox(), { op: 'set', coll, id, data, ts }]); notify(coll); offlineBanner(); return;
    }
    lokal(coll, id, data); notify(coll);
    fire(coll);
  };
  const remove = async (coll, id) => {
    if (outbox().length || !navigator.onLine) {
      LS.set(OUTBOX, [...outbox(), { op: 'del', coll, id, ts: new Date().toISOString() }]); notify(coll); offlineBanner(); flush(); return;
    }
    const { error } = await supabase.from('bb_docs').delete().eq('coll', coll).eq('id', id);
    if (error) {
      if (!istNetzFehler(error)) throw error;
      LS.set(OUTBOX, [...outbox(), { op: 'del', coll, id, ts: new Date().toISOString() }]); notify(coll); offlineBanner(); return;
    }
    lokal(coll, id, undefined); notify(coll);
    fire(coll);
  };

  return {
    doc(path) {
      const [coll, id] = split(path);
      return {
        set: (data) => write(coll, id, data),
        delete: () => remove(coll, id),
        onSnapshot(cb, err) {
          return subscribe(coll, (rows) => {
            const r = rows.find((x) => x.id === id);
            cb({ exists: !!r, id, data: () => (r ? r.data : undefined) });
          }, err);
        },
      };
    },
    collection(coll) {
      return {
        add: (data) => write(coll, newId(), data),
        onSnapshot(cb, err) {
          return subscribe(coll, (rows) => cb({ docs: rows.map((r) => ({ id: r.id, data: () => r.data })) }), err);
        },
      };
    },
    _refresh: (coll) => fire(coll),
    _newId: newId,
  };
}

/* ---------- Anmeldung ---------- */
const mitZeitlimit = (p, ms) => Promise.race([Promise.resolve(p), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
function gespeicherteSitzung() {
  try {
    const k = Object.keys(localStorage).find((x) => /^sb-.*-auth-token$/.test(x));
    const v = k && JSON.parse(localStorage.getItem(k));
    return v && v.user ? v : null;
  } catch (e) { return null; }
}
async function waitForLogin() {
  let data = { session: null };
  try { ({ data } = await mitZeitlimit(supabase.auth.getSession(), navigator.onLine ? 15000 : 3000)); } catch (e) { /* offline / Funkloch */ }
  if (data && data.session) return data.session;
  { const s = gespeicherteSitzung(); if (s && (!navigator.onLine || !data)) return s; }
  return new Promise((resolve) => {
    $('#login').hidden = false;
    $('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      $('#login-err').hidden = true;
      $('#login-btn').disabled = true;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: $('#login-email').value.trim(),
        password: $('#login-pw').value,
      });
      $('#login-btn').disabled = false;
      if (error) {
        $('#login-err').hidden = false;
        return;
      }
      $('#login').hidden = true;
      resolve(data.session);
    });
  });
}

(async () => {
  const session = await waitForLogin();
  // Ist der Benutzer als Mitarbeiter freigeschaltet?
  const rolleKey = 'holle-rolle-' + (session.user.email || '').toLowerCase();
  let { data: staff, error: staffErr } = await mitZeitlimit(supabase.from('staff').select('email,name,role'), navigator.onLine ? 12000 : 3000)
    .then((r) => r, (e) => ({ data: null, error: e }));
  if (staffErr && istNetzFehler(staffErr)) {
    const r = LS.get(rolleKey, null);
    if (r) staff = [{ email: session.user.email, role: r }];
  }
  if (!staff || !staff.length) {
    $('#noaccess').hidden = false;
    $('#noaccess-mail').textContent = session.user.email;
    return;
  }
  const db = makeDb();
  const ich = staff.find((x) => (x.email || '').toLowerCase() === (session.user.email || '').toLowerCase()) || staff[0];
  LS.set(rolleKey, ich.role);
  window.__holle = { supabase, user: session.user, db, rolle: ich.role };
  if (ich.role === 'fahrer') document.body.classList.add('rolle-fahrer');
  window.claude = { use: async (name) => (name === 'db' ? db : null) };
  $('#app').hidden = false;
  $('#who').textContent = session.user.email;
  $('#logout').onclick = async () => { await supabase.auth.signOut(); location.reload(); };
  await import('./bestellbuch.js');
  offlineBanner();
})();

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
