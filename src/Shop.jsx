import { useEffect, useMemo, useState } from 'react';
import { supabase, fmtDate, fmtPrice, todayISO, groupBy, SHOP_PHONE, SHOP_WA, DATENSCHUTZ_URL } from './lib.js';
import { TOURS, ORT_KOORD } from './tours.js';
import { meinToken, setMeinToken } from './MeinHolle.jsx';

let plzCache = null;
async function plzKoord(plz) {
  if (!plzCache) plzCache = await fetch('./plz.json').then((r) => r.json());
  return plzCache[plz] || null;
}
function kmZwischen(a, b) {
  const R = 6371, rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h)) * 1.25; // grob Straßen-km
}

/** Alle Abhol-Möglichkeiten aus den Fahrten: {ort, datum, tour, zeit, hinweis} */
function termineAus(fahrten) {
  const out = [];
  for (const f of fahrten || []) {
    const t = TOURS.find((x) => x.id === f.tour);
    if (!t) continue;
    for (const [zeit, ort] of t.stops) {
      if (f.nur_orte && f.nur_orte.length && !f.nur_orte.includes(ort)) continue;
      out.push({ ort, datum: f.datum, tour: f.tour, zeit, hinweis: f.hinweis });
    }
  }
  return out;
}

export default function Shop() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState({});
  const [pickupType, setPickupType] = useState('tour');
  const [ort, setOrt] = useState('');
  const [terminKey, setTerminKey] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [form, setForm] = useState({ customer_name: '', phone: '', city: '', customer_note: '', website: '' });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const [offenKat, setOffenKat] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setErr('Die Bestellseite lädt gerade nicht. Bitte später nochmal versuchen oder per WhatsApp bestellen.'), 12000);
    supabase.rpc('get_shop_data').then(({ data, error }) => {
      clearTimeout(timer);
      if (error) setErr('Die Bestellseite lädt gerade nicht. Bitte per WhatsApp bestellen.');
      else {
        setData(data); setErr('');
        const q = new URLSearchParams(location.search), nach = q.get('nach');
        if (nach) {
          const id = nach.replace(/h$/, ''), p = (data.products || []).find((x) => String(x.id) === id);
          if (p) {
            let n = Math.max(1, Math.min(99, parseInt(q.get('n'), 10) || 1));
            if (p.bestand != null) n = Math.min(n, p.bestand);
            if (n > 0) setQty({ [nach]: n });
            setOffenKat(p.category);
          }
          const o = q.get('ort');
          if (o && termineAus(data.fahrten).some((t) => t.ort === o)) { setPickupType('tour'); setOrt(o); }
          history.replaceState(null, '', location.pathname);
        }
      }
    });
    return () => clearTimeout(timer);
  }, []);

  const byCat = useMemo(() => groupBy(data?.products || [], (p) => p.category), [data]);
  const termine = useMemo(() => termineAus(data?.fahrten), [data]);
  const orte = useMemo(() => [...new Set(termine.map((t) => t.ort))].sort((a, b) => a.localeCompare(b, 'de')), [termine]);
  const ortTermine = termine.filter((t) => t.ort === ort);
  const termin = ortTermine.find((t) => t.datum + t.tour === terminKey);
  // Auswahl: Schlüssel "12" = Henne/Stück, "12h" = Hahn
  const chosen = [];
  for (const p of data?.products || []) {
    if (qty[p.id] > 0) chosen.push({ p, key: String(p.id), hahn: false, n: qty[p.id], label: p.name });
    if (qty[p.id + 'h'] > 0) chosen.push({ p, key: p.id + 'h', hahn: true, n: qty[p.id + 'h'], label: p.name + ' (Hahn)' });
  }
  const total = chosen.reduce((s, c) => s + c.n, 0);
  const catCount = (items) => items.reduce((s, p) => s + (qty[p.id] || 0) + (qty[p.id + 'h'] || 0), 0);

  const [zoom, setZoom] = useState(null);
  const setQ = (id, v, p) => setQty((q) => {
    let n = Math.max(0, Math.min(999, v || 0));
    if (p && p.bestand != null) {
      const other = String(id).endsWith('h') ? (q[p.id] || 0) : (q[p.id + 'h'] || 0);
      n = Math.min(n, Math.max(0, p.bestand - other));
    }
    return { ...q, [id]: n };
  });
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (form.website) return; // Bot
    if (!chosen.length) return setErr('Bitte wähle mindestens ein Tier aus.');
    if (pickupType === 'tour' && !termin) return setErr('Bitte wähle Haltepunkt und Termin.');
    if (pickupType === 'rietberg' && !pickupDate) return setErr('Bitte gib deinen Wunschtermin an.');
    if (!consent) return setErr('Bitte bestätige die Datenschutzhinweise.');
    setSending(true);
    const payload = {
      kunde: form.customer_name,
      telefon: form.phone,
      wohnort: form.city,
      bemerkung: form.customer_note,
      datum: pickupType === 'tour' ? termin.datum : pickupDate,
      tour: pickupType === 'tour' ? termin.tour : 'R',
      ort: pickupType === 'tour' ? termin.ort : 'Rietberg Hof',
      items: chosen.map((c) => ({ product_id: c.p.id, qty: c.n, hahn: c.hahn })),
    };
    const { data: res, error } = await supabase.rpc('submit_order', { p: payload });
    setSending(false);
    if (error) return setErr(error.message || 'Bestellung konnte nicht gesendet werden.');
    setDone({
      ...res,
      summary: chosen.map((c) => `${c.n}× ${c.label}`).join('\n'),
      where: pickupType === 'tour'
        ? `${termin.ort}, ${fmtDate(termin.datum)}${termin.zeit ? ', ' + termin.zeit + ' Uhr' : ''}`
        : `Rietberg, Wunschtermin ${fmtDate(pickupDate)}`,
      name: form.customer_name,
    });
    window.scrollTo(0, 0);
  }

  if (done) {
    const wa = `Hallo, ich habe gerade über die App bestellt (${done.nr}):\n${done.summary}\nAbholung: ${done.where}\n${done.name}`;
    return (
      <Page>
        <div className="card success">
          <div className="big">✓</div>
          <h2>Danke, deine Bestellung ist angekommen!</h2>
          <p>Bestellnummer: <b>{done.nr}</b></p>
          <pre className="summary">{done.summary}</pre>
          <p><b>Abholung:</b> {done.where}</p>
          <p>Wir melden uns per WhatsApp oder Telefon und bestätigen deine Bestellung. Bezahlt wird bei Abholung.</p>
          {done.id && <p><a href={`./#/b/${done.id}`}>Deine Bestellung ansehen oder absagen</a> – den Link schicken wir dir auch mit der Bestätigung.</p>}
          <a className="btn wa" href={`https://wa.me/${SHOP_WA}?text=${encodeURIComponent(wa)}`}>Bestellung zusätzlich per WhatsApp schicken</a>
          <button className="btn ghost" onClick={() => location.reload()}>Neue Bestellung</button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {!data && !err && <div className="card">Lade Angebot …</div>}
      {err && <div className="alert">{err} <a href={`https://wa.me/${SHOP_WA}`}>WhatsApp</a></div>}
      {data && (
        <form onSubmit={submit}>
          <section className="card">
            <h2><span className="num">1</span> Tiere auswählen</h2>
            {[...byCat.entries()].map(([cat, items], ci) => (
              <details key={cat} className="cat" open={offenKat ? cat === offenKat : ci === 0}>
                <summary>
                  {cat}
                  {catCount(items) > 0 && <span className="pill">{catCount(items)}</span>}
                </summary>
                {items.map((p) => (
                  <div className="prod" key={p.id}>
                    <div className={'pinfo' + (p.bild_url ? ' mitbild' : '')}>
                      {p.bild_url && <button type="button" className="pbild" onClick={() => setZoom(p)} aria-label={`Bild von ${p.name} ansehen`}><img src={p.bild_url} alt={p.name} loading="lazy" /></button>}
                      <div className="pname">{p.name}</div>
                      {p.beschreibung && <button type="button" className="pmehr" onClick={() => setZoom(p)}>Mehr zur Rasse</button>}
                      {p.note && <div className="pmeta">{p.note}</div>}
                      {p.bestand === 0 ? <div className="pstock out">ausverkauft</div>
                        : p.bestand != null && p.bestand <= 20 ? <div className="pstock">nur noch {p.bestand} verfügbar</div> : null}
                    </div>
                    {p.bestand === 0 && <Warteliste p={p} />}
                    {p.bestand !== 0 && <div className="variants">
                      <Variant label={p.price_hahn ? 'Henne' : ''}
                        price={p.price ? fmtPrice(p.price) : p.price_note || 'auf Anfrage'}
                        value={qty[p.id]} onChange={(v) => setQ(p.id, v, p)} />
                      {p.price_hahn && (
                        <Variant label="Hahn" price={fmtPrice(p.price_hahn)}
                          value={qty[p.id + 'h']} onChange={(v) => setQ(p.id + 'h', v, p)} />
                      )}
                    </div>}
                  </div>
                ))}
              </details>
            ))}
          </section>

          <section className="card">
            <h2><span className="num">2</span> Abholung</h2>
            <PlzFinder termine={termine} onPick={(r) => {
              if (r.ort === 'Rietberg Hof') { setPickupType('rietberg'); }
              else { setPickupType('tour'); setOrt(r.ort); setTerminKey(r.next ? r.next.datum + r.next.tour : ''); }
              if (!form.city) setForm((f) => ({ ...f, city: r.plz }));
            }} />
            <div className="seg">
              <button type="button" className={pickupType === 'tour' ? 'on' : ''} onClick={() => setPickupType('tour')}>An einem Haltepunkt</button>
              <button type="button" className={pickupType === 'rietberg' ? 'on' : ''} onClick={() => setPickupType('rietberg')}>In Rietberg</button>
            </div>
            {pickupType === 'tour' ? (
              <>
                <label>Haltepunkt
                  <select value={ort} onChange={(e) => { setOrt(e.target.value); setTerminKey(''); }}>
                    <option value="">Bitte wählen …</option>
                    {orte.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
                {orte.length === 0 && <p className="hint">Gerade sind keine Touren geplant. Wähle „In Rietberg“ oder schreib uns per WhatsApp.</p>}
                {ort && (
                  <div className="stops">
                    {ortTermine.map((t) => (
                      <label key={t.datum + t.tour} className={'radio' + (terminKey === t.datum + t.tour ? ' on' : '')}>
                        <input type="radio" name="termin" checked={terminKey === t.datum + t.tour}
                          onChange={() => setTerminKey(t.datum + t.tour)} />
                        <span>{fmtDate(t.datum)}{t.hinweis && <small className="thint">{t.hinweis}</small>}</span>
                        <small>{t.zeit ? t.zeit + ' Uhr' : 'Uhrzeit folgt'}</small>
                      </label>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <label>Wunschtermin
                  <input type="date" min={todayISO()} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                </label>
                <p className="hint">Abholung in Rietberg ist jeden Tag nach Absprache möglich. Ort und Uhrzeit schicken wir dir nach der Bestellung.</p>
              </>
            )}
          </section>

          <section className="card">
            <h2><span className="num">3</span> Deine Daten</h2>
            <label>Name<input required autoComplete="name" value={form.customer_name} onChange={upd('customer_name')} /></label>
            <label>Handynummer (WhatsApp)<input required type="tel" autoComplete="tel" value={form.phone} onChange={upd('phone')} /></label>
            <label>Wohnort<input autoComplete="address-level2" value={form.city} onChange={upd('city')} /></label>
            <label>Anmerkung (optional)<textarea rows="3" value={form.customer_note} onChange={upd('customer_note')} /></label>
            <input className="hp" tabIndex="-1" autoComplete="off" value={form.website} onChange={upd('website')} aria-hidden="true" />
            <label className="check">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Bestellung gespeichert werden. <a href={DATENSCHUTZ_URL} target="_blank" rel="noreferrer">Datenschutzerklärung</a></span>
            </label>
          </section>

          <section className="card info">
            <ul>
              <li>Bezahlung bei Abholung: bar, PayPal oder Überweisung.</li>
              <li>Bestellte Tiere bitte abholen. Falls etwas dazwischenkommt, mindestens 24–36 Stunden vorher absagen.</li>
              <li>Fragen? Ruf an oder schreib per WhatsApp: <a href={`tel:${SHOP_PHONE.replace(/\s/g, '')}`}>{SHOP_PHONE}</a></li>
            </ul>
          </section>

          <div className="sticky">
            <button className="btn primary" disabled={sending}>
              {sending ? 'Wird gesendet …' : total ? `${total} ${total === 1 ? 'Tier' : 'Tiere'} verbindlich bestellen` : 'Bestellen'}
            </button>
          </div>
        </form>
      )}
      {zoom && (
        <div className="zoom" onClick={() => setZoom(null)} role="dialog" aria-label={zoom.name}>
          <div className="zoombox" onClick={(e) => e.stopPropagation()}>
            {zoom.bild_url && <img src={zoom.bild_url} alt={zoom.name} />}
            <h3>{zoom.name}</h3>
            {zoom.beschreibung && <p>{zoom.beschreibung}</p>}
            <button type="button" className="btn ghost" onClick={() => setZoom(null)}>Schließen</button>
          </div>
        </div>
      )}
    </Page>
  );
}

function PlzFinder({ termine, onPick }) {
  const [plz, setPlz] = useState('');
  const [res, setRes] = useState(null);
  const [msg, setMsg] = useState('');
  async function suche(e) {
    e?.preventDefault();
    setMsg(''); setRes(null);
    if (!/^\d{5}$/.test(plz)) return setMsg('Bitte eine 5-stellige Postleitzahl eingeben.');
    let k;
    try { k = await plzKoord(plz); } catch { return setMsg('Suche gerade nicht möglich.'); }
    if (!k) return setMsg('Diese Postleitzahl kennen wir nicht.');
    const orte = [...new Set(termine.map((t) => t.ort))].filter((o) => ORT_KOORD[o]);
    const list = orte.map((o) => ({
      ort: o, km: Math.round(kmZwischen(k, ORT_KOORD[o])),
      next: termine.filter((t) => t.ort === o).sort((a, b) => a.datum.localeCompare(b.datum))[0],
    })).sort((a, b) => a.km - b.km).slice(0, 3);
    const rb = { ort: 'Rietberg Hof', km: Math.round(kmZwischen(k, ORT_KOORD['Rietberg Hof'])) };
    setRes({ list, rb, best: !list.length || rb.km <= list[0].km ? 'Rietberg Hof' : list[0].ort });
  }
  const pick = (r) => onPick({ ...r, plz });
  return (
    <div className="plzfinder">
      <div className="plzrow">
        <label>Abholort in deiner Nähe finden
          <input inputMode="numeric" maxLength={5} placeholder="Deine PLZ, z. B. 37269" value={plz}
            onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyDown={(e) => e.key === 'Enter' && suche(e)} />
        </label>
        <button type="button" className="btn primary" onClick={suche}>Suchen</button>
      </div>
      {msg && <p className="hint">{msg}</p>}
      {res && (
        <div className="plzres">
          {res.list.map((r) => (
            <button type="button" key={r.ort} className={'plzhit' + (res.best === r.ort ? ' best' : '')} onClick={() => pick(r)}>
              <span className="pn">{res.best === r.ort && <em>Am nächsten · </em>}{r.ort}</span>
              <span className="pm">ca. {r.km} km{r.next ? ` · nächster Termin ${fmtDate(r.next.datum)}${r.next.zeit ? ', ' + r.next.zeit + ' Uhr' : ''}` : ''}</span>
            </button>
          ))}
          <button type="button" className={'plzhit' + (res.best === 'Rietberg Hof' ? ' best' : '')} onClick={() => pick(res.rb)}>
            <span className="pn">{res.best === 'Rietberg Hof' && <em>Am nächsten · </em>}Abholung in Rietberg ab Hof</span>
            <span className="pm">ca. {res.rb.km} km · jeden Tag nach Absprache</span>
          </button>
          <p className="hint">Antippen zum Auswählen. Entfernungen sind ungefähre Straßen-km.</p>
        </div>
      )}
    </div>
  );
}

function Variant({ label, price, value, onChange }) {
  return (
    <div className="variant">
      <div className="vlabel">{label && <b>{label} </b>}<span>{price}</span></div>
      <div className="stepper">
        <button type="button" onClick={() => onChange((value || 0) - 1)} aria-label={'weniger ' + label}>−</button>
        <input inputMode="numeric" value={value || ''} placeholder="0" aria-label={'Anzahl ' + label}
          onChange={(e) => onChange(parseInt(e.target.value.replace(/\D/g, ''), 10))} />
        <button type="button" onClick={() => onChange((value || 0) + 1)} aria-label={'mehr ' + label}>+</button>
      </div>
    </div>
  );
}

function Page({ children }) {
  return (
    <div className="shop">
      <header className="hero">
        <img src="./logo.png" alt="" />
        <div>
          <h1>Geflügelverkauf <em>Holle</em></h1>
          <p>Hühner, Enten &amp; mehr vorbestellen – Abholung am Haltepunkt oder in Rietberg</p>
        </div>
        {(meinToken() || window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) && <a className="mein-knopf" href="./#/mein">Mein Holle</a>}
      </header>
      <main>{children}</main>
      <footer>Geflügelverkauf Holle · 33397 Rietberg · @gefluegelholle</footer>
    </div>
  );
}

function Warteliste({ p }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', telefon: '', anzahl: '' });
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  if (ok) return <div className="wl ok">✓ Du stehst auf der Warteliste. Wir melden uns per WhatsApp, sobald {p.name} wieder da ist.</div>;
  if (!open) return <button type="button" className="btn ghost small" onClick={() => setOpen(true)}>Auf die Warteliste</button>;
  async function senden() {
    setMsg('');
    setBusy(true);
    const { error } = await supabase.rpc('join_waitlist', { p: { product_id: p.id, name: f.name, telefon: f.telefon, anzahl: f.anzahl || 1 } });
    setBusy(false);
    if (error) setMsg(error.message || 'Hat nicht geklappt.'); else setOk(true);
  }
  return (
    <div className="wl">
      <div className="wlrow">
        <input placeholder="Dein Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
        <input placeholder="Handynummer" inputMode="tel" value={f.telefon} onChange={(e) => setF({ ...f, telefon: e.target.value })} autoComplete="tel" />
        <input placeholder="Anzahl" inputMode="numeric" value={f.anzahl} onChange={(e) => setF({ ...f, anzahl: e.target.value.replace(/\D/g, '') })} />
      </div>
      <p className="hint">Wir nutzen deine Nummer nur, um dir Bescheid zu geben (<a href={DATENSCHUTZ_URL} target="_blank" rel="noreferrer">Datenschutz</a>).</p>
      {msg && <div className="alert">{msg}</div>}
      <button type="button" className="btn primary small" disabled={busy} onClick={senden}>{busy ? 'Sende …' : 'Eintragen'}</button>
    </div>
  );
}

const STATUS_TEXT = { neu: 'Eingegangen – wir bestätigen sie bald', offen: 'Bestätigt', abgeholt: 'Abgeholt – danke!', storniert: 'Abgesagt' };
export function MeineBestellung({ id }) {
  const [o, setO] = useState(undefined);
  const [msg, setMsg] = useState('');
  const [grund, setGrund] = useState('');
  const [frage, setFrage] = useState(false);
  const laden = () => supabase.rpc('get_my_order', { p_id: id }).then(({ data, error }) => setO(error ? null : data));
  const [mein, setMein] = useState('');
  useEffect(() => { laden(); supabase.rpc('mein_link_zur_bestellung', { p_id: id }).then(({ data }) => { if (data) { setMein(data); setMeinToken(data); } }); }, [id]);
  async function absagen() {
    setMsg('');
    const { error } = await supabase.rpc('cancel_my_order', { p_id: id, p_grund: grund });
    if (error) setMsg(error.message); else { setFrage(false); laden(); }
  }
  const t = o && TOURS.find((x) => x.id === o.tour);
  const st = t && t.stops.find((s) => s[1] === o.ort);
  const pos = (o?.positionen || []).filter((p) => p.tier && +p.anzahl);
  const summe = pos.reduce((a, p) => a + (+p.anzahl || 0) * (+p.preis || 0), 0);
  return (
    <Page>
      {o === undefined && <div className="card">Lade Bestellung …</div>}
      {o === null && <div className="card"><h2>Bestellung nicht gefunden</h2><p>Bitte prüfe den Link oder schreib uns per <a href={`https://wa.me/${SHOP_WA}`}>WhatsApp</a>.</p></div>}
      {o && (
        <div className="card">
          <h2>Hallo {o.vorname}, deine Bestellung {o.nr}</h2>
          <p className={'status s-' + o.status}>{STATUS_TEXT[o.status] || o.status}</p>
          <p><b>Abholung:</b> {o.tour === 'R' ? 'Rietberg' : o.ort}, {fmtDate(o.datum)}{st && st[0] ? `, ${st[0]} Uhr` : ''}</p>
          <ul className="poslist">{pos.map((p, i) => <li key={i}>{p.anzahl} × {p.tier}{p.preis ? ` à ${fmtPrice(p.preis)}` : ''}</li>)}</ul>
          {summe > 0 && <p><b>Gesamt: {fmtPrice(summe)}</b> · Bezahlung bei Abholung</p>}
          {msg && <div className="alert">{msg}</div>}
          {o.stornierbar && !frage && <button className="btn ghost" onClick={() => setFrage(true)}>Bestellung absagen</button>}
          {frage && (
            <div className="wl">
              <p>Wirklich absagen? Du kannst uns gern kurz den Grund nennen.</p>
              <input placeholder="Grund (freiwillig)" value={grund} onChange={(e) => setGrund(e.target.value)} />
              <div className="btnrow">
                <button className="btn warn" onClick={absagen}>Ja, absagen</button>
                <button className="btn ghost" onClick={() => setFrage(false)}>Nein, behalten</button>
              </div>
            </div>
          )}
          {!o.stornierbar && (o.status === 'neu' || o.status === 'offen') && <p className="hint">Am Abholtag bitte kurz anrufen ({SHOP_PHONE}) oder per WhatsApp absagen.</p>}
          {o.stempelkarte && <Stempelkarte k={o.stempelkarte} />}
          {mein && <a className="btn primary" href={`./#/k/${mein}`}>🐔 Mein Holle öffnen – deine Hühner, News &amp; Stempel</a>}
          <a className="btn wa" href={`https://wa.me/${SHOP_WA}?text=${encodeURIComponent(`Hallo, Frage zu meiner Bestellung ${o.nr}: `)}`}>Frage per WhatsApp</a>
          <a className="btn ghost" href="./">Neue Bestellung</a>
        </div>
      )}
    </Page>
  );
}

export function Stempelkarte({ k }) {
  const voll = k.frei > 0;
  const an = voll && k.rest === 0 ? 10 : k.rest;
  return (
    <div className="stk">
      <div className="stk-kopf"><b>Deine Holle-Stempelkarte</b><span>{k.stempel} Stempel</span></div>
      <div className="stk-felder">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={'stk-feld' + (i < an ? ' an' : '') + (i === 9 ? ' gratis' : '')}>{i < an ? '🐔' : i === 9 ? 'GRATIS' : ''}</span>
        ))}
      </div>
      <p className="stk-text">
        {voll
          ? <>🎉 <b>Du hast {k.frei > 1 ? `${k.frei} Gratis-Hühner` : 'ein Gratis-Huhn'} gut!</b> Sag bei der nächsten Abholung einfach Bescheid.</>
          : <>Noch <b>{10 - k.rest}</b> {10 - k.rest === 1 ? 'Stempel' : 'Stempel'} bis zu deinem Gratis-Huhn (bis 30 €).</>}
      </p>
      <p className="hint">1 Rassehenne = 1 Stempel · 2 Hybridhennen = 1 Stempel. Gezählt wird bei Abholung.</p>
    </div>
  );
}
