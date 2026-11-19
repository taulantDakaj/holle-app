import { useEffect, useState } from 'react';
import { supabase, fmtDate, fmtPrice } from './lib.js';
import { Page } from './Shop.jsx';

/* Live-Übersicht für Partnerhöfe (#/p/<token>): Bestellungen mit ihrem Code, abgeholte Tiere, Guthaben.
   Datenschutz: nur Vorname + Anfangsbuchstabe, keine Telefonnummern. */
const STATUS = { neu: 'Neu', offen: 'Bestätigt', abgeholt: 'Abgeholt', storniert: 'Storniert', nichtda: 'Nicht abgeholt' };
const monat = (m) => new Date(m + '-01T12:00:00').toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
const zeit = (iso) => { try { return new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

export default function Partner({ token }) {
  const [d, setD] = useState(undefined);
  const laden = async () => {
    const { data, error } = await supabase.rpc('partner_uebersicht', { p_token: token });
    setD(error ? null : data || null);
  };
  useEffect(() => { laden(); const t = setInterval(laden, 60000); return () => clearInterval(t); }, [token]);
  const link = d ? `https://bestellen.gefluegelverkauf-holle.de/?code=${d.code}` : '';
  return (
    <Page>
      <div className="card partner">
        {d === undefined && <p>Wird geladen …</p>}
        {d === null && <p>Dieser Link ist nicht (mehr) gültig. Bitte melde dich bei Geflügelverkauf Holle.</p>}
        {d && (<>
          <h2>{d.name}</h2>
          <p className="muted">Partner-Übersicht · Code <b>{d.code}</b>{!d.aktiv && ' · derzeit pausiert'}</p>
          <div className="kpis">
            <div><b>{d.anzahl}</b><span>Bestellungen</span></div>
            <div><b>{d.abgeholt}</b><span>Tiere abgeholt</span></div>
            <div><b>{d.offen}</b><span>Tiere noch offen</span></div>
            <div><b>{fmtPrice(d.verdient)}</b><span>verdient ({fmtPrice(d.provision)} je Tier)</span></div>
            <div className="gut"><b>{fmtPrice(d.guthaben)}</b><span>Guthaben{d.eingeloest > 0 ? ` · ${fmtPrice(d.eingeloest)} bereits eingelöst` : ''}</span></div>
          </div>
          <p className="muted">Gezählt werden nur Tiere, die wirklich abgeholt wurden. Kunden mit eurem Code sparen {fmtPrice(d.rabatt)} pro Tier.</p>

          <h3>Bestellungen mit eurem Code</h3>
          {d.bestellungen.length ? (
            <table><thead><tr><th>Bestellt am</th><th>Kunde</th><th>Tiere</th><th>Status</th></tr></thead><tbody>
              {d.bestellungen.map((b, i) => (
                <tr key={i}><td>{zeit(b.bestellt)}<br /><small className="muted">Abholung {fmtDate(b.datum)}</small></td><td>{b.kunde}</td>
                  <td>{b.tiere}</td><td><span className={'st ' + b.status}>{STATUS[b.status] || b.status}</span></td></tr>
              ))}
            </tbody></table>
          ) : <p className="muted">Noch keine Bestellungen mit eurem Code.</p>}

          {d.monate.length > 0 && (<>
            <h3>Abgeholt je Monat</h3>
            <table><tbody>{d.monate.map((m) => <tr key={m.monat}><td>{monat(m.monat)}</td><td>{m.abgeholt} Tiere</td><td>{fmtPrice(m.abgeholt * d.provision)}</td></tr>)}</tbody></table>
          </>)}

          {d.einloesungen.length > 0 && (<>
            <h3>Eingelöstes Guthaben</h3>
            <table><tbody>{d.einloesungen.map((e, i) => <tr key={i}><td>{fmtDate(e.datum)}</td><td>{e.notiz || ''}</td><td>−{fmtPrice(e.betrag)}</td></tr>)}</tbody></table>
          </>)}

          <h3>Euer Bestell-Link</h3>
          <p className="muted">Für Link-Sticker, Bio und eure Webseite – der Code ist automatisch drin:</p>
          <p><a href={link}>{link}</a></p>
          <div className="actions">
            <button className="btn" type="button" onClick={() => { if (navigator.share) navigator.share({ url: link, title: 'Hühner bestellen' }).catch(() => {}); else navigator.clipboard?.writeText(link); }}>Link teilen</button>
          </div>
          <p className="muted" style={{ marginTop: '1rem' }}>Stand: {zeit(d.stand)} · aktualisiert sich automatisch</p>
        </>)}
      </div>
    </Page>
  );
}
