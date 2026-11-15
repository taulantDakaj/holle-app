import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  supabase, fmtDate, fmtDateTime, fmtPrice, todayISO, groupBy, waLink,
  STATUS, SOURCES, itemsText, pickupText, confirmText,
} from './lib.js';

const ORDER_SELECT =
  '*, order_items(*), trip_stops(id, stop_time, stop_id, trip_id, stops(name, address), trips(id, trip_date, name))';

export default function Admin() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  if (session === undefined) return <div className="admin"><div className="card">Lade …</div></div>;
  if (!session) return <Login />;
  return <Dashboard session={session} />;
}

function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function go(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr('Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.');
  }
  return (
    <div className="admin login">
      <form className="card" onSubmit={go}>
        <img src="./icon.svg" alt="" className="logo" />
        <h2>Holle · Verwaltung</h2>
        <label>E-Mail<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Passwort<input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
        {err && <div className="alert">{err}</div>}
        <button className="btn primary" disabled={busy}>{busy ? '…' : 'Anmelden'}</button>
        <a className="small" href="#/">Zur Kunden-Bestellseite</a>
      </form>
    </div>
  );
}

function Dashboard({ session }) {
  const [tab, setTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [stops, setStops] = useState([]);
  const [trips, setTrips] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState(null); // order object or {} for new

  const load = useCallback(async () => {
    const [p, s, t, o] = await Promise.all([
      supabase.from('products').select('*').order('sort').order('name'),
      supabase.from('stops').select('*').order('sort').order('name'),
      supabase.from('trips').select('*, trip_stops(*, stops(name, address))').order('trip_date'),
      supabase.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false }).limit(2000),
    ]);
    const e = p.error || s.error || t.error || o.error;
    if (e) setErr(e.message);
    setProducts(p.data || []); setStops(s.data || []);
    setTrips((t.data || []).map((x) => ({ ...x, trip_stops: [...x.trip_stops].sort((a, b) => a.sort - b.sort) })));
    setOrders(o.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase.channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const newCount = orders.filter((o) => o.status === 'neu').length;
  const ctx = { products, stops, trips, orders, reload: load, setEditing };

  return (
    <div className="admin">
      <header className="topbar">
        <b>Holle</b>
        <nav>
          <button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>
            Bestellungen{newCount > 0 && <span className="badge">{newCount}</span>}
          </button>
          <button className={tab === 'plan' ? 'on' : ''} onClick={() => setTab('plan')}>Fahrt-Plan</button>
          <button className={tab === 'products' ? 'on' : ''} onClick={() => setTab('products')}>Sortiment</button>
          <button className={tab === 'trips' ? 'on' : ''} onClick={() => setTab('trips')}>Fahrten</button>
        </nav>
        <button className="link" onClick={() => supabase.auth.signOut()} title={session.user.email}>Abmelden</button>
      </header>
      <main>
        {err && (
          <div className="alert">
            {err.includes('permission') || err.includes('policy')
              ? 'Kein Zugriff: Deine E-Mail ist noch nicht als Mitarbeiter eingetragen.'
              : err}
          </div>
        )}
        {loading ? <div className="card">Lade Daten …</div> : (
          <>
            {tab === 'orders' && <Orders {...ctx} />}
            {tab === 'plan' && <TripPlan {...ctx} />}
            {tab === 'products' && <Products {...ctx} />}
            {tab === 'trips' && <Trips {...ctx} />}
          </>
        )}
      </main>
      {tab === 'orders' && !editing && (
        <button className="fab" onClick={() => setEditing({})} aria-label="Neue Bestellung">＋</button>
      )}
      {editing && <OrderForm order={editing} {...ctx} onClose={() => setEditing(null)} user={session.user.email} />}
    </div>
  );
}

/* ---------------------------------------------------------------- Bestellungen */
function orderDate(o) {
  return o.pickup_type === 'rietberg' ? o.pickup_date : o.trip_stops?.trips?.trip_date;
}

function Orders({ orders, trips, reload, setEditing }) {
  const [filter, setFilter] = useState('offen');
  const [tripF, setTripF] = useState('');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    let l = orders;
    if (filter === 'offen') l = l.filter((o) => o.status === 'neu' || o.status === 'bestaetigt');
    else if (filter !== 'alle') l = l.filter((o) => o.status === filter);
    if (tripF === 'rietberg') l = l.filter((o) => o.pickup_type === 'rietberg');
    else if (tripF) l = l.filter((o) => String(o.trip_stops?.trip_id) === tripF);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      l = l.filter((o) =>
        [o.customer_name, o.phone, o.city, o.order_no, o.trip_stops?.stops?.name, itemsText(o.order_items)]
          .join(' ').toLowerCase().includes(s));
    }
    // Neue zuerst, dann nach Abholdatum
    return [...l].sort((a, b) =>
      (a.status === 'neu' ? 0 : 1) - (b.status === 'neu' ? 0 : 1) ||
      String(orderDate(a) || '9').localeCompare(String(orderDate(b) || '9')));
  }, [orders, filter, tripF, q]);

  const today = todayISO();
  const upcoming = trips.filter((t) => t.trip_date >= today).slice(0, 30);

  return (
    <>
      <div className="filters">
        <div className="chips">
          {[['offen', 'Offen'], ['neu', 'Neu'], ['bestaetigt', 'Bestätigt'], ['abgeholt', 'Abgeholt'], ['storniert', 'Storniert'], ['alle', 'Alle']].map(([k, l]) => (
            <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <div className="row">
          <select value={tripF} onChange={(e) => setTripF(e.target.value)}>
            <option value="">Alle Fahrten</option>
            <option value="rietberg">Abholung Rietberg</option>
            {upcoming.map((t) => <option key={t.id} value={t.id}>{fmtDate(t.trip_date)} · {t.name}</option>)}
          </select>
          <input placeholder="Suchen …" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {list.length === 0 && <div className="card muted">Keine Bestellungen.</div>}
      {list.map((o) => <OrderCard key={o.id} o={o} reload={reload} onEdit={() => setEditing(o)} />)}
    </>
  );
}

function OrderCard({ o, reload, onEdit }) {
  const [busy, setBusy] = useState(false);
  const st = STATUS[o.status];
  async function setStatus(status) {
    setBusy(true);
    const { error } = await supabase.from('orders').update({ status }).eq('id', o.id);
    setBusy(false);
    if (error) alert(error.message); else reload();
  }
  const total = (o.order_items || []).reduce((s, i) => s + (i.unit_price ? i.qty * i.unit_price : 0), 0);
  return (
    <div className={'card order ' + st.cls}>
      <div className="ohead">
        <span className={'status ' + st.cls}>{st.label}</span>
        <span className="muted small">{o.order_no} · {SOURCES[o.source]} · {fmtDateTime(o.created_at)}</span>
      </div>
      <div className="oname">{o.customer_name}{o.city && <span className="muted"> · {o.city}</span>}</div>
      <div className="opick">📍 {pickupText(o)}</div>
      <ul className="oitems">
        {(o.order_items || []).map((i) => (
          <li key={i.id}><b>{i.qty}×</b> {i.product_name}{i.unit_price ? <span className="muted"> à {fmtPrice(i.unit_price)}</span> : ''}</li>
        ))}
      </ul>
      {total > 0 && <div className="muted small">Summe bekannter Preise: {fmtPrice(total)}</div>}
      {o.customer_note && <div className="note">💬 {o.customer_note}</div>}
      {o.internal_note && <div className="note internal">🔒 {o.internal_note}</div>}
      <div className="actions">
        <a className="btn sm" href={`tel:${o.phone.replace(/\s/g, '')}`}>📞 {o.phone}</a>
        <a className="btn sm wa" href={waLink(o.phone, '')} target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
      <div className="actions">
        {o.status === 'neu' && (
          <a className="btn sm primary" href={waLink(o.phone, confirmText(o))} target="_blank" rel="noreferrer"
            onClick={() => setStatus('bestaetigt')}>✓ Bestätigen + WhatsApp</a>
        )}
        {o.status === 'neu' && <button className="btn sm" disabled={busy} onClick={() => setStatus('bestaetigt')}>✓ Nur bestätigen</button>}
        {(o.status === 'neu' || o.status === 'bestaetigt') && (
          <button className="btn sm ok" disabled={busy} onClick={() => setStatus('abgeholt')}>Abgeholt</button>
        )}
        <button className="btn sm ghost" onClick={onEdit}>Bearbeiten</button>
        {o.status !== 'storniert' && o.status !== 'abgeholt' && (
          <button className="btn sm danger" disabled={busy} onClick={() => confirm('Bestellung stornieren?') && setStatus('storniert')}>Stornieren</button>
        )}
        {(o.status === 'storniert' || o.status === 'abgeholt') && (
          <button className="btn sm ghost" disabled={busy} onClick={() => setStatus('bestaetigt')}>Wieder öffnen</button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Bestellung anlegen/bearbeiten */
function OrderForm({ order, products, trips, reload, onClose, user }) {
  const isNew = !order.id;
  const today = todayISO();
  const [f, setF] = useState({
    source: order.source || 'whatsapp',
    status: order.status || 'bestaetigt',
    customer_name: order.customer_name || '',
    phone: order.phone || '',
    city: order.city || '',
    pickup_type: order.pickup_type || 'tour',
    trip_id: order.trip_stops?.trip_id ? String(order.trip_stops.trip_id) : '',
    trip_stop_id: order.trip_stop_id ? String(order.trip_stop_id) : '',
    pickup_date: order.pickup_date || '',
    customer_note: order.customer_note || '',
    internal_note: order.internal_note || '',
  });
  const [items, setItems] = useState(
    order.order_items?.length
      ? order.order_items.map((i) => ({ product_id: i.product_id ? String(i.product_id) : '', name: i.product_name, qty: i.qty, unit_price: i.unit_price ?? '' }))
      : [{ product_id: '', name: '', qty: 1, unit_price: '' }]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const tripList = trips.filter((t) => t.trip_date >= today || String(t.id) === f.trip_id);
  const trip = trips.find((t) => String(t.id) === f.trip_id);
  const byCat = groupBy(products, (p) => p.category);

  function setItem(i, patch) {
    setItems((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }
  function pickProduct(i, id) {
    const p = products.find((x) => String(x.id) === id);
    setItem(i, { product_id: id, name: p?.name || '', unit_price: p?.price ?? '' });
  }

  async function save(e) {
    e.preventDefault();
    setErr('');
    const its = items.filter((i) => i.name && i.qty > 0);
    if (!f.customer_name.trim() || !f.phone.trim()) return setErr('Name und Telefon fehlen.');
    if (!its.length) return setErr('Mindestens ein Tier eintragen.');
    if (f.pickup_type === 'tour' && !f.trip_stop_id) return setErr('Haltepunkt wählen.');
    if (f.pickup_type === 'rietberg' && !f.pickup_date) return setErr('Datum für Rietberg wählen.');
    setBusy(true);
    const row = {
      source: f.source, status: f.status,
      customer_name: f.customer_name.trim(), phone: f.phone.trim(), city: f.city.trim() || null,
      pickup_type: f.pickup_type,
      trip_stop_id: f.pickup_type === 'tour' ? Number(f.trip_stop_id) : null,
      pickup_date: f.pickup_type === 'tour' ? trip?.trip_date : f.pickup_date,
      customer_note: f.customer_note.trim() || null, internal_note: f.internal_note.trim() || null,
    };
    let id = order.id;
    if (isNew) {
      const { data, error } = await supabase.from('orders').insert({ ...row, created_by: user }).select('id').single();
      if (error) { setBusy(false); return setErr(error.message); }
      id = data.id;
    } else {
      const { error } = await supabase.from('orders').update(row).eq('id', id);
      if (error) { setBusy(false); return setErr(error.message); }
      const d = await supabase.from('order_items').delete().eq('order_id', id);
      if (d.error) { setBusy(false); return setErr(d.error.message); }
    }
    const { error } = await supabase.from('order_items').insert(its.map((i) => {
      const p = products.find((x) => String(x.id) === i.product_id);
      return {
        order_id: id, product_id: p ? p.id : null, product_name: i.name, category: p?.category || null,
        qty: Number(i.qty), unit_price: i.unit_price === '' ? null : Number(i.unit_price),
      };
    }));
    setBusy(false);
    if (error) return setErr(error.message);
    await reload();
    onClose();
  }

  async function remove() {
    if (!confirm('Bestellung endgültig löschen? (Besser: stornieren)')) return;
    const { error } = await supabase.from('orders').delete().eq('id', order.id);
    if (error) return setErr(error.message);
    await reload(); onClose();
  }

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="sheet-body" onSubmit={save}>
        <div className="sheet-head">
          <h2>{isNew ? 'Neue Bestellung' : `Bestellung ${order.order_no}`}</h2>
          <button type="button" className="link" onClick={onClose}>Schließen</button>
        </div>
        <div className="row">
          <label>Quelle<select value={f.source} onChange={set('source')}>
            {Object.entries(SOURCES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select></label>
          <label>Status<select value={f.status} onChange={set('status')}>
            {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select></label>
        </div>
        <label>Name<input value={f.customer_name} onChange={set('customer_name')} /></label>
        <div className="row">
          <label>Telefon<input type="tel" value={f.phone} onChange={set('phone')} /></label>
          <label>Wohnort<input value={f.city} onChange={set('city')} /></label>
        </div>

        <h3>Tiere</h3>
        {items.map((it, i) => (
          <div className="itemrow" key={i}>
            <select value={it.product_id} onChange={(e) => pickProduct(i, e.target.value)}>
              <option value="">{it.name && !it.product_id ? it.name : 'Tier wählen …'}</option>
              {[...byCat.entries()].map(([cat, ps]) => (
                <optgroup key={cat} label={cat}>
                  {ps.map((p) => <option key={p.id} value={p.id}>{p.name}{p.available ? '' : ' (nicht verfügbar)'}</option>)}
                </optgroup>
              ))}
            </select>
            <input className="qty" inputMode="numeric" value={it.qty} onChange={(e) => setItem(i, { qty: e.target.value.replace(/\D/g, '') })} />
            <input className="price" inputMode="decimal" placeholder="€/St." value={it.unit_price}
              onChange={(e) => setItem(i, { unit_price: e.target.value.replace(',', '.').replace(/[^0-9.]/g, '') })} />
            <button type="button" className="x" onClick={() => setItems((l) => l.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <button type="button" className="btn sm ghost" onClick={() => setItems((l) => [...l, { product_id: '', name: '', qty: 1, unit_price: '' }])}>+ weiteres Tier</button>

        <h3>Abholung</h3>
        <div className="seg">
          <button type="button" className={f.pickup_type === 'tour' ? 'on' : ''} onClick={() => setF((x) => ({ ...x, pickup_type: 'tour' }))}>Haltepunkt</button>
          <button type="button" className={f.pickup_type === 'rietberg' ? 'on' : ''} onClick={() => setF((x) => ({ ...x, pickup_type: 'rietberg' }))}>Rietberg</button>
        </div>
        {f.pickup_type === 'tour' ? (
          <div className="row">
            <label>Fahrt<select value={f.trip_id} onChange={(e) => setF((x) => ({ ...x, trip_id: e.target.value, trip_stop_id: '' }))}>
              <option value="">wählen …</option>
              {tripList.map((t) => <option key={t.id} value={t.id}>{fmtDate(t.trip_date)} · {t.name}</option>)}
            </select></label>
            <label>Haltepunkt<select value={f.trip_stop_id} onChange={set('trip_stop_id')} disabled={!trip}>
              <option value="">wählen …</option>
              {trip?.trip_stops.map((ts) => <option key={ts.id} value={ts.id}>{ts.stops?.name}{ts.stop_time ? ' · ' + ts.stop_time : ''}</option>)}
            </select></label>
          </div>
        ) : (
          <label>Datum<input type="date" value={f.pickup_date} onChange={set('pickup_date')} /></label>
        )}
        <label>Anmerkung Kunde<textarea rows="2" value={f.customer_note} onChange={set('customer_note')} /></label>
        <label>Interne Notiz<textarea rows="2" value={f.internal_note} onChange={set('internal_note')} /></label>
        {err && <div className="alert">{err}</div>}
        <div className="actions">
          <button className="btn primary" disabled={busy}>{busy ? 'Speichere …' : 'Speichern'}</button>
          {!isNew && <button type="button" className="btn ghost danger" onClick={remove}>Löschen</button>}
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- Fahrt-Plan (Bestell- & Lade-Plan) */
function TripPlan({ trips, orders }) {
  const today = todayISO();
  const upcoming = trips.filter((t) => t.trip_date >= today);
  const past = trips.filter((t) => t.trip_date < today).reverse().slice(0, 20);
  const [sel, setSel] = useState(upcoming[0] ? String(upcoming[0].id) : 'rietberg');

  const active = orders.filter((o) => o.status !== 'storniert');
  const isR = sel === 'rietberg';
  const trip = trips.find((t) => String(t.id) === sel);
  const tripOrders = isR
    ? active.filter((o) => o.pickup_type === 'rietberg' && o.pickup_date >= today)
    : active.filter((o) => String(o.trip_stops?.trip_id) === sel);

  const totals = useMemo(() => {
    const m = new Map();
    for (const o of tripOrders) for (const i of o.order_items || []) {
      const k = i.product_name;
      const x = m.get(k) || { name: k, category: i.category || 'Sonstiges', qty: 0, open: 0 };
      x.qty += i.qty;
      if (o.status !== 'abgeholt') x.open += i.qty;
      m.set(k, x);
    }
    return [...m.values()].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }, [tripOrders]);
  const sum = totals.reduce((s, x) => s + x.qty, 0);

  const groups = isR
    ? [...groupBy([...tripOrders].sort((a, b) => a.pickup_date.localeCompare(b.pickup_date)), (o) => fmtDate(o.pickup_date)).entries()]
        .map(([k, os]) => ({ key: k, title: k, orders: os }))
    : (trip?.trip_stops || []).map((ts) => ({
        key: ts.id, title: `${ts.stop_time ? ts.stop_time + ' · ' : ''}${ts.stops?.name}`,
        sub: ts.stops?.address, orders: tripOrders.filter((o) => o.trip_stop_id === ts.id),
      }));

  return (
    <>
      <div className="filters noprint">
        <select value={sel} onChange={(e) => setSel(e.target.value)}>
          <optgroup label="Kommende Fahrten">
            {upcoming.map((t) => <option key={t.id} value={t.id}>{fmtDate(t.trip_date)} · {t.name}</option>)}
          </optgroup>
          <option value="rietberg">Abholungen Rietberg</option>
          <optgroup label="Vergangene Fahrten">
            {past.map((t) => <option key={t.id} value={t.id}>{fmtDate(t.trip_date)} · {t.name}</option>)}
          </optgroup>
        </select>
        <button className="btn sm ghost" onClick={() => window.print()}>Drucken</button>
      </div>

      <div className="card">
        <h2>{isR ? 'Abholungen Rietberg' : `${fmtDate(trip?.trip_date)} · ${trip?.name}`}</h2>
        <p className="muted">{tripOrders.length} Bestellungen · {sum} Tiere</p>
        <h3>Lade-Plan (alle Haltepunkte zusammen)</h3>
        {totals.length === 0 ? <p className="muted">Noch keine Bestellungen.</p> : (
          <table className="tbl">
            <thead><tr><th>Tier</th><th className="r">Anzahl</th><th className="r">noch offen</th></tr></thead>
            <tbody>
              {totals.map((x) => <tr key={x.name}><td>{x.name}</td><td className="r"><b>{x.qty}</b></td><td className="r">{x.open}</td></tr>)}
              <tr className="sum"><td>Gesamt</td><td className="r">{sum}</td><td className="r">{totals.reduce((s, x) => s + x.open, 0)}</td></tr>
            </tbody>
          </table>
        )}
      </div>

      {groups.map((g) => {
        const t = new Map();
        g.orders.forEach((o) => o.order_items.forEach((i) => t.set(i.product_name, (t.get(i.product_name) || 0) + i.qty)));
        return (
          <div className="card stopcard" key={g.key}>
            <h3>{g.title} <span className="muted">· {g.orders.length} Best.</span></h3>
            {g.sub && <div className="muted small">{g.sub}</div>}
            {t.size > 0 && <div className="stopsum">{[...t.entries()].map(([n, q]) => `${q}× ${n}`).join(' · ')}</div>}
            {g.orders.map((o) => (
              <div className="pl" key={o.id}>
                <span className={'dot ' + STATUS[o.status].cls} title={STATUS[o.status].label} />
                <div>
                  <b>{o.customer_name}</b> <a href={`tel:${o.phone.replace(/\s/g, '')}`}>{o.phone}</a>
                  <div>{itemsText(o.order_items)}</div>
                  {o.customer_note && <div className="muted small">💬 {o.customer_note}</div>}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

/* ---------------------------------------------------------------- Sortiment */
function Products({ products, reload }) {
  const [nf, setNf] = useState({ category: 'Legehybriden', name: '', price: '' });
  const cats = [...new Set(products.map((p) => p.category))];
  async function patch(id, data) {
    const { error } = await supabase.from('products').update(data).eq('id', id);
    if (error) alert(error.message); else reload();
  }
  async function add(e) {
    e.preventDefault();
    if (!nf.name.trim()) return;
    const sort = Math.max(0, ...products.filter((p) => p.category === nf.category).map((p) => p.sort)) + 1;
    const { error } = await supabase.from('products').insert({
      category: nf.category.trim(), name: nf.name.trim(), price: nf.price ? Number(nf.price.replace(',', '.')) : null, sort,
    });
    if (error) return alert(error.message);
    setNf({ ...nf, name: '', price: '' }); reload();
  }
  return (
    <>
      <p className="muted pad">Nur Tiere mit grünem Schalter sehen Kunden in der Bestell-App. Preis leer lassen = „Preis auf Anfrage“.</p>
      {[...groupBy(products, (p) => p.category).entries()].map(([cat, ps]) => (
        <div className="card" key={cat}>
          <h3>{cat}</h3>
          {ps.map((p) => (
            <div className="prow" key={p.id}>
              <label className="switch">
                <input type="checkbox" checked={p.available} onChange={(e) => patch(p.id, { available: e.target.checked })} />
                <span />
              </label>
              <div className={'pn' + (p.available ? '' : ' off')}>{p.name}</div>
              <PriceInput value={p.price} onSave={(v) => patch(p.id, { price: v })} />
              <NoteInput value={p.price_note} onSave={(v) => patch(p.id, { price_note: v })} />
            </div>
          ))}
        </div>
      ))}
      <form className="card" onSubmit={add}>
        <h3>Neues Tier hinzufügen</h3>
        <div className="row">
          <label>Kategorie<input list="cats" value={nf.category} onChange={(e) => setNf({ ...nf, category: e.target.value })} /></label>
          <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
          <label>Name<input value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} /></label>
          <label>Preis €<input inputMode="decimal" value={nf.price} onChange={(e) => setNf({ ...nf, price: e.target.value })} /></label>
        </div>
        <button className="btn primary sm">Hinzufügen</button>
      </form>
    </>
  );
}

function PriceInput({ value, onSave }) {
  const [v, setV] = useState(value ?? '');
  useEffect(() => setV(value ?? ''), [value]);
  return (
    <input className="price" inputMode="decimal" placeholder="€" value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        const n = String(v).trim() === '' ? null : Number(String(v).replace(',', '.'));
        if (n !== (value === null ? null : Number(value)) && (n === null || !isNaN(n))) onSave(n);
      }} />
  );
}
function NoteInput({ value, onSave }) {
  const [v, setV] = useState(value ?? '');
  useEffect(() => setV(value ?? ''), [value]);
  return (
    <input className="pnote" placeholder="Hinweis" value={v} onChange={(e) => setV(e.target.value)}
      onBlur={() => { if ((v || null) !== (value || null)) onSave(v.trim() || null); }} />
  );
}

/* ---------------------------------------------------------------- Fahrten & Haltepunkte */
function Trips({ trips, stops, orders, reload }) {
  const today = todayISO();
  const [showPast, setShowPast] = useState(false);
  const [edit, setEdit] = useState(null);
  const list = trips.filter((t) => showPast || t.trip_date >= today);
  const countFor = (t) => orders.filter((o) => o.status !== 'storniert' && o.trip_stops?.trip_id === t.id).length;

  return (
    <>
      <div className="filters">
        <button className="btn sm primary" onClick={() => setEdit({ trip_date: '', name: '', trip_stops: [] })}>+ Neue Fahrt</button>
        <label className="check inline"><input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} /> vergangene zeigen</label>
      </div>
      {list.map((t) => (
        <div className={'card trip' + (t.active ? '' : ' off')} key={t.id} onClick={() => setEdit(t)}>
          <div className="ohead"><b>{fmtDate(t.trip_date)}</b><span className="muted small">{countFor(t)} Bestellungen</span></div>
          <div>{t.name}{!t.active && ' (für Kunden ausgeblendet)'}</div>
          <div className="muted small">{t.trip_stops.map((ts) => `${ts.stops?.name}${ts.stop_time ? ' ' + ts.stop_time : ''}`).join(' → ')}</div>
        </div>
      ))}
      <StopsCard stops={stops} reload={reload} />
      {edit && <TripForm trip={edit} stops={stops} trips={trips} reload={reload} onClose={() => setEdit(null)} />}
    </>
  );
}

function TripForm({ trip, stops, trips, reload, onClose }) {
  const isNew = !trip.id;
  const [date, setDate] = useState(trip.trip_date);
  const [name, setName] = useState(trip.name);
  const [active, setActive] = useState(trip.active ?? true);
  const [rows, setRows] = useState(trip.trip_stops.map((ts) => ({ id: ts.id, stop_id: String(ts.stop_id), stop_time: ts.stop_time || '' })));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const templates = [...new Map(trips.map((t) => [t.name, t])).values()];

  function useTemplate(id) {
    const t = trips.find((x) => String(x.id) === id);
    if (!t) return;
    setName(t.name);
    setRows(t.trip_stops.map((ts) => ({ stop_id: String(ts.stop_id), stop_time: ts.stop_time || '' })));
  }
  const move = (i, d) => setRows((r) => {
    const a = [...r]; const j = i + d; if (j < 0 || j >= a.length) return a;
    [a[i], a[j]] = [a[j], a[i]]; return a;
  });

  async function save(e) {
    e.preventDefault();
    if (!date || !name.trim()) return setErr('Datum und Name angeben.');
    const valid = rows.filter((r) => r.stop_id);
    if (new Set(valid.map((r) => r.stop_id)).size !== valid.length) return setErr('Ein Haltepunkt ist doppelt.');
    setBusy(true); setErr('');
    let id = trip.id;
    if (isNew) {
      const { data, error } = await supabase.from('trips').insert({ trip_date: date, name: name.trim(), active }).select('id').single();
      if (error) { setBusy(false); return setErr(error.message); }
      id = data.id;
    } else {
      const { error } = await supabase.from('trips').update({ trip_date: date, name: name.trim(), active }).eq('id', id);
      if (error) { setBusy(false); return setErr(error.message); }
    }
    // bestehende Haltepunkte aktualisieren (Bestellungen bleiben verknüpft), entfernte löschen, neue anlegen
    const keepIds = valid.filter((r) => r.id).map((r) => r.id);
    const removed = trip.trip_stops.filter((ts) => !keepIds.includes(ts.id));
    for (const ts of removed) {
      const { error } = await supabase.from('trip_stops').delete().eq('id', ts.id);
      if (error) { setBusy(false); return setErr(error.message); }
    }
    for (let i = 0; i < valid.length; i++) {
      const r = valid[i];
      const data = { trip_id: id, stop_id: Number(r.stop_id), stop_time: r.stop_time.trim() || null, sort: i + 1 };
      const { error } = r.id
        ? await supabase.from('trip_stops').update(data).eq('id', r.id)
        : await supabase.from('trip_stops').insert(data);
      if (error) { setBusy(false); return setErr(error.message); }
    }
    setBusy(false);
    await reload(); onClose();
  }
  async function remove() {
    if (!confirm('Fahrt löschen? Bestellungen dieser Fahrt verlieren dann ihren Haltepunkt.')) return;
    const { error } = await supabase.from('trips').delete().eq('id', trip.id);
    if (error) return setErr(error.message);
    await reload(); onClose();
  }

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="sheet-body" onSubmit={save}>
        <div className="sheet-head">
          <h2>{isNew ? 'Neue Fahrt' : 'Fahrt bearbeiten'}</h2>
          <button type="button" className="link" onClick={onClose}>Schließen</button>
        </div>
        {isNew && (
          <label>Vorlage (optional)<select defaultValue="" onChange={(e) => useTemplate(e.target.value)}>
            <option value="">– wie eine bisherige Tour –</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select></label>
        )}
        <div className="row">
          <label>Datum<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Warburg-Tour" /></label>
        </div>
        <label className="check"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Für Kunden bestellbar</label>
        <h3>Haltepunkte (in Fahrt-Reihenfolge)</h3>
        {rows.map((r, i) => (
          <div className="itemrow" key={i}>
            <select value={r.stop_id} onChange={(e) => setRows((l) => l.map((x, j) => (j === i ? { ...x, stop_id: e.target.value } : x)))}>
              <option value="">wählen …</option>
              {stops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input className="qty" placeholder="Uhrzeit" value={r.stop_time} onChange={(e) => setRows((l) => l.map((x, j) => (j === i ? { ...x, stop_time: e.target.value } : x)))} />
            <button type="button" className="x" onClick={() => move(i, -1)}>↑</button>
            <button type="button" className="x" onClick={() => setRows((l) => l.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <button type="button" className="btn sm ghost" onClick={() => setRows((l) => [...l, { stop_id: '', stop_time: '' }])}>+ Haltepunkt</button>
        {err && <div className="alert">{err}</div>}
        <div className="actions">
          <button className="btn primary" disabled={busy}>{busy ? 'Speichere …' : 'Speichern'}</button>
          {!isNew && <button type="button" className="btn ghost danger" onClick={remove}>Löschen</button>}
        </div>
      </form>
    </div>
  );
}

function StopsCard({ stops, reload }) {
  const [open, setOpen] = useState(false);
  const [nf, setNf] = useState({ name: '', region: '', address: '' });
  async function patch(id, data) {
    const { error } = await supabase.from('stops').update(data).eq('id', id);
    if (error) alert(error.message); else reload();
  }
  async function add(e) {
    e.preventDefault();
    if (!nf.name.trim()) return;
    const { error } = await supabase.from('stops').insert({ name: nf.name.trim(), region: nf.region.trim() || null, address: nf.address.trim() || null });
    if (error) return alert(error.message);
    setNf({ name: '', region: '', address: '' }); reload();
  }
  return (
    <div className="card">
      <h3 onClick={() => setOpen(!open)} className="clickable">Haltepunkte verwalten {open ? '▾' : '▸'}</h3>
      {open && (
        <>
          <p className="muted small">Kunden sehen nur den Ortsnamen. Adresse und Notiz sind intern und erscheinen in der WhatsApp-Bestätigung.</p>
          {stops.map((s) => (
            <div className="prow" key={s.id}>
              <label className="switch"><input type="checkbox" checked={s.active} onChange={(e) => patch(s.id, { active: e.target.checked })} /><span /></label>
              <div className={'pn' + (s.active ? '' : ' off')}>{s.name}<div className="muted small">{s.region}</div></div>
              <NoteInput value={s.address} onSave={(v) => patch(s.id, { address: v })} />
            </div>
          ))}
          <form onSubmit={add} className="row">
            <input placeholder="Ort" value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} />
            <input placeholder="Tour/Region" value={nf.region} onChange={(e) => setNf({ ...nf, region: e.target.value })} />
            <input placeholder="Adresse (intern)" value={nf.address} onChange={(e) => setNf({ ...nf, address: e.target.value })} />
            <button className="btn sm primary">+</button>
          </form>
        </>
      )}
    </div>
  );
}
