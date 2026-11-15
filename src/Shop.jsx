import { useEffect, useMemo, useState } from 'react';
import { supabase, fmtDate, fmtPrice, todayISO, groupBy, SHOP_PHONE, SHOP_WA, DATENSCHUTZ_URL } from './lib.js';
import { TOURS, ORT_KOORD } from './tours.js';

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

  useEffect(() => {
    const timer = setTimeout(() => setErr('Die Bestellseite lädt gerade nicht. Bitte später nochmal versuchen oder per WhatsApp bestellen.'), 12000);
    supabase.rpc('get_shop_data').then(({ data, error }) => {
      clearTimeout(timer);
      if (error) setErr('Die Bestellseite lädt gerade nicht. Bitte per WhatsApp bestellen.');
      else { setData(data); setErr(''); }
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

  const setQ = (id, v) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(999, v || 0)) }));
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
              <details key={cat} className="cat" open={ci === 0}>
                <summary>
                  {cat}
                  {catCount(items) > 0 && <span className="pill">{catCount(items)}</span>}
                </summary>
                {items.map((p) => (
                  <div className="prod" key={p.id}>
                    <div className="pinfo">
                      <div className="pname">{p.name}</div>
                      {p.note && <div className="pmeta">{p.note}</div>}
                    </div>
                    <div className="variants">
                      <Variant label={p.price_hahn ? 'Henne' : ''}
                        price={p.price ? fmtPrice(p.price) : p.price_note || 'auf Anfrage'}
                        value={qty[p.id]} onChange={(v) => setQ(p.id, v)} />
                      {p.price_hahn && (
                        <Variant label="Hahn" price={fmtPrice(p.price_hahn)}
                          value={qty[p.id + 'h']} onChange={(v) => setQ(p.id + 'h', v)} />
                      )}
                    </div>
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
      </header>
      <main>{children}</main>
      <footer>Geflügelverkauf Holle · 33397 Rietberg · @gefluegelholle</footer>
    </div>
  );
}
