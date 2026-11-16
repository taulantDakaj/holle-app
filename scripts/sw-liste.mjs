// Nach dem Build: alle Programmdateien in den Service Worker eintragen, damit die App sofort offline geht
import fs from 'fs';
const dateien = fs.readdirSync('dist/assets').filter((f) => !/^(html2canvas|purify|index\.es)/.test(f)).map((f) => './assets/' + f);
const sw = fs.readFileSync('dist/sw.js', 'utf8')
  .replace('/*DATEIEN*/[]', JSON.stringify(dateien))
  .replace('holle-app-v2', 'holle-app-' + Date.now().toString(36));
fs.writeFileSync('dist/sw.js', sw);
console.log('Service Worker:', dateien.length, 'Dateien');
