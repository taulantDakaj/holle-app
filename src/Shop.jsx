import { useEffect, useMemo, useState } from 'react';
import { supabase, fmtDate, fmtPrice, todayISO, groupBy, SHOP_PHONE, SHOP_WA, DATENSCHUTZ_URL } from './lib.js';

export default function Shop() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState({});
  const [pickupType, setPickupType] = useState('tour');
  const [tripId, setTripId] = useState('');
  const [tripStopId, setTripStopId] = useState('');
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
  const trip = data?.trips?.find((t) => String(t.id) === String(tripId));
  const chosen = (data?.products || []).filter((p) => qty[p.id] > 0);
  const total = chosen.reduce((s, p) => s + qty[p.id], 0);

  const setQ = (id, v) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(999, v || 0)) }));
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (form.website) return; // Bot
    if (!chosen.length) return setErr('Bitte wähle mindestens ein Tier aus.');
    if (pickupType === 'tour' && !tripStopId) return setErr('Bitte wähle Termin und Haltepunkt.');
    if (pickupType === 'rietberg' && !pickupDate) return setErr('Bitte gib deinen Wunschtermin an.');
    if (!consent) return setErr('Bitte bestätige die Datenschutzhinweise.');
    setSending(true);
    const payload = {
      customer_name: form.customer_name,
      phone: form.phone,
      city: form.city,
      customer_note: form.customer_note,
      pickup_type: pickupType,
      trip_stop_id: pickupType === 'tour' ? tripStopId : null,
      pickup_date: pickupType === 'rietberg' ? pickupDate : null,
      items: chosen.map((p) => ({ product_id: p.id, qty: qty[p.id] })),
    };
    const { data: res, error } = await supabase.rpc('submit_order', { p: payload });
    setSending(false);
    if (error) return setErr(error.message || 'Bestellung konnte nicht gesendet werden.');
    const stop = trip?.stops.find((s) => String(s.trip_stop_id) === String(tripStopId));
    setDone({
      ...res,
      summary: chosen.map((p) => `${qty[p.id]}× ${p.name}`).join('\n'),
      where: pickupType === 'tour'
        ? `${stop?.name}, ${fmtDate(trip?.date)}${stop?.time ? ', ' + stop.time + ' Uhr' : ''}`
        : `Rietberg, Wunschtermin ${fmtDate(pickupDate)}`,
      name: form.customer_name,
    });
    window.scrollTo(0, 0);
  }

  if (done) {
    const wa = `Hallo, ich habe gerade über die App bestellt (${done.order_no}):\n${done.summary}\nAbholung: ${done.where}\n${done.name}`;
    return (
      <Page>
        <div className="card success">
          <div className="big">✓</div>
          <h2>Danke, deine Bestellung ist angekommen!</h2>
          <p>Bestellnummer: <b>{done.order_no}</b></p>
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
            {[...byCat.entries()].map(([cat, items]) => (
              <details key={cat} className="cat" open={cat === 'Legehybriden'}>
                <summary>
                  {cat}
                  {items.some((p) => qty[p.id] > 0) && (
                    <span className="pill">{items.reduce((s, p) => s + (qty[p.id] || 0), 0)}</span>
                  )}
                </summary>
                {items.map((p) => (
                  <div className="prod" key={p.id}>
                    <div className="pinfo">
                      <div className="pname">{p.name}</div>
                      <div className="pmeta">
                        {p.price ? fmtPrice(p.price) + ' / Stück' : p.price_note || 'Preis auf Anfrage'}
                        {p.price && p.price_note ? ' · ' + p.price_note : ''}
                        {!p.price && p.note ? ' · ' + p.note : p.price && p.note ? ' · ' + p.note : ''}
                      </div>
                    </div>
                    <div className="stepper">
                      <button type="button" onClick={() => setQ(p.id, (qty[p.id] || 0) - 1)} aria-label="weniger">−</button>
                      <input inputMode="numeric" value={qty[p.id] || ''} placeholder="0"
                        onChange={(e) => setQ(p.id, parseInt(e.target.value.replace(/\D/g, ''), 10))} />
                      <button type="button" onClick={() => setQ(p.id, (qty[p.id] || 0) + 1)} aria-label="mehr">+</button>
                    </div>
                  </div>
                ))}
              </details>
            ))}
          </section>

          <section className="card">
            <h2><span className="num">2</span> Abholung</h2>
            <div className="seg">
              <button type="button" className={pickupType === 'tour' ? 'on' : ''} onClick={() => setPickupType('tour')}>An einem Haltepunkt</button>
              <button type="button" className={pickupType === 'rietberg' ? 'on' : ''} onClick={() => setPickupType('rietberg')}>In Rietberg</button>
            </div>
            {pickupType === 'tour' ? (
              <>
                <label>Termin
                  <select value={tripId} onChange={(e) => { setTripId(e.target.value); setTripStopId(''); }}>
                    <option value="">Bitte wählen …</option>
                    {data.trips.map((t) => (
                      <option key={t.id} value={t.id}>{fmtDate(t.date)} – {t.stops.map((s) => s.name).join(', ')}</option>
                    ))}
                  </select>
                </label>
                {data.trips.length === 0 && <p className="hint">Gerade sind keine Touren geplant. Wähle „In Rietberg“ oder schreib uns per WhatsApp.</p>}
                {trip && (
                  <div className="stops">
                    {trip.stops.map((s) => (
                      <label key={s.trip_stop_id} className={'radio' + (String(tripStopId) === String(s.trip_stop_id) ? ' on' : '')}>
                        <input type="radio" name="stop" value={s.trip_stop_id}
                          checked={String(tripStopId) === String(s.trip_stop_id)}
                          onChange={(e) => setTripStopId(e.target.value)} />
                        <span>{s.name}</span>
                        <small>{s.time ? s.time + ' Uhr' : 'Uhrzeit folgt'}</small>
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

function Page({ children }) {
  return (
    <div className="shop">
      <header className="hero">
        <img src="./icon.svg" alt="" />
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
