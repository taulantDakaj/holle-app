import { useEffect } from 'react';
import { fmtDate, fmtPrice, SHOP_PHONE } from './lib.js';

const TITLES = {
  fahrer: 'Fahrerliste',
  lade: 'Ladeliste LKW',
  bestell: 'Bestellliste',
};

/** Summe bekannter Preise; unknown = es gibt Positionen ohne Preis */
function orderSum(o) {
  let sum = 0, unknown = false;
  for (const i of o.order_items || []) {
    if (i.unit_price === null || i.unit_price === undefined) unknown = true;
    else sum += i.qty * Number(i.unit_price);
  }
  return { sum, unknown };
}
const qtyOf = (os) => os.reduce((s, o) => s + o.order_items.reduce((a, i) => a + i.qty, 0), 0);

/** Tiere als sortierte Liste [{name, category}] aus Bestellungen */
function productRows(orders, catOrder) {
  const m = new Map();
  for (const o of orders) for (const i of o.order_items) {
    if (!m.has(i.product_name)) m.set(i.product_name, { name: i.product_name, category: i.category || 'Sonstiges', sort: catOrder(i) });
  }
  return [...m.values()].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'de'));
}

export default function PrintView({ mode, title, date, groups, orders, products, onClose }) {
  const isLade = mode === 'lade';
  useEffect(() => {
    document.body.classList.add('printing');
    let st;
    if (isLade) {
      st = document.createElement('style');
      st.textContent = '@page { size: A4 landscape; margin: 10mm; }';
      document.head.appendChild(st);
    }
    window.scrollTo(0, 0);
    return () => { document.body.classList.remove('printing'); st?.remove(); };
  }, [isLade]);

  // Sortierung wie im Sortiment
  const sortIdx = new Map(products.map((p) => [p.id, p.sort]));
  const catOrder = (i) => (sortIdx.get(i.product_id) ?? 9999) + (i.product_name.endsWith('(Hahn)') ? 0.5 : 0);
  const rows = productRows(orders, catOrder);
  const total = qtyOf(orders);
  const unconfirmed = orders.filter((o) => o.status === 'neu').length;

  return (
    <div className="printview">
      <div className="pv-bar noprint">
        <button className="btn ghost sm" onClick={onClose}>← Zurück</button>
        <button className="btn primary sm" onClick={() => window.print()}>Drucken / als PDF</button>
      </div>

      <div className="pv-page">
        <header className="pv-head">
          <img src="./logo.png" alt="" />
          <div>
            <div className="pv-kicker">Geflügelverkauf Holle · {TITLES[mode]}</div>
            <h1>{title}</h1>
            <div className="pv-meta">
              {date && <>{fmtDate(date)} · </>}{orders.length} Bestellungen · {total} Tiere
              {unconfirmed > 0 && <> · <b>{unconfirmed} unbestätigt (*)</b></>}
            </div>
          </div>
          <div className="pv-printed">Stand: {new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </header>

        {orders.length === 0 && <p>Keine Bestellungen.</p>}

        {mode === 'fahrer' && <Fahrer groups={groups} />}
        {mode === 'lade' && <Lade groups={groups} rows={rows} />}
        {mode === 'bestell' && <Bestell rows={rows} orders={orders} />}

        <footer className="pv-foot">Geflügelverkauf Holle · {SHOP_PHONE} · Eberhard-Unkraut-Straße 76, 33397 Rietberg</footer>
      </div>
    </div>
  );
}

/* ---------- Fahrerliste: je Haltepunkt alle Kunden zum Abhaken ---------- */
function Fahrer({ groups }) {
  let cash = 0, cashUnknown = false;
  const blocks = groups.filter((g) => g.orders.length > 0).map((g) => {
    const totals = new Map();
    g.orders.forEach((o) => o.order_items.forEach((i) => totals.set(i.product_name, (totals.get(i.product_name) || 0) + i.qty)));
    return (
      <section className="pv-stop" key={g.key}>
        <h2>
          {g.time && <span className="pv-time">{g.time}</span>}
          {g.name}
          <small>{g.sub ? ' · ' + g.sub : ''}</small>
        </h2>
        <div className="pv-stopsum">{[...totals.entries()].map(([n, q]) => `${q}× ${n}`).join(' · ')}</div>
        <table className="pv-tbl">
          <thead>
            <tr><th className="c-chk">✓</th><th>Kunde</th><th>Tiere</th><th className="r">Betrag</th><th className="c-note">Notiz</th></tr>
          </thead>
          <tbody>
            {g.orders.map((o) => {
              const { sum, unknown } = orderSum(o);
              cash += sum; cashUnknown ||= unknown;
              return (
                <tr key={o.id}>
                  <td className="c-chk"><span className="box" /></td>
                  <td>
                    <b>{o.customer_name}{o.status === 'neu' ? ' *' : ''}</b>
                    <div>{o.phone}</div>
                    <div className="muted small">{o.order_no}{o.city ? ' · ' + o.city : ''}</div>
                  </td>
                  <td>{o.order_items.map((i) => <div key={i.id}><b>{i.qty}×</b> {i.product_name}</div>)}</td>
                  <td className="r nowrap">{sum ? fmtPrice(sum) : ''}{unknown ? ' + ?' : ''}</td>
                  <td className="c-note">
                    {o.customer_note && <div>{o.customer_note}</div>}
                    {o.internal_note && <div className="muted">{o.internal_note}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    );
  });
  return (
    <>
      {blocks}
      <div className="pv-total">
        Erwartete Einnahmen (bekannte Preise): <b>{fmtPrice(cash)}</b>{cashUnknown ? ' + Positionen ohne Preis' : ''}
      </div>
      <p className="pv-hint">* = noch nicht bestätigt · Kästchen abhaken, wenn abgeholt und bezahlt.</p>
    </>
  );
}

/* ---------- Ladeliste: Tiere × Haltepunkte ---------- */
function Lade({ groups, rows }) {
  const cols = groups.filter((g) => g.orders.length > 0);
  const cell = (g, name) => g.orders.reduce((s, o) => s + o.order_items.filter((i) => i.product_name === name).reduce((a, i) => a + i.qty, 0), 0);
  let lastCat = null;
  return (
    <>
      <table className="pv-tbl pv-matrix">
        <thead>
          <tr>
            <th>Tier</th>
            {cols.map((g) => <th key={g.key} className="r"><div>{g.name}</div>{g.time && <small>{g.time}</small>}</th>)}
            <th className="r">Gesamt</th>
            <th className="c-chk">✓</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const head = r.category !== lastCat ? (lastCat = r.category) : null;
            const tot = cols.reduce((s, g) => s + cell(g, r.name), 0);
            return [
              head && <tr key={'c' + head} className="pv-cat"><td colSpan={cols.length + 3}>{head}</td></tr>,
              <tr key={r.name}>
                <td>{r.name}</td>
                {cols.map((g) => { const v = cell(g, r.name); return <td key={g.key} className="r">{v || ''}</td>; })}
                <td className="r"><b>{tot}</b></td>
                <td className="c-chk"><span className="box" /></td>
              </tr>,
            ];
          })}
          <tr className="sum">
            <td>Tiere je Haltepunkt</td>
            {cols.map((g) => <td key={g.key} className="r">{qtyOf(g.orders)}</td>)}
            <td className="r">{cols.reduce((s, g) => s + qtyOf(g.orders), 0)}</td>
            <td />
          </tr>
          <tr>
            <td>Kisten</td>
            {cols.map((g) => <td key={g.key} className="r pv-write" />)}
            <td className="r pv-write" />
            <td />
          </tr>
        </tbody>
      </table>
      <p className="pv-hint">Tipp: Zuerst die Tiere für den letzten Haltepunkt einladen, damit die für den ersten Halt vorne stehen. Zeile „Kisten“ beim Beladen von Hand ausfüllen.</p>
    </>
  );
}

/* ---------- Bestellliste: Gesamtmengen für Einkauf/Bereitstellung ---------- */
function Bestell({ rows, orders }) {
  const qty = (name) => orders.reduce((s, o) => s + o.order_items.filter((i) => i.product_name === name).reduce((a, i) => a + i.qty, 0), 0);
  const nOrders = (name) => orders.filter((o) => o.order_items.some((i) => i.product_name === name)).length;
  let lastCat = null;
  return (
    <>
      <table className="pv-tbl">
        <thead>
          <tr><th>Tier</th><th className="r">Anzahl</th><th className="r">Bestellungen</th><th>Bereitgestellt / bestellt bei</th><th className="c-chk">✓</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const head = r.category !== lastCat ? (lastCat = r.category) : null;
            return [
              head && <tr key={'c' + head} className="pv-cat"><td colSpan={5}>{head} · {rows.filter((x) => x.category === head).reduce((s, x) => s + qty(x.name), 0)} Tiere</td></tr>,
              <tr key={r.name}>
                <td>{r.name}</td>
                <td className="r"><b>{qty(r.name)}</b></td>
                <td className="r">{nOrders(r.name)}</td>
                <td className="pv-write" />
                <td className="c-chk"><span className="box" /></td>
              </tr>,
            ];
          })}
          <tr className="sum"><td>Gesamt</td><td className="r">{qtyOf(orders)}</td><td className="r">{orders.length}</td><td /><td /></tr>
        </tbody>
      </table>
      <p className="pv-hint">Enthält alle nicht stornierten Bestellungen dieser Fahrt.</p>
    </>
  );
}
