import { useState } from 'react';
import { supabase, fmtPrice, SHOP_PHONE, SHOP_WA, DATENSCHUTZ_URL } from './lib.js';
import { Page } from './Shop.jsx';

/* Gutscheine verkaufen: Kunde wählt Motiv, Betrag, Anzahl und Versand.
   Bezahlt wird per PayPal oder Überweisung nach der Bestätigung per WhatsApp. */

const BETRAEGE = [20, 30, 50, 100];
// Bestellschluss für Weihnachten (Post) – leer lassen, dann wird kein Datum angezeigt
export const GUTSCHEIN_FRIST = '';

export default function Gutschein() {
  const [motiv, setMotiv] = useState(new Date().getMonth() >= 10 ? 'weihnachten' : 'neutral');
  const [wert, setWert] = useState(50);
  const [frei, setFrei] = useState('');
  const [anzahl, setAnzahl] = useState(1);
  const [art, setArt] = useState('post');
  const [an, setAn] = useState('mich');
  const [f, setF] = useState({ name: '', telefon: '', email: '', adresse: '', fuer: '', von: '', bemerkung: '', website: '' });
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const betrag = wert === 'frei' ? parseInt(frei, 10) || 0 : wert;
  const summe = betrag * anzahl;
  const upd = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function senden(e) {
    e.preventDefault();
    setErr('');
    if (f.website) return; // Bot
    if (betrag < 10 || betrag > 500) return setErr('Bitte einen Betrag zwischen 10 und 500 € wählen.');
    if (art === 'post' && f.adresse.trim().length < 10) return setErr('Bitte die vollständige Postadresse angeben.');
    if (!consent) return setErr('Bitte bestätige die Datenschutzhinweise.');
    setBusy(true);
    const p = { ...f, wert: betrag, anzahl, art, an: art === 'post' ? an : 'mich', motiv };
    delete p.website;
    const { data, error } = await supabase.rpc('submit_gutschein', { p });
    setBusy(false);
    if (error) return setErr(error.message || 'Bestellung konnte nicht gesendet werden.');
    setDone({ ...data, betrag, anzahl, art, an, motiv, name: f.name, adresse: f.adresse });
    window.scrollTo(0, 0);
  }

  if (done) {
    const txt = `${done.anzahl}× Gutschein über ${fmtPrice(done.betrag)} (${done.motiv === 'weihnachten' ? 'Weihnachten' : 'neutral'})`;
    const wa = `Hallo, ich habe gerade einen Gutschein bestellt (${done.nr}):\n${txt}\n${done.art === 'post' ? 'Per Post an: ' + done.adresse : 'Abholung in Rietberg'}\n${done.name}`;
    return (
      <Page>
        <div className="card success">
          <div className="big">🎁</div>
          <h2>Danke, deine Gutschein-Bestellung ist angekommen!</h2>
          <p>Bestellnummer: <b>{done.nr}</b></p>
          <pre className="summary">{txt}{'\n'}Gesamt: {fmtPrice(done.summe)}</pre>
          <p>Wir melden uns per WhatsApp mit den Zahlungsdaten (PayPal oder Überweisung).
            {done.art === 'post' ? ' Sobald das Geld da ist, schreiben wir den Gutschein von Hand und schicken ihn per Post los.' : ' Sobald das Geld da ist, liegt der Gutschein für dich in Rietberg bereit.'}</p>
          <a className="btn wa" href={`https://wa.me/${SHOP_WA}?text=${encodeURIComponent(wa)}`}>Bestellung zusätzlich per WhatsApp schicken</a>
          <a className="btn ghost" href="./">Zur Tier-Bestellung</a>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <section className="card gs-kopf">
        <h2>🎁 Ei-n Gutschein</h2>
        <p>Das Geschenk, das Eier legt: Mit dem Ei-n Gutschein sucht sich der Beschenkte seine Hühner selbst aus – Junghennen, Rassehühner, Enten und mehr. Eingelöst wird an allen Haltepunkten oder in Rietberg, ab dem Saisonstart im Februar 2027.</p>
        {GUTSCHEIN_FRIST && <p className="gs-frist">Für Weihnachten per Post bis <b>{GUTSCHEIN_FRIST}</b> bestellen.</p>}
      </section>

      <form onSubmit={senden}>
        <section className="card">
          <h2><span className="num">1</span> Gutschein wählen</h2>
          <div className="gs-motive">
            {[['weihnachten', 'Weihnachten'], ['neutral', 'Ganzjährig']].map(([k, l]) => (
              <button type="button" key={k} className={'gs-motiv' + (motiv === k ? ' on' : '')} onClick={() => setMotiv(k)} aria-pressed={motiv === k}>
                <img src={`./gutschein-${k}.jpg`} alt={`Gutschein-Motiv ${l}`} loading="lazy" />
                <span>{l}</span>
              </button>
            ))}
          </div>
          <div className="gs-label">Betrag pro Gutschein</div>
          <div className="gs-chips">
            {BETRAEGE.map((b) => (
              <button type="button" key={b} className={wert === b ? 'on' : ''} onClick={() => setWert(b)} aria-pressed={wert === b}>{b} €</button>
            ))}
            <button type="button" className={wert === 'frei' ? 'on' : ''} onClick={() => setWert('frei')} aria-pressed={wert === 'frei'}>Anderer</button>
          </div>
          {wert === 'frei' && (
            <label>Wunschbetrag in € (10–500)
              <input inputMode="numeric" value={frei} placeholder="z. B. 60" onChange={(e) => setFrei(e.target.value.replace(/\D/g, '').slice(0, 3))} />
            </label>
          )}
          <p className="hint">Zur Orientierung: Hybridhennen gibt es ab 12 €, Rassehennen ab 20 €.</p>
          <div className="variant gs-anzahl">
            <div className="vlabel"><b>Anzahl Gutscheine</b></div>
            <div className="stepper">
              <button type="button" onClick={() => setAnzahl((n) => Math.max(1, n - 1))} aria-label="weniger Gutscheine">−</button>
              <input inputMode="numeric" value={anzahl} aria-label="Anzahl Gutscheine" onChange={(e) => setAnzahl(Math.max(1, Math.min(10, parseInt(e.target.value.replace(/\D/g, ''), 10) || 1)))} />
              <button type="button" onClick={() => setAnzahl((n) => Math.min(10, n + 1))} aria-label="mehr Gutscheine">+</button>
            </div>
          </div>
        </section>

        <section className="card">
          <h2><span className="num">2</span> Für wen?</h2>
          <p className="hint" style={{ marginTop: 0 }}>Wir schreiben die Namen von Hand auf die Karte. Leer lassen, wenn du sie selbst eintragen willst.</p>
          <label>Für (Name des Beschenkten)<input value={f.fuer} onChange={upd('fuer')} maxLength={60} /></label>
          <label>Von (dein Name, wie er auf der Karte stehen soll)<input value={f.von} onChange={upd('von')} maxLength={60} /></label>
        </section>

        <section className="card">
          <h2><span className="num">3</span> Wie kommt der Gutschein an?</h2>
          <div className="seg">
            <button type="button" className={art === 'post' ? 'on' : ''} onClick={() => setArt('post')}>Per Post</button>
            <button type="button" className={art === 'abholung' ? 'on' : ''} onClick={() => setArt('abholung')}>Abholen in Rietberg</button>
          </div>
          {art === 'post' ? (
            <>
              <div className="seg">
                <button type="button" className={an === 'mich' ? 'on' : ''} onClick={() => setAn('mich')}>An mich</button>
                <button type="button" className={an === 'beschenkt' ? 'on' : ''} onClick={() => setAn('beschenkt')}>Direkt an den Beschenkten</button>
              </div>
              <label>Postadresse (Name, Straße, PLZ Ort)
                <textarea rows="3" required value={f.adresse} onChange={upd('adresse')} autoComplete="street-address" />
              </label>
            </>
          ) : (
            <p className="hint">Abholung in Rietberg nach Absprache. Ort und Uhrzeit schicken wir dir mit der Bestätigung.</p>
          )}
        </section>

        <section className="card">
          <h2><span className="num">4</span> Deine Daten</h2>
          <label>Name<input required autoComplete="name" value={f.name} onChange={upd('name')} /></label>
          <label>Handynummer (WhatsApp)<input required type="tel" autoComplete="tel" value={f.telefon} onChange={upd('telefon')} /></label>
          <label>E-Mail (optional)<input type="email" autoComplete="email" value={f.email} onChange={upd('email')} /></label>
          <label>Anmerkung (optional)<textarea rows="2" value={f.bemerkung} onChange={upd('bemerkung')} /></label>
          <input className="hp" tabIndex="-1" autoComplete="off" value={f.website} onChange={upd('website')} aria-hidden="true" />
          <label className="check">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Bestellung gespeichert werden. <a href={DATENSCHUTZ_URL} target="_blank" rel="noreferrer">Datenschutzerklärung</a></span>
          </label>
        </section>

        <section className="card info">
          <ul>
            <li>Bezahlung per PayPal oder Überweisung – die Daten bekommst du mit der Bestätigung per WhatsApp.</li>
            <li>Nach Zahlungseingang schreiben wir den Gutschein von Hand und schicken ihn los.</li>
            <li>Einlösbar für alle Tiere aus unserem Sortiment, an allen Haltepunkten oder in Rietberg. Keine Barauszahlung. Der Gutschein ist 3 Jahre gültig, gerechnet ab Kauf.</li>
            <li>Fragen? <a href={`tel:${SHOP_PHONE.replace(/\s/g, '')}`}>{SHOP_PHONE}</a> oder WhatsApp.</li>
          </ul>
        </section>

        {err && <div className="alert">{err}</div>}
        <div className="sticky">
          <button className="btn primary" disabled={busy}>
            {busy ? 'Wird gesendet …' : summe >= 10 ? `${anzahl > 1 ? anzahl + ' Gutscheine' : 'Gutschein'} über ${fmtPrice(summe)} bestellen` : 'Gutschein bestellen'}
          </button>
        </div>
      </form>
    </Page>
  );
}

/* Hinweis-Kachel auf der Bestellseite */
export function GutscheinTeaser() {
  return (
    <a className="card gs-teaser" href="./#/gutschein">
      <img src="./gutschein-weihnachten.jpg" alt="" />
      <div>
        <b>Ei-n Gutschein 🎁</b>
        <span>Hühner verschenken – das Geschenk, das Eier legt. Jetzt bestellen →</span>
      </div>
    </a>
  );
}
