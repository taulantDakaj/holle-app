import { useEffect, useState } from 'react';
import { supabase, fmtDate, SHOP_WA } from './lib.js';
import { TOURS } from './tours.js';
import { Stempelkarte } from './Shop.jsx';

export const VAPID_PUBLIC = 'BNH-HeXZtxDSakje4TWXUjrgzzTWVy9OW6nBDyTJPIQJj4-2U9lXVyqiV1zpxB1Iy3COiBa50IR15QRz_TSnvgE';
const KEY = 'holle-mein';

export function meinToken() {
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
}
export function setMeinToken(t) {
  try { if (t) localStorage.setItem(KEY, t); } catch { /* privat */ }
}

const istIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const istApp = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const pushMoeglich = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function b64ToUint8(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// Damit „Zum Home-Bildschirm“ direkt den eigenen Bereich öffnet (iPhone: eigener Speicher)
function persoenlichesManifest(token) {
  try {
    const start = new URL(`./?k=${token}#/mein`, location.href).href;
    const m = {
      name: 'Mein Holle', short_name: 'Holle', start_url: start, scope: new URL('./', location.href).href,
      display: 'standalone', background_color: '#e5e5e5', theme_color: '#7a1414',
      icons: [192, 512].map((s) => ({ src: new URL(`./icon-${s}.png`, location.href).href, sizes: `${s}x${s}`, type: 'image/png' })),
    };
    void m;
    const link = document.querySelector('link[rel="manifest"]');
    if (link) link.href = 'https://azukcqhiyutyzpokkxva.supabase.co/functions/v1/manifest?k=' + token;
    history.replaceState(null, '', `./?k=${token}#/mein`);
  } catch { /* egal */ }
}

function seitText(datum) {
  const tage = Math.round((Date.now() - new Date(datum + 'T12:00')) / 864e5);
  if (tage < 14) return 'seit ein paar Tagen bei dir';
  if (tage < 60) return `seit ${Math.round(tage / 7)} Wochen bei dir`;
  const m = Math.round(tage / 30.4);
  return m < 24 ? `seit ${m} Monaten bei dir` : `seit ${Math.round(m / 12)} Jahren bei dir`;
}

export default function MeinHolle({ token }) {
  const [d, setD] = useState(undefined);
  const [push, setPush] = useState('?');
  const [pushMsg, setPushMsg] = useState('');

  useEffect(() => {
    if (!token) { setD(null); return; }
    setMeinToken(token);
    persoenlichesManifest(token);
    supabase.rpc('get_mein_holle', { p_token: token }).then(({ data, error }) => setD(error ? null : data));
    supabase.rpc('mein_holle_besuch', { p_token: token });
    (async () => {
      if (!pushMoeglich()) return setPush(istIOS() && !istApp() ? 'ios-home' : 'nein');
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      const sub = reg && (await reg.pushManager.getSubscription());
      setPush(sub ? 'an' : Notification.permission === 'denied' ? 'blockiert' : 'aus');
    })();
  }, [token]);

  async function pushAn() {
    setPushMsg('');
    try {
      const erlaubt = await Notification.requestPermission();
      if (erlaubt !== 'granted') { setPush('blockiert'); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(VAPID_PUBLIC) });
      const { error } = await supabase.rpc('push_abo_speichern', { p: sub.toJSON(), p_token: token });
      if (error) throw error;
      setPush('an');
    } catch (e) { setPushMsg('Hat nicht geklappt. Bitte später nochmal versuchen.'); }
  }
  async function pushAus() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) { await supabase.rpc('push_abo_loeschen', { p_endpoint: sub.endpoint }); await sub.unsubscribe(); }
    setPush('aus');
  }

  const nachLink = (h) => `./?nach=${h.product_id}${/\bhahn\b/i.test(h.tier) ? 'h' : ''}&n=${h.anzahl}${d?.ort ? '&ort=' + encodeURIComponent(d.ort) : ''}`;

  return (
    <div className="shop mein">
      <header className="hero">
        <img src="./logo.png" alt="" />
        <div>
          <h1>Mein <em>Holle</em></h1>
          <p>{d?.vorname ? `Hallo ${d.vorname} 👋` : 'Dein Bereich bei Geflügelverkauf Holle'}</p>
        </div>
      </header>
      <main>
        {d === undefined && <div className="card">Lade …</div>}
        {d === null && !token && <CodeEingabe />}
        {d === null && token && (
          <div className="card">
            <h2>Link nicht gefunden</h2>
            <p>Öffne deinen persönlichen Link aus unserer WhatsApp-Nachricht oder schreib uns kurz.</p>
            <a className="btn wa" href={`https://wa.me/${SHOP_WA}?text=${encodeURIComponent('Hallo, kannst du mir meinen Mein-Holle-Link schicken?')}`}>Per WhatsApp anfragen</a>
          </div>
        )}
        {d && (
          <>
            {d.spruch && (
              <div className="card spruch">
                <div className="spruch-label">Spruch der Woche</div>
                <p>„{d.spruch}“</p>
              </div>
            )}

            {push === 'aus' && (
              <div className="card push">
                <b>🔔 Nichts mehr verpassen</b>
                <p>Bekomme eine kurze Nachricht, wenn neue Tiere da sind oder wir in deiner Nähe sind. Ca. 1–2× im Monat.</p>
                <button className="btn primary" onClick={pushAn}>Mitteilungen erlauben</button>
                {pushMsg && <p className="hint">{pushMsg}</p>}
              </div>
            )}
            {push === 'ios-home' && (
              <div className="card push">
                <b>📲 Mein Holle als App aufs iPhone</b>
                <p>Tippe unten in Safari auf <b>Teilen</b> <span aria-hidden>⬆️</span> und dann <b>„Zum Home-Bildschirm“</b>. Öffne Mein Holle danach über das neue Symbol – dann kannst du auch Mitteilungen erlauben.</p>
                <p className="hint">Fragt die App nach einem Code, gib diesen ein: <b className="code">{token.slice(0, 4).toUpperCase()}-{token.slice(4, 8).toUpperCase()}</b></p>
              </div>
            )}

            <div className="card">
              <h2>Neuigkeiten</h2>
              {d.news.length === 0 && <p className="hint">Gerade gibt es nichts Neues – schau bald wieder rein.</p>}
              {d.news.map((n) => (
                <article key={n.id} className="news">
                  {n.bild_url && <img src={n.bild_url} alt="" loading="lazy" />}
                  <div className="news-datum">{fmtDate(String(n.datum).slice(0, 10))}</div>
                  <h3>{n.titel}</h3>
                  {n.text && <p>{n.text}</p>}
                </article>
              ))}
            </div>

            {d.offen.length > 0 && (
              <div className="card">
                <h2>Deine nächsten Abholungen</h2>
                {d.offen.map((o) => {
                  const t = TOURS.find((x) => x.id === o.tour);
                  const st = t && t.stops.find((s) => s[1] === o.ort);
                  return (
                    <a key={o.id} className="offen" href={`./#/b/${o.id}`}>
                      <b>{fmtDate(o.datum)}{o.zeit ? `, ${o.zeit} Uhr` : st && st[0] ? `, ${st[0]} Uhr` : ''}</b>
                      <span>{o.tour === 'R' ? 'Rietberg' : o.ort}</span>
                      <span className="sub">{(o.positionen || []).filter((p) => p.tier && +p.anzahl).map((p) => `${p.anzahl} × ${p.tier}`).join(', ')}</span>
                    </a>
                  );
                })}
              </div>
            )}

            <div className="card">
              <h2>Meine Hühner</h2>
              {d.huehner.length === 0 && <p className="hint">Sobald du Tiere bei uns abgeholt hast, erscheinen sie hier.</p>}
              <div className="huehner">
                {d.huehner.map((h) => (
                  <div key={h.tier} className="huhn">
                    <div className="huhn-bild">{h.bild_url ? <img src={h.bild_url} alt="" loading="lazy" /> : <span>🐔</span>}</div>
                    <div className="huhn-text">
                      <b>{h.anzahl} × {h.tier}</b>
                      <span className="sub">{seitText(h.seit)}</span>
                    </div>
                    {h.product_id && h.bestellbar && <a className="btn ghost small" href={nachLink(h)}>Nochmal</a>}
                  </div>
                ))}
              </div>
            </div>

            {d.stempelkarte && <Stempelkarte k={d.stempelkarte} />}

            <a className="btn primary gross" href="./">🐔 Neue Bestellung</a>
            {push === 'an' && <p className="hint center">🔔 Mitteilungen sind an. <button className="linkbtn" onClick={pushAus}>Ausschalten</button></p>}
            {push === 'blockiert' && <p className="hint center">Mitteilungen sind in den Einstellungen deines Handys blockiert.</p>}
            <a className="btn wa" href={`https://wa.me/${SHOP_WA}`}>Fragen? Schreib uns per WhatsApp</a>
          </>
        )}
      </main>
      <footer>Geflügelverkauf Holle · 33397 Rietberg · @gefluegelholle</footer>
    </div>
  );
}

function CodeEingabe() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  async function los() {
    setMsg('');
    const { data, error } = await supabase.rpc('mein_code_einloesen', { p_code: code });
    if (error || !data) { setMsg((error && error.message) || 'Code nicht gefunden.'); return; }
    setMeinToken(data);
    location.replace(`./?k=${data}#/mein`);
  }
  return (
    <div className="card">
      <h2>Mein Holle verbinden</h2>
      <p>Gib den 8-stelligen Code ein, der in Safari unter „Mein Holle“ steht – oder öffne deinen persönlichen Link aus unserer WhatsApp-Nachricht.</p>
      <div className="wl">
        <input placeholder="z. B. AB12-CD34" value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" autoComplete="one-time-code" style={{ fontSize: '1.3rem', letterSpacing: '.1em', textAlign: 'center' }} />
        {msg && <div className="alert">{msg}</div>}
        <button className="btn primary" onClick={los}>Verbinden</button>
      </div>
      <a className="btn wa" href={`https://wa.me/${SHOP_WA}?text=${encodeURIComponent('Hallo, kannst du mir meinen Mein-Holle-Link schicken?')}`}>Link per WhatsApp anfragen</a>
    </div>
  );
}
