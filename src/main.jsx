import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Shop, { MeineBestellung } from './Shop.jsx';
import MeinHolle, { meinToken, setMeinToken } from './MeinHolle.jsx';
import Gutschein from './Gutschein.jsx';
import './styles.css';

// alte Adresse der Verwaltung weiterleiten
if (location.hash.startsWith('#/admin')) location.replace('./admin.html');

const b = location.hash.match(/^#\/b\/([a-z0-9]{16,})/i);
const k = location.hash.match(/^#\/k\/([a-f0-9]{16,})/i) || location.search.match(/[?&]k=([a-f0-9]{16,})/i);
if (k) setMeinToken(k[1]);
const mein = !!k || /^#\/mein/.test(location.hash);
const gs = /^#\/gutschein/.test(location.hash);
const seite = (h) => (/^#\/b\//.test(h) ? 'b' : /^#\/(mein|k\/)/.test(h) ? 'm' : /^#\/gutschein/.test(h) ? 'g' : 's');
createRoot(document.getElementById('root')).render(<StrictMode>{b ? <MeineBestellung id={b[1]} /> : mein ? <MeinHolle token={k ? k[1] : meinToken()} /> : gs ? <Gutschein /> : <Shop />}</StrictMode>);
window.addEventListener('hashchange', () => { if (seite(location.hash) !== (b ? 'b' : mein ? 'm' : gs ? 'g' : 's')) location.reload(); });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
