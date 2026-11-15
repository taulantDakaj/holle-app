import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Shop from './Shop.jsx';
import Admin from './Admin.jsx';
import './styles.css';

function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const f = () => setHash(location.hash);
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  const admin = hash.startsWith('#/admin');
  useEffect(() => {
    document.title = admin ? 'Holle · Verwaltung' : 'Geflügelverkauf Holle · Bestellen';
  }, [admin]);
  return admin ? <Admin /> : <Shop />;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
