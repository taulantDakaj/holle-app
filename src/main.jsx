import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Shop, { MeineBestellung } from './Shop.jsx';
import './styles.css';

// alte Adresse der Verwaltung weiterleiten
if (location.hash.startsWith('#/admin')) location.replace('./admin.html');

const b = location.hash.match(/^#\/b\/([a-z0-9]{16,})/i);
createRoot(document.getElementById('root')).render(<StrictMode>{b ? <MeineBestellung id={b[1]} /> : <Shop />}</StrictMode>);
window.addEventListener('hashchange', () => { if (/^#\/b\//.test(location.hash) !== !!b) location.reload(); });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
