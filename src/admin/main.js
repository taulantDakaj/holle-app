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

function makeDb() {
  const listeners = new Map(); // coll -> Set(fn)
  let channel = null;
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
      subs.forEach((s) => s.onData(rows));
    } catch (e) {
      subs.forEach((s) => s.onErr && s.onErr(e));
    }
  };
  const ensureChannel = () => {
    if (channel) return;
    channel = supabase
      .channel('bb_docs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bb_docs' }, (p) => {
        const coll = (p.new && p.new.coll) || (p.old && p.old.coll);
        if (coll) fire(coll); else listeners.forEach((_, c) => fire(c));
      })
      .subscribe();
    // Sicherheitsnetz: alle 60 s und beim Zurückkehren in die App neu laden
    setInterval(() => listeners.forEach((_, c) => fire(c)), 60000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') listeners.forEach((_, c) => fire(c));
    });
  };
  const subscribe = (coll, onData, onErr) => {
    ensureChannel();
    if (!listeners.has(coll)) listeners.set(coll, new Set());
    const sub = { onData, onErr };
    listeners.get(coll).add(sub);
    fire(coll);
    return () => listeners.get(coll).delete(sub);
  };
  const write = async (coll, id, data) => {
    const { error } = await supabase.from('bb_docs').upsert({ coll, id, data, updated_at: new Date().toISOString() });
    if (error) throw error;
    fire(coll);
  };

  return {
    doc(path) {
      const [coll, id] = split(path);
      return {
        set: (data) => write(coll, id, data),
        async delete() {
          const { error } = await supabase.from('bb_docs').delete().eq('coll', coll).eq('id', id);
          if (error) throw error;
          fire(coll);
        },
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
async function waitForLogin() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;
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
  const { data: staff } = await supabase.from('staff').select('email,name,role');
  if (!staff || !staff.length) {
    $('#noaccess').hidden = false;
    $('#noaccess-mail').textContent = session.user.email;
    return;
  }
  const db = makeDb();
  window.__holle = { supabase, user: session.user, db };
  window.claude = { use: async (name) => (name === 'db' ? db : null) };
  $('#app').hidden = false;
  $('#who').textContent = session.user.email;
  $('#logout').onclick = async () => { await supabase.auth.signOut(); location.reload(); };
  await import('./bestellbuch.js');
})();
