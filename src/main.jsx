import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Shop from './Shop.jsx';
import './styles.css';

// alte Adresse der Verwaltung weiterleiten
if (location.hash.startsWith('#/admin')) location.replace('./admin.html');

createRoot(document.getElementById('root')).render(<StrictMode><Shop /></StrictMode>);
