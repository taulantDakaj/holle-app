import { TOURS as TOURS_BASE, ORT_FARBE, ORT_KOORD } from '../tours.js';

/* ---------- Stammdaten ---------- */
const TOURS=structuredClone(TOURS_BASE);

const ortFarbe=n=>ORT_FARBE[n]||"#555555";
const HOME="Lieferung nach Hause", HOME_OLD="Auslieferung an Kundenadresse";
TOURS.forEach(t=>t.stops.push(["",HOME,"an die Adresse des Kunden"]));
const ALIAS={"dunkle sussex":"Sussex dunkel","sussex dunkel":"Sussex dunkel","helle sussex":"Sussex hell","maran +":"Maran+"};
const HYBRID_EXTRA=["maran","sussex","maran+"];
function canonTier(t){
  if(!t) return t; const x=String(t).trim().replace(/\s+/g," "), l=x.toLowerCase();
  if(ALIAS[l]) return ALIAS[l];
  const hit=TIERE.find(n=>n.toLowerCase()===l); if(hit) return hit;
  const m=l.match(/^(.*?)\s*h(a|ä)hne?$/);
  if(m){ const base=canonTier(m[1]); if(base&&TIERE.includes(base+" Hahn")) return base+" Hahn"; }
  return x;
}
const normPos=o=>o.positionen?{...o,positionen:o.positionen.map(p=>({...p,tier:canonTier(p.tier)}))}:o;
const norm0=o=>o.ort===HOME_OLD?{...o,ort:HOME}:o.ort==="Rietberg (Hof)"?{...o,ort:"Rietberg zuhause"}:o.ort==="Salzhemmendorf / Hemmendorf"?{...o,ort:"Hemmendorf"}:o;
const norm=o=>normPos(norm0(o));
const TIERE=["Braune Tetra","Braune Tetra Hahn","Schwarze Bovan","Schwarze Bovan Hahn","Weiße Leghorn","Weiße Leghorn Hahn","Sussex hell","Sussex hell Hahn","Sussex dunkel","Sussex dunkel Hahn","Grünleger","Grünleger Hahn","Blauleger","Blauleger Hahn","Maran+","Maran+ Hahn","Italiener silber","Italiener silber Hahn","Italiener rebhuhnfarbig","Italiener rebhuhnfarbig Hahn","Rhodeländer","Rhodeländer Hahn","Dalmatiner","Dalmatiner Hahn","Tricolor","Tricolor Hahn","Goldsperber","Goldsperber Hahn","Königsberger silberblau","Königsberger silberblau Hahn","Blausperber","Blausperber Hahn","Lohmann","Lohmann Hahn","Araucana","Araucana Hahn","Zwerg Welsumer","Zwerg Welsumer Hahn","Zwerg Bielefelder","Zwerg Bielefelder Hahn","Französische Marans","Französische Marans Hahn","Barnevelder","Barnevelder Hahn","Bielefelder Kennhühner","Bielefelder Kennhuhn Hahn","New Hampshire","New Hampshire Hahn","Sulmtaler","Sulmtaler Hahn","Eulenbart","Eulenbart Hahn","Schwedische Blumenhühner","Schwedisches Blumenhuhn Hahn","Vorwerk","Vorwerk Hahn","Zwerg Lachshühner","Zwerg Lachshuhn Hahn","Zwerg Wyandotten","Zwerg Wyandotte Hahn","Sebright","Sebright Hahn","Große Wyandotten","Große Wyandotte Hahn","Zwerg Cochin","Zwerg Cochin Hahn","Zwerg New Hampshire","Zwerg New Hampshire Hahn","Deutsche Lachshühner","Deutsches Lachshuhn Hahn","Große Cochin","Große Cochin Hahn","Brahma","Brahma Hahn","Orpington","Orpington Hahn","Paduaner","Paduaner Hahn","Zwerg Paduaner","Zwerg Paduaner Hahn","Bartzwerge","Bartzwerg Hahn","Seidenhühner","Seidenhuhn Hahn","Watermaalsche Zwerge","Watermaalscher Zwerg Hahn","Ayam Cemani","Ayam Cemani Hahn","Cream Legbar","Cream Legbar Hahn","Olivleger","Olivleger Hahn","Amrock","Amrock Hahn","Zwerg Amrock","Zwerg Amrock Hahn","Houdan","Houdan Hahn","Weißhauben","Weißhaube Hahn","Welsumer","Welsumer Hahn","Zwerg Sussex","Zwerg Sussex Hahn","Moderner Englischer Zwergkämpfer","Moderner Englischer Zwergkämpfer Hahn","Flugenten","Flugerpel","Mularden","Dänenenten","Wildenten","Landenten","Laufenten","Lauferpel","Sachsenenten","Gänse / Gössel","Perlhühner","Fasane","Wachtelhennen","Wachtelhähne","Weiße Puten","Bronzeputen","Mastküken","Masthähnchen 3 Wochen","Masthähnchen schlachtreif","Hühner aussuchen"];
const PREIS_VORSCHLAG={"Masthähnchen 3 Wochen": 4.5, "Braune Tetra": 13, "Weiße Leghorn": 13, "Sussex hell": 14, "Sussex dunkel": 16, "Blausperber": 14, "Schwarze Bovan": 14, "Goldsperber": 16, "Grünleger": 16, "Maran+": 16, "Italiener silber": 16, "Italiener rebhuhnfarbig": 16, "Rhodeländer": 16, "Deutsche Lachshühner": 36, "Brahma": 42, "Vorwerk": 30, "Schwedische Blumenhühner": 30, "Ayam Cemani": 30, "Olivleger": 30, "Bielefelder Kennhühner": 30, "Barnevelder": 30, "Blauleger": 20, "Dalmatiner": 20, "Tricolor": 20, "Königsberger silberblau": 16, "Lohmann": 13, "Zwerg Welsumer": 18, "Zwerg Bielefelder": 22, "Mastküken": 4.5, "Wachtelhennen": 7, "Wachtelhähne": 7, "Braune Tetra Hahn": 11, "Schwarze Bovan Hahn": 12, "Weiße Leghorn Hahn": 11, "Sussex hell Hahn": 12, "Sussex dunkel Hahn": 14, "Grünleger Hahn": 14, "Blauleger Hahn": 18, "Maran+ Hahn": 14, "Italiener silber Hahn": 14, "Italiener rebhuhnfarbig Hahn": 14, "Rhodeländer Hahn": 14, "Dalmatiner Hahn": 18, "Tricolor Hahn": 18, "Goldsperber Hahn": 14, "Königsberger silberblau Hahn": 14, "Blausperber Hahn": 12, "Lohmann Hahn": 11, "Zwerg Welsumer Hahn": 20, "Zwerg Bielefelder Hahn": 20, "Araucana": 22, "Araucana Hahn": 20, "Französische Marans": 30, "Französische Marans Hahn": 20, "Barnevelder Hahn": 20, "Bielefelder Kennhuhn Hahn": 20, "New Hampshire": 30, "New Hampshire Hahn": 20, "Sulmtaler": 30, "Sulmtaler Hahn": 20, "Eulenbart": 30, "Eulenbart Hahn": 20, "Schwedisches Blumenhuhn Hahn": 20, "Vorwerk Hahn": 20, "Zwerg Lachshühner": 30, "Zwerg Lachshuhn Hahn": 20, "Zwerg Wyandotten": 30, "Zwerg Wyandotte Hahn": 20, "Sebright": 30, "Sebright Hahn": 20, "Große Wyandotten": 30, "Große Wyandotte Hahn": 20, "Zwerg Cochin": 30, "Zwerg Cochin Hahn": 20, "Zwerg New Hampshire": 30, "Zwerg New Hampshire Hahn": 20, "Deutsches Lachshuhn Hahn": 20, "Große Cochin": 30, "Große Cochin Hahn": 20, "Brahma Hahn": 20, "Orpington": 40, "Orpington Hahn": 20, "Paduaner": 35, "Paduaner Hahn": 20, "Zwerg Paduaner": 30, "Zwerg Paduaner Hahn": 20, "Bartzwerge": 30, "Bartzwerg Hahn": 20, "Seidenhühner": 35, "Seidenhuhn Hahn": 20, "Watermaalsche Zwerge": 30, "Watermaalscher Zwerg Hahn": 20, "Ayam Cemani Hahn": 20, "Cream Legbar": 30, "Cream Legbar Hahn": 20, "Olivleger Hahn": 20, "Amrock": 30, "Amrock Hahn": 20, "Zwerg Amrock": 30, "Zwerg Amrock Hahn": 20, "Houdan": 35, "Houdan Hahn": 20, "Weißhauben": 30, "Weißhaube Hahn": 20, "Welsumer": 30, "Welsumer Hahn": 20, "Zwerg Sussex": 30, "Zwerg Sussex Hahn": 20, "Moderner Englischer Zwergkämpfer": 30, "Moderner Englischer Zwergkämpfer Hahn": 20};

/* ---------- Sprache Fahrer-Ansicht ---------- */
var frOffen=null;
var SPRACHE=(()=>{try{return localStorage.getItem("holle-sprache")||"de"}catch(e){return "de"}})();
function T(k,v){const t=(TEXTE[SPRACHE]&&TEXTE[SPRACHE][k])||TEXTE.de[k]||k;return v?t.replace(/\{(\w+)\}/g,(_,x)=>v[x]??""):t}
var TEXTE={
 de:{kassieren:"Kassieren",betrag:"Betrag",nichtDaLang:"Nicht da – kein Verkauf",heute:"heute",keineTouren:"Keine Touren",kunden:"Kunden",tiere:"Tiere",summe:"Summe",kassiert:"kassiert",nichtErsch:"nicht erschienen",
  erledigt:"{a} von {b} Kunden erledigt · {p} %",keine:"Keine Bestellungen.",rueck:"Rückgängig",quittung:"Quittung",anrufen:"📞 Anrufen",nichtDa:"Nicht da",
  bar:"Bar",ueberw:"Überw.",offen:"offen",fertig:"✓ fertig",navi:"Navi",confirmNd:"{k} ist nicht gekommen – kein Verkauf?\nDie Tiere gehen zurück in den Bestand.",
  stAn:"📍 Standort wird geteilt – Taulant sieht, an welchem Haltepunkt du bist (nur solange diese Seite offen ist).",aus:"Ausschalten",stAus:"📍 Standort ist aus.",teilen:"Standort teilen",
  schliessen:"Schließen",tag:"Tag",tour:"Tour",sprache:"Sprache",tabFahrer:"Fahrer",abmelden:"Abmelden",
  hint:"Haltepunkte in Fahr-Reihenfolge. „Navi“ öffnet Google Maps. Bezahlt: Bar, PayPal oder Überweisung antippen. „Nicht da“ = Kunde nicht gekommen, kein Verkauf. Das blaue „i“ zeigt Bild und Beschreibung der Tierart."},
 en:{kassieren:"Collect payment",betrag:"Amount",nichtDaLang:"Not here – no sale",heute:"today",keineTouren:"No tours",kunden:"Customers",tiere:"Animals",summe:"Total",kassiert:"collected",nichtErsch:"no-show",
  erledigt:"{a} of {b} customers done · {p} %",keine:"No orders.",rueck:"Undo",quittung:"Receipt",anrufen:"📞 Call",nichtDa:"Not here",
  bar:"Cash",ueberw:"Transfer",offen:"open",fertig:"✓ done",navi:"Navigate",confirmNd:"{k} did not come – no sale?\nThe animals go back into stock.",
  stAn:"📍 Location is being shared – Taulant can see which stop you are at (only while this page is open).",aus:"Turn off",stAus:"📍 Location is off.",teilen:"Share location",
  schliessen:"Close",tag:"Day",tour:"Tour",sprache:"Language",tabFahrer:"Driver",abmelden:"Sign out",
  hint:"Stops in driving order. “Navigate” opens Google Maps. Paid: tap Cash, PayPal or Transfer. “Not here” = customer did not come, no sale. The blue “i” shows a picture and description of the breed."},
 sq:{kassieren:"Arkëto",betrag:"Shuma",nichtDaLang:"Nuk erdhi – pa shitje",heute:"sot",keineTouren:"Nuk ka ture",kunden:"Klientë",tiere:"Kafshë",summe:"Shuma",kassiert:"arkëtuar",nichtErsch:"nuk erdhi",
  erledigt:"{a} nga {b} klientë të kryer · {p} %",keine:"Nuk ka porosi.",rueck:"Anulo",quittung:"Faturë",anrufen:"📞 Telefono",nichtDa:"Nuk erdhi",
  bar:"Cash",ueberw:"Transfertë",offen:"të hapura",fertig:"✓ mbaruar",navi:"Navigo",confirmNd:"{k} nuk erdhi – nuk ka shitje?\nKafshët kthehen në magazinë.",
  stAn:"📍 Vendndodhja po ndahet – Taulant sheh në cilën ndalesë je (vetëm sa kohë që kjo faqe është e hapur).",aus:"Fike",stAus:"📍 Vendndodhja është e fikur.",teilen:"Ndaj vendndodhjen",
  schliessen:"Mbyll",tag:"Dita",tour:"Turi",sprache:"Gjuha",tabFahrer:"Shoferi",abmelden:"Dil",
  hint:"Ndalesat sipas radhës së rrugës. “Navigo” hap Google Maps. Pagesa: shtyp Cash, PayPal ose Transfertë. “Nuk erdhi” = klienti nuk erdhi, nuk ka shitje. “i” blu tregon foto dhe përshkrim të racës."},
 ro:{kassieren:"Încasează",betrag:"Suma",nichtDaLang:"Nu a venit – fără vânzare",heute:"azi",keineTouren:"Nicio tură",kunden:"Clienți",tiere:"Animale",summe:"Total",kassiert:"încasat",nichtErsch:"nu a venit",
  erledigt:"{a} din {b} clienți rezolvați · {p} %",keine:"Nicio comandă.",rueck:"Anulează",quittung:"Chitanță",anrufen:"📞 Sună",nichtDa:"Nu a venit",
  bar:"Numerar",ueberw:"Transfer",offen:"deschise",fertig:"✓ gata",navi:"Navigare",confirmNd:"{k} nu a venit – nicio vânzare?\nAnimalele se întorc în stoc.",
  stAn:"📍 Locația este partajată – Taulant vede la ce oprire ești (doar cât timp această pagină este deschisă).",aus:"Oprește",stAus:"📍 Locația este oprită.",teilen:"Partajează locația",
  schliessen:"Închide",tag:"Ziua",tour:"Tura",sprache:"Limba",tabFahrer:"Șofer",abmelden:"Deconectare",
  hint:"Opririle în ordinea traseului. „Navigare” deschide Google Maps. Plătit: apasă Numerar, PayPal sau Transfer. „Nu a venit” = clientul nu a venit, nicio vânzare. „i” albastru arată poza și descrierea rasei."}
};
var MOTIV_X={
 en:{erster:["First customer happy – off to a great start! 🐔","First one done – here we go! 🚚"],25:["A quarter done – keep it up! 💪","25 % done – you're doing great! 🐔"],
  50:["Halfway there! Half done – great job! 🙌","50 % done – it's downhill from here! 🚚"],75:["Three quarters done – final sprint! 🏁","Only a quarter left – almost there! 💪"],
  100:["Tour done! Every customer served – great work, thank you! 🎉","All done – safe drive home and thanks for your effort! 🚚🐔"]},
 sq:{erster:["Klienti i parë i kënaqur – fillim i mbarë! 🐔","I pari u krye – vazhdojmë! 🚚"],25:["Një e katërta u krye – vazhdo kështu! 💪","25 % të kryera – po shkon shumë mirë! 🐔"],
  50:["Gjysma u krye – bravo! 🙌","50 % të kryera – tani është më lehtë! 🚚"],75:["Tre të katërtat u kryen – sprinti i fundit! 🏁","Mbeti vetëm një e katërta – pothuajse mbarove! 💪"],
  100:["Turi mbaroi! Të gjithë klientët u shërbyen – punë e shkëlqyer, faleminderit! 🎉","Gjithçka u krye – rrugë të mbarë për në shtëpi dhe faleminderit! 🚚🐔"]},
 ro:{erster:["Primul client e mulțumit – început bun! 🐔","Primul e gata – pornim! 🚚"],25:["Un sfert gata – ține-o tot așa! 💪","25 % gata – te descurci foarte bine! 🐔"],
  50:["Jumătate gata – bravo! 🙌","50 % gata – de acum e mai ușor! 🚚"],75:["Trei sferturi gata – ultima sută de metri! 🏁","Mai e doar un sfert – aproape gata! 💪"],
  100:["Tura e gata! Toți clienții serviți – treabă excelentă, mulțumesc! 🎉","Totul e gata – drum bun spre casă și mulțumesc pentru efort! 🚚🐔"]}
};

/* ---------- Hilfen ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tourById=id=>TOURS.find(t=>t.id===id);
const eur=n=>n.toLocaleString("de-DE",{style:"currency",currency:"EUR"});
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function nextSaturday(){const d=new Date();d.setDate(d.getDate()+((6-d.getDay()+7)%7));return iso(d)}
const dLong=s=>s?new Date(s+"T12:00").toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"}):"";
const dShort=s=>s?new Date(s+"T12:00").toLocaleDateString("de-DE",{weekday:"short",day:"2-digit",month:"2-digit"}):"";
function stopIdx(o){const t=tourById(o.tour);return t?Math.max(0,t.stops.findIndex(s=>s[1]===o.ort)):99}
const stueck=o=>(o.positionen||[]).reduce((a,p)=>a+(+p.anzahl||0),0);
const brutto=o=>(o.positionen||[]).reduce((a,p)=>a+(+p.anzahl||0)*(+p.preis||0),0);
// Rabatt: {art:"prozent"|"euro", wert}
function rabattEur(o){const r=o&&o.rabatt, b=brutto(o); if(!r||!(+r.wert>0)||!b) return 0;
  return Math.min(b, r.art==="prozent"?Math.round(b*(+r.wert)/100*100)/100:+r.wert)}
const rabattText=o=>{const r=o&&o.rabatt;if(!rabattEur(o))return"";return r.art==="prozent"?`${String(+r.wert).replace(".",",")} % Rabatt`:"Rabatt"};
const betrag=o=>Math.max(0,brutto(o)-rabattEur(o));
const tierText=(o,sep)=>(o.positionen||[]).filter(p=>p.tier&&+p.anzahl).map(p=>`${p.anzahl} × ${p.tier}`).join(sep);
function rhythmInfo(dateStr){
  if(!dateStr) return "";
  const d=new Date(dateStr+"T12:00");
  const wd=d.getDay();
  if(wd!==6&&wd!==0) return `<b>Achtung:</b> ${esc(dLong(dateStr))} ist kein Samstag.`;
  const n=Math.ceil(d.getDate()/7), m=d.getMonth()+1;
  const fahren=TOURS.filter(t=>t.id!=="R"&&(t.tag??6)===wd&&t.weeks.includes(n)).map(t=>t.nr+" ("+t.name+")");
  let s=`${esc(dLong(dateStr))} ist der <b>${n}. ${wd===0?"Sonntag":"Samstag"}</b> im Monat. Laut Fahrplan: <b>${fahren.length?esc(fahren.join(", ")):"keine feste Tour"}</b>. Eschwege wird jede Woche angefahren.`;
  if(m<3||m>10) s+=` <b>November bis Februar:</b> nur auf Anfrage.`;
  return s;
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,2600)}

/* ---------- Datenhaltung ---------- */
let orders=[], db=null, dl=null, mode="init";
const LS="holle-bestellbuch-orders";
function lsLoad(){try{return JSON.parse(localStorage.getItem(LS)||"[]").map(norm)}catch(e){return[]}}
function lsSave(){try{localStorage.setItem(LS,JSON.stringify(orders))}catch(e){}}
async function saveOrder(id,o){
  if(db){ if(id) await db.doc("orders/"+id).set(o); else await db.collection("orders").add(o); }
  else { if(id){orders=orders.map(x=>x.id===id?{...o,id}:x)} else orders.push({...o,id:"l"+Date.now()}); lsSave(); renderAll(); }
}
async function deleteOrder(id){
  if(db) await db.doc("orders/"+id).delete();
  else { orders=orders.filter(o=>o.id!==id); lsSave(); renderAll(); }
}
(async()=>{
  await Promise.resolve();
  const c=window.claude;
  try{ db=c&&c.use?await c.use("db"):null }catch(e){db=null}
  try{ dl=c&&c.use?await c.use("downloads"):null }catch(e){dl=null}
  if(!dl){
    if(window.top===window){ $("#f2-print").textContent="Fahrplan drucken"; $("#o-print").textContent="Bestellliste drucken"; $("#printBtn").textContent="Ladeliste drucken"; $("#printHint").textContent="Jede Tour beginnt auf einer neuen Seite."; }
    else {$("#printBtn").disabled=true;$("#csvBtn").disabled=true;$("#b-csv").disabled=true;$("#o-print").disabled=true;$("#o-csv").disabled=true;$("#f2-print").disabled=true;$("#printHint").textContent="Speichern als Datei ist in dieser Ansicht nicht möglich. Öffne das Bestellbuch über deinen Link in claude.ai."}
  }
  if(db){
    mode="db"; $("#syncState").textContent="Online gespeichert · auf allen Geräten gleich";
    db.doc("einstellungen/plz").onSnapshot(d=>{plzEigen=(d.exists&&d.data().plz)||{};renderPlzTable();renderFahr()},()=>{});
    db.collection("einkauf").onSnapshot(s=>{einkauf={};s.docs.forEach(d=>einkauf[d.id]=d.data().tiere||{});syncEinkauf()},()=>{});
    db.collection("orders").onSnapshot(s=>{orders=s.docs.map(d=>norm({id:d.id,...d.data()}));renderAll()},
      e=>{$("#syncState").textContent="Verbindung unterbrochen. Seite neu laden.";});
  } else {
    mode="local"; orders=lsLoad(); try{einkauf=JSON.parse(localStorage.getItem(LS+"-einkauf")||"{}")}catch(e){einkauf={}} try{plzEigen=JSON.parse(localStorage.getItem(LS+"-plz")||"{}")}catch(e){plzEigen={}}
    $("#syncState").textContent="Nur in diesem Browser gespeichert";
    $("#banner").innerHTML=window.top===window
      ? `<div class="banner">Desktop-Version: Die Bestellungen werden nur in diesem Browser auf diesem PC gespeichert. Speichere zur Sicherheit regelmäßig die Excel-Liste (CSV) unter „Bestellungen“. Wenn du im Browser den Verlauf mit allen Website-Daten löschst, sind die Bestellungen weg.</div>`
      : `<div class="banner">Online-Speicher ist hier nicht verfügbar. Bestellungen bleiben nur in diesem Browser. Öffne das Bestellbuch über deinen claude.ai-Link, dann siehst du dieselben Bestellungen auf Handy und PC.</div>`;
    renderAll();
  }
})();

/* ---------- Formular ---------- */
let editId=null;
$("#dl-tiere").innerHTML=TIERE.map(t=>`<option value="${esc(t)}"${PREIS_VORSCHLAG[t]!=null?` label="${esc(eur(PREIS_VORSCHLAG[t]))}"`:""}>`).join("");
const fTour=$("#f-tour"), fOrt=$("#f-ort");
fTour.innerHTML=TOURS.map(t=>`<option value="${t.id}">${esc(t.nr+" – "+t.name)}</option>`).join("");
function fillOrte(sel){const t=tourById(fTour.value);fOrt.innerHTML=t.stops.map(s=>`<option value="${esc(s[1])}">${esc((s[0]?s[0]+" · ":"")+s[1]+" – "+s[2])}</option>`).join("");if(sel)fOrt.value=sel;toggleAdr()}
function toggleAdr(){const h=fOrt.value===HOME;$("#adrWrap").hidden=!h;$("#f-adresse").required=h}
fTour.addEventListener("change",()=>{fillOrte();toggleAdr()});fOrt.addEventListener("change",toggleAdr);
$("#f-datum").addEventListener("change",()=>{$("#f-rhythm").innerHTML=rhythmInfo($("#f-datum").value);suggestTour()});
function suggestTour(){
  if(editId) return;
  const v=$("#f-datum").value; if(!v) return; const n=Math.ceil(new Date(v+"T12:00").getDate()/7);
  const cur=tourById(fTour.value); if(cur&&cur.weeks.includes(n)&&(cur.tag??6)===new Date(v+"T12:00").getDay()) return;
  const wd=new Date(v+"T12:00").getDay();const t=TOURS.find(t=>t.id!=="R"&&(t.tag??6)===wd&&t.weeks.includes(n)); if(t){fTour.value=t.id;fillOrte()}
}
let posSeq=0;
function addPos(p={}){
  const i=posSeq++, div=document.createElement("div");div.className="pos";
  div.innerHTML=`<label>Tierart<input id="p-tier-${i}" class="p-tier" list="dl-tiere" value="${esc(p.tier||"")}" placeholder="Tierart wählen oder tippen"></label>
  <label>Anzahl<input id="p-anz-${i}" class="p-anz" type="number" min="1" step="1" inputmode="numeric" value="${esc(p.anzahl||"")}"></label>
  <label class="preis">€ / Stück (änderbar)<input id="p-preis-${i}" class="p-preis" type="number" min="0" step="0.5" inputmode="decimal" value="${p.preis!=null&&p.preis!==""?esc(p.preis):""}" placeholder="optional"></label>
  <button type="button" class="x" aria-label="Tierart entfernen">×</button>`;
  div.querySelector(".x").onclick=()=>{div.remove();if(!$("#posList").children.length)addPos();calcTotal()};
  const pr=div.querySelector(".p-preis");
  const tierIn=div.querySelector(".p-tier");
  const mark=()=>{const v=PREIS_VORSCHLAG[tierIn.value];pr.classList.toggle("sonder",pr.value!==""&&v!=null&&parseFloat(pr.value)!==v);pr.title=pr.classList.contains("sonder")?"Sonderpreis (Listenpreis "+eur(v)+")":""};
  pr.addEventListener("input",()=>{pr.dataset.auto="";mark()});
  tierIn.addEventListener("change",e=>{const v=PREIS_VORSCHLAG[e.target.value];
    if(!pr.value||pr.dataset.auto){if(v!=null){pr.value=v;pr.dataset.auto="1"}else if(pr.dataset.auto){pr.value="";pr.dataset.auto=""}}mark();calcTotal()});
  mark();
  div.addEventListener("input",calcTotal);
  $("#posList").appendChild(div);
}
function readPos(){return [...document.querySelectorAll(".pos")].map(d=>({tier:canonTier(d.querySelector(".p-tier").value.trim()),anzahl:parseInt(d.querySelector(".p-anz").value)||0,preis:d.querySelector(".p-preis").value===""?null:parseFloat(d.querySelector(".p-preis").value)})).filter(p=>p.tier&&p.anzahl>0)}
function readRabatt(){const art=$("#f-rabatt-art").value,w=parseFloat(String($("#f-rabatt").value).replace(",","."));return art&&w>0?{art,wert:w}:null}
function calcTotal(){const o={positionen:readPos(),rabatt:readRabatt()};const n=stueck(o),b=betrag(o),r=rabattEur(o);
  $("#f-total").textContent=n?`${n} Tiere${b||r?" · "+(r?eur(brutto(o))+" − "+eur(r)+" = ":"")+eur(b):""}`:"";
  $("#f-rabatt").disabled=!$("#f-rabatt-art").value;$("#f-rabatt").placeholder=$("#f-rabatt-art").value==="prozent"?"z. B. 5":$("#f-rabatt-art").value==="euro"?"z. B. 10":"–"}
$("#f-rabatt-art").addEventListener("change",()=>{if(!$("#f-rabatt-art").value)$("#f-rabatt").value="";calcTotal()});$("#f-rabatt").addEventListener("input",calcTotal);
$("#addPos").onclick=()=>addPos();
function resetForm(){
  editId=null;$("#form").reset();$("#f-status").value="offen";$("#posList").innerHTML="";addPos();addPos();
  $("#f-datum").value=lastDate||nextSaturday();
  if(lastTour){fTour.value=lastTour;fillOrte(lastOrt)}else{fillOrte();suggestTour()}
  $("#f-rhythm").innerHTML=rhythmInfo($("#f-datum").value);
  $("#formTitle").textContent="Neue Bestellung";$("#saveBtn").textContent="Bestellung speichern";$("#delWrap").innerHTML="";calcTotal();
}
let lastDate=null,lastTour=null,lastOrt=null;
function editOrder(id){
  const o=orders.find(x=>x.id===id);if(!o)return;editId=id;
  $("#f-kunde").value=o.kunde||"";$("#f-tel").value=o.telefon||"";$("#f-wohnort").value=o.wohnort||"";
  $("#f-datum").value=o.datum||"";fTour.value=o.tour;fillOrte(o.ort);$("#f-adresse").value=o.adresse||"";$("#f-status").value=o.status||"offen";$("#f-bem").value=o.bemerkung||"";
  $("#posList").innerHTML="";(o.positionen&&o.positionen.length?o.positionen:[{}]).forEach(addPos);
  $("#f-rabatt-art").value=o.rabatt&&o.rabatt.art||"";$("#f-rabatt").value=o.rabatt&&o.rabatt.wert?String(o.rabatt.wert).replace(".",","):"";
  $("#f-rhythm").innerHTML=rhythmInfo(o.datum);
  $("#formTitle").textContent="Bestellung bearbeiten: "+(o.kunde||"");$("#saveBtn").textContent="Änderungen speichern";
  $("#delWrap").innerHTML=`<button type="button" class="btn warn" id="delBtn">Löschen</button>`;
  $("#delBtn").onclick=()=>{$("#delWrap").innerHTML=`<span class="confirm">Wirklich löschen? <button type="button" class="btn warn" id="delYes">Ja, löschen</button><button type="button" class="btn ghost" id="delNo">Nein</button></span>`;
    $("#delYes").onclick=async()=>{try{await deleteOrder(id);toast("Bestellung gelöscht");resetForm()}catch(e){toast("Löschen fehlgeschlagen. Bitte erneut versuchen.")}};
    $("#delNo").onclick=()=>editOrder(id)};
  calcTotal();showTab("neu");setTimeout(()=>{const f=$("#form");f.scrollIntoView({behavior:"smooth",block:"start"});f.classList.add("blink");setTimeout(()=>f.classList.remove("blink"),1600)},30);
}
$("#f-kunde").addEventListener("change",()=>{
  if(editId)return;const k=$("#f-kunde").value.trim().toLowerCase();
  const prev=[...orders].reverse().find(o=>(o.kunde||"").toLowerCase()===k);
  if(prev){if(!$("#f-tel").value)$("#f-tel").value=prev.telefon||"";if(!$("#f-adresse").value&&prev.adresse)$("#f-adresse").value=prev.adresse;if(!$("#f-wohnort").value)$("#f-wohnort").value=prev.wohnort||""}
});
$("#resetBtn").onclick=resetForm;
$("#form").addEventListener("submit",async e=>{
  e.preventDefault();
  const pos=readPos();
  if(!pos.length){toast("Bitte mindestens eine Tierart mit Anzahl eintragen.");return}
  const now=new Date().toISOString(), old=editId?orders.find(o=>o.id===editId):null;
  const {id:_oid,...alt}=old||{};
  const o={...alt,kunde:$("#f-kunde").value.trim(),telefon:$("#f-tel").value.trim(),wohnort:$("#f-wohnort").value.trim(),
    datum:$("#f-datum").value,tour:fTour.value,ort:fOrt.value,adresse:fOrt.value===HOME?$("#f-adresse").value.trim():"",positionen:pos,status:$("#f-status").value,
    bemerkung:$("#f-bem").value.trim(),created:old?.created||now,updated:now};
  const rb=readRabatt(); if(rb) o.rabatt=rb; else delete o.rabatt;
  if(old?.beispiel) o.beispiel=true;if(old?.quelle) o.quelle=old.quelle;
  $("#saveBtn").disabled=true;
  try{await saveOrder(editId,o);lastDate=o.datum;lastTour=o.tour;lastOrt=o.ort;toast(editId?"Änderungen gespeichert":`Gespeichert: ${o.kunde}, ${stueck(o)} Tiere`);resetForm()}
  catch(err){toast(err&&err.code==="quota_exceeded"?"Speicher voll. Alte Bestellungen löschen.":"Speichern fehlgeschlagen. Bitte erneut versuchen.")}
  finally{$("#saveBtn").disabled=false}
});

/* ---------- Tabs ---------- */
function showTab(id){document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===id));
  ["neu","liste","kunden","kasse","fahrer","erinnern","bedarf","bestell","lade","fahr","nach","zahlen","app"].forEach(t=>$("#tab-"+t).hidden=t!==id);try{localStorage.setItem("holle-tab",id)}catch(e){}}
document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

/* ---------- Filter / Auswahl ---------- */
function dateOptions(sel,withAll){
  const ds=[...new Set(orders.map(o=>o.datum).filter(Boolean).concat([nextSaturday()]))].sort();
  const cur=sel.value;
  sel.innerHTML=(withAll?`<option value="">Alle Termine</option>`:"")+ds.map(d=>`<option value="${d}">${esc(dLong(d))}</option>`).join("");
  if(cur&&[...sel.options].some(o=>o.value===cur)) sel.value=cur; else if(!withAll) sel.value=nextSaturday(); else sel.value="";
}
function tourOptions(sel,allLabel){const cur=sel.value;sel.innerHTML=`<option value="">${allLabel}</option>`+TOURS.map(t=>`<option value="${t.id}">${esc(t.nr+" – "+t.name)}</option>`).join("");sel.value=cur||""}
tourOptions($("#l-tour"),"Alle Touren");tourOptions($("#p-tour"),"Alle Touren (je Tour eine Seite)");
["#l-datum","#l-tour","#l-q"].forEach(s=>$(s).addEventListener("input",renderList));
["#p-datum","#p-tour"].forEach(s=>$(s).addEventListener("input",renderPaper));

function sortOrders(a,b){return (a.datum||"").localeCompare(b.datum||"")||TOURS.findIndex(t=>t.id===a.tour)-TOURS.findIndex(t=>t.id===b.tour)||stopIdx(a)-stopIdx(b)||(a.kunde||"").localeCompare(b.kunde||"","de")}

/* ---------- Liste ---------- */
let listArchiv=false;
const heute=()=>iso(new Date());
const istAlt=o=>!!o.datum&&o.datum<heute();
function setArchiv(v){listArchiv=v;$("#l-akt").setAttribute("aria-pressed",String(!v));$("#l-alt").setAttribute("aria-pressed",String(v));$("#l-datum").value="";renderAll()}
$("#l-akt").onclick=()=>setArchiv(false);$("#l-alt").onclick=()=>setArchiv(true);
function renderList(){
  const d=$("#l-datum").value,t=$("#l-tour").value,q=$("#l-q").value.trim().toLowerCase();
  $("#l-n-akt").textContent=orders.filter(o=>!istAlt(o)).length; $("#l-n-alt").textContent=orders.filter(istAlt).length;
  const rows=orders.filter(o=>istAlt(o)===listArchiv).filter(o=>(!d||o.datum===d)&&(!t||o.tour===t)&&(!q||[o.kunde,o.ort,o.wohnort,o.adresse,o.telefon,tierText(o," ")].join(" ").toLowerCase().includes(q))).sort((a,b)=>listArchiv?((b.datum||"").localeCompare(a.datum||"")||sortOrders(a,b)):sortOrders(a,b));
  $("#l-body").innerHTML=rows.length?rows.map(o=>{const tr=tourById(o.tour);return `<tr class="row" data-id="${esc(o.id)}" tabindex="0">
    <td style="white-space:nowrap">${esc(dShort(o.datum))}</td>
    <td><span class="tourtag">${esc(tr?tr.nr:o.tour)}</span><br><span class="odot" style="background:${ortFarbe(o.ort)}"></span>${esc(o.ort)}${o.adresse?`<br><span class="sub">${esc(o.adresse)}</span>`:""}</td>
    <td><b>${esc(o.kunde)}</b>${o.beispiel?' <span class="chip bsp">Beispiel</span>':""}<br><span class="sub">${esc(o.telefon)}</span></td>
    <td>${esc(tierText(o,", "))}${o.bemerkung?`<br><span class="sub">${esc(o.bemerkung)}</span>`:""}</td>
    <td class="num">${stueck(o)}</td><td class="num">${betrag(o)?eur(betrag(o)):"–"}</td>
    <td><span class="chip ${esc(o.status)}">${esc(o.status||"offen")}</span></td></tr>`}).join("")
    :`<tr><td colspan="7" class="empty">Keine Bestellungen für diese Auswahl. Neue Bestellungen trägst du unter „Bestellung aufnehmen“ ein.</td></tr>`;
  const act=rows.filter(o=>o.status!=="storniert");
  $("#l-sum").textContent=rows.length?`${act.length} Bestellungen · ${act.reduce((a,o)=>a+stueck(o),0)} Tiere${act.some(betrag)?" · "+eur(act.reduce((a,o)=>a+betrag(o),0)):""}`:"";
  document.querySelectorAll("tr.row").forEach(r=>{r.onclick=()=>editOrder(r.dataset.id);r.onkeydown=e=>{if(e.key==="Enter")editOrder(r.dataset.id)}});
  const bsp=orders.filter(o=>o.beispiel);
  $("#bspWrap").innerHTML=bsp.length?`<div class="banner" style="margin-top:16px">Die mit „Beispiel“ markierten Bestellungen zeigen nur, wie die Ladeliste aussieht. <button class="btn warn" type="button" id="bspDel">${bsp.length} Beispiele löschen</button></div>`:"";
  if(bsp.length) $("#bspDel").onclick=async()=>{for(const o of bsp){try{await deleteOrder(o.id)}catch(e){}}toast("Beispiele gelöscht")};
}

/* ---------- Ladeliste ---------- */
const SHEET_CSS=`
.sheet{font:13px/1.35 Arial,Helvetica,sans-serif;color:#111}
.sheet .page{page-break-after:always;break-after:page}
.sheet .page:last-child{page-break-after:auto;break-after:auto}
.sheet .page+.page{margin-top:40px}
.sheet .hd{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;border-bottom:3px solid #111;padding-bottom:6px;margin-bottom:12px;flex-wrap:wrap}
.sheet .hd .t{font-size:30px;font-weight:800;letter-spacing:.02em;text-transform:uppercase;line-height:1}
.sheet .hd .tn{font-size:15px;font-weight:600;margin-top:3px}
.sheet .hd .dt{font-size:20px;font-weight:700;text-align:right}
.sheet .hd .meta{font-size:12px;text-align:right}
.sheet h2{font-size:15px;text-transform:uppercase;letter-spacing:.05em;margin:14px 0 6px}
.sheet table{width:100%;border-collapse:collapse}
.sheet th,.sheet td{border:1px solid #444;padding:5px 7px;text-align:left;vertical-align:top}
.sheet th{background:#e9e9e9;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
.sheet .r{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.sheet .sumwrap{display:flex;gap:100px;align-items:flex-start}
.sheet .sum{width:auto;flex:none}
.sheet .sum td:first-child,.sheet .sum th:first-child{white-space:nowrap}
.sheet .sum th.r,.sheet .sum td.r{width:1%;white-space:nowrap}
.sheet .extra{flex:1;min-width:0}
.sheet .extra td{height:22px}
.sheet .extra th.r,.sheet .extra td:last-child{width:60px}
.sheet .sum td.r{font-size:15px;font-weight:700}
.sheet .sum tr.tot td{border-top:2.5px solid #111;font-weight:800;font-size:15px}
.sheet .stop{margin-top:16px;break-inside:avoid;page-break-inside:avoid}
.sheet{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet .stop{border-left:8px solid var(--oc,#111);padding-left:8px}
.sheet .stop h3{font-size:16px;margin:0 0 4px;display:flex;gap:10px;flex-wrap:wrap;align-items:baseline;background:var(--oc,#111);color:#fff;padding:5px 8px}
.sheet .stop th{background:color-mix(in srgb,var(--oc,#111) 14%,#fff)}
.sheet .stop h3 .ad{font-weight:400;font-size:13px}
.sheet .stop h3 .cnt{margin-left:auto;font-size:13px}
.sheet .ck{width:26px}
.sheet td.ekc{width:120px}
.sheet input.ek{width:80px;font:inherit;text-align:right;border:1px solid #888;border-radius:4px;padding:3px 6px;background:#fffbe6;color:#111}
.sheet td.diff{width:80px}
.sheet .ck span{display:inline-block;width:14px;height:14px;border:1.5px solid #111}
.sheet .tiere{font-weight:700}
.sheet .note{font-size:11.5px;color:#333;font-style:italic}
.sheet .load{font-size:12px;margin-top:4px}
.sheet .none{padding:20px;border:1px dashed #888;text-align:center}
.sheet.fahr table{font-size:20px}
.sheet.fahr th{font-size:13px}
.sheet.fahr td{padding:10px 10px}
.sheet.fahr td.zeit{font-weight:800;width:1%;white-space:nowrap}
.sheet.fahr td.ort{font-weight:700}
.sheet.fahr td.adr{font-size:18px}
.sheet.fahr .laden{font-weight:400;font-size:16px;color:#333}
.sheet.fahr .fehlt{font-size:12px;color:#b00}
.sheet.fahr td.kn{width:1%;font-weight:800}
.sheet.fahr tr.home td{background:#f1f1f1}
.sheet.nach td{padding-top:0;padding-bottom:0}
.sheet.nach .nfeld{display:flex;gap:30px;margin:4px 0 12px;font-size:15px;font-weight:700}
.sheet.nach .nfeld i{display:inline-block;width:140px;border-bottom:1.5px solid #111;margin-left:6px}
.sheet.nach .nfeld i.w{width:260px}
.sheet .foot{font-size:10px;color:#555;margin-top:14px}`;
(()=>{const s=document.createElement("style");s.textContent=SHEET_CSS;document.head.appendChild(s)})();

function tierSumme(list){const m=new Map();list.forEach(o=>(o.positionen||[]).forEach(p=>{if(p.tier&&+p.anzahl)m.set(p.tier,(m.get(p.tier)||0)+ +p.anzahl)}));return [...m.entries()].sort((a,b)=>a[0].localeCompare(b[0],"de"))}
function buildSheet(datum,tourId){
  const act=orders.filter(o=>o.datum===datum&&o.status!=="storniert");
  const tours=tourId?[tourById(tourId)]:TOURS.filter(t=>act.some(o=>o.tour===t.id));
  if(!tours.length) return `<div class="sheet"><div class="none">Für ${esc(dLong(datum))} gibt es noch keine Bestellungen.</div></div>`;
  const stamp=new Date().toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
  return `<div class="sheet">`+tours.map(t=>{
    const list=act.filter(o=>o.tour===t.id).sort(sortOrders);
    const sum=tierSumme(list), total=sum.reduce((a,x)=>a+x[1],0);
    let h=`<section class="page"><div class="hd"><div><div class="t">${esc(t.nr)}</div><div class="tn">${esc(t.name)}</div></div>
      <div><div class="dt">${esc(dLong(datum))}</div><div class="meta">${list.length} Kunden · ${total} Tiere</div></div></div>`;
    if(!list.length) return h+`<div class="none">Keine Bestellungen für diese Tour.</div></section>`;
    const extraRows=Math.max(sum.length+1,8);
    h+=`<h2>Ladung gesamt</h2><div class="sumwrap"><table class="sum"><thead><tr><th>Tierart</th><th class="r">Stück</th></tr></thead><tbody>`+
      sum.map(([k,v])=>`<tr><td>${esc(k)}</td><td class="r">${v}</td></tr>`).join("")+
      `<tr class="tot"><td>Gesamt</td><td class="r">${total}</td></tr></tbody></table>`+
      `<table class="extra"><thead><tr><th>Zusätzlich am Stall aufgeladen</th><th class="r">Stück</th></tr></thead><tbody>`+
      Array.from({length:extraRows},()=>`<tr><td>&nbsp;</td><td></td></tr>`).join("")+`</tbody></table></div>`;
    h+=`<h2>Kunden je Abholort</h2>`;
    const known=t.stops.map(s=>s[1]);
    const groups=t.stops.map(s=>({s,os:list.filter(o=>o.ort===s[1])})).filter(g=>g.os.length);
    const rest=list.filter(o=>!known.includes(o.ort));if(rest.length)groups.push({s:["","Sonstige",""],os:rest});
    groups.forEach(({s,os})=>{
      const n=os.reduce((a,o)=>a+stueck(o),0), ls=tierSumme(os);
      const fc=ortFarbe(s[1]);h+=`<div class="stop" style="--oc:${fc}"><h3>${s[0]?esc(s[0])+" Uhr · ":""}${esc(s[1])} <span class="ad">${esc(s[1]===HOME?s[2]:([halt(s[1]).laden,navi(halt(s[1]))].filter(Boolean).join(" · ")||s[2]))}</span><span class="cnt">${os.length} Kunden · ${n} Tiere</span></h3>
      <table><thead><tr><th class="ck">✓</th><th>Kunde</th><th>Telefon</th><th>Bekommt</th><th class="r">Stück</th><th class="r">Betrag</th></tr></thead><tbody>`+
      os.map(o=>`<tr><td class="ck"><span></span></td><td><b>${esc(o.kunde)}</b>${o.adresse?`<br><b>${esc(o.adresse)}</b>`:o.wohnort?`<br>${esc(o.wohnort)}`:""}</td><td style="white-space:nowrap">${esc(o.telefon)}</td>
        <td><span class="tiere">${esc(tierText(o,"\n")).replace(/\n/g,"<br>")}</span>${o.bemerkung?`<div class="note">${esc(o.bemerkung)}</div>`:""}</td>
        <td class="r">${stueck(o)}</td><td class="r">${betrag(o)?esc(eur(betrag(o))):""}</td></tr>`).join("")+
      `</tbody></table><div class="load"><b>Für diesen Halt laden:</b> ${ls.map(([k,v])=>`${v} ${esc(k)}`).join(" · ")}</div></div>`;
    });
    return h+`<div class="foot">Geflügelverkauf Holle · Stand ${esc(stamp)}</div></section>`;
  }).join("")+`</div>`;
}
function renderPaper(){$("#paper").innerHTML=buildSheet($("#p-datum").value,$("#p-tour").value)}
$("#printBtn").onclick=async()=>{
  if(!dl){ if(window.top===window) window.print(); return; }
  const d=$("#p-datum").value,t=$("#p-tour").value,tr=t?tourById(t):null;
  const doc=`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Ladeliste ${esc(dLong(d))}</title><style>@page{size:A4;margin:12mm}body{margin:0;padding:8px}${SHEET_CSS}@media print{.sheet .page+.page{margin-top:0}}</style></head><body>${buildSheet(d,t)}<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`;
  try{await dl.save({filename:`Ladeliste_${d}${tr?"_"+tr.nr.replace(/\s/g,""):""}.html`,data:doc});toast("Ladeliste gespeichert. Datei öffnen und drucken.")}
  catch(e){if(e&&e.code!=="declined")toast("Speichern nicht möglich. Bitte erneut versuchen.")}
};
$("#csvBtn").onclick=async()=>{
  if(!dl&&window.top!==window)return;const d=$("#l-datum").value,t=$("#l-tour").value;
  const rows=orders.filter(o=>istAlt(o)===listArchiv&&(!d||o.datum===d)&&(!t||o.tour===t)).sort(sortOrders);
  const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
  const lines=[["Datum","Tour","Abholort","Kunde","Telefon","Wohnort","Lieferadresse","Tierart","Anzahl","Preis/Stück","Status","Bemerkung"].join(";")];
  rows.forEach(o=>(o.positionen||[]).forEach(p=>lines.push([o.datum,tourById(o.tour)?.nr||o.tour,o.ort,o.kunde,o.telefon,o.wohnort,o.adresse,p.tier,p.anzahl,p.preis!=null?String(p.preis).replace(".",","):"",o.status,o.bemerkung].map(q).join(";"))));
  const csv="﻿"+lines.join("\r\n"), fn=`Bestellungen_${d||"alle"}.csv`;
  if(!dl){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=fn;document.body.appendChild(a);a.click();a.remove();toast("Liste gespeichert");return}
  try{await dl.save({filename:fn,data:csv});toast("Liste gespeichert")}
  catch(e){if(e&&e.code!=="declined")toast("Speichern nicht möglich.")}
};

/* ---------- Tierbedarf ---------- */
const MON=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const MONK=["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
const ym=(y,m)=>`${y}-${String(m).padStart(2,"0")}`;
const ymLabel=k=>{const[y,m]=k.split("-");return MONK[+m-1]+" "+y.slice(2)};
const ymLong=k=>{const[y,m]=k.split("-");return MON[+m-1]+" "+y};
function setupBedarf(){
  const now=new Date(),y0=now.getFullYear(),cm=now.getMonth();
  const D=(y,m,d)=>iso(new Date(y,m,d)), add=n=>{const x=new Date(now);x.setDate(x.getDate()+n);return iso(x)};
  const set=(v,b)=>{$("#b-von").value=v;$("#b-bis").value=b;renderBedarf()};
  const Q=[["Nächste 7 Tage",()=>set(iso(now),add(7))],["Nächste 4 Wochen",()=>set(iso(now),add(28))],
    ["Dieser Monat",()=>set(D(y0,cm,1),D(y0,cm+1,0))],["Nächster Monat",()=>set(D(y0,cm+1,1),D(y0,cm+2,0))],
    ["Ab heute bis Ende "+y0,()=>set(iso(now),D(y0,11,31))],["Ganzes Jahr "+y0,()=>set(D(y0,0,1),D(y0,11,31))],
    ["Saison "+(y0+1)+" (März–Okt.)",()=>set(D(y0+1,2,1),D(y0+1,9,31))],["Ganzes Jahr "+(y0+1),()=>set(D(y0+1,0,1),D(y0+1,11,31))]];
  $("#b-quick").innerHTML=Q.map((q,i)=>`<button type="button" data-i="${i}">${esc(q[0])}</button>`).join("");
  $("#b-quick").querySelectorAll("button").forEach(b=>b.onclick=()=>Q[+b.dataset.i][1]());
  set(iso(now),D(y0,11,31));
  ["#b-von","#b-bis","#b-tier","#b-mode"].forEach(s=>$(s).addEventListener("input",renderBedarf));
}
function bedarfData(){
  let von=$("#b-von").value, bis=$("#b-bis").value;
  if(von&&bis&&von>bis)[von,bis]=[bis,von];
  const q=$("#b-tier").value.trim().toLowerCase(), mode=$("#b-mode").value;
  const os=orders.filter(o=>o.datum&&o.status!=="storniert"&&(mode==="alle"||o.status!=="abgeholt")&&(!von||o.datum>=von)&&(!bis||o.datum<=bis));
  const dates=[...new Set(os.map(o=>o.datum))].sort();
  const perDay=dates.length<=8;
  const keyOf=d=>perDay?d:d.slice(0,7);
  const cols=[...new Set(dates.map(keyOf))].map(k=>({k,label:perDay?dShort(k):ymLabel(k),long:perDay?dLong(k):ymLong(k)}));
  const rows=new Map(), lines=[];
  os.forEach(o=>(o.positionen||[]).forEach(p=>{
    if(!p.tier||!(+p.anzahl))return; if(q&&!p.tier.toLowerCase().includes(q))return;
    const k=keyOf(o.datum); if(!rows.has(p.tier))rows.set(p.tier,{});
    const r=rows.get(p.tier); r[k]=(r[k]||0)+ +p.anzahl; lines.push({o,p});
  }));
  const list=[...rows.entries()].map(([t,r])=>({t,r,sum:Object.values(r).reduce((a,b)=>a+b,0)})).sort((a,b)=>b.sum-a.sum||a.t.localeCompare(b.t,"de"));
  return {von,bis,cols,list,lines,q};
}
function renderBedarf(){
  if(!$("#b-von")) return;
  const {von,bis,cols,list,lines,q}=bedarfData();
  const total=list.reduce((a,x)=>a+x.sum,0), kunden=new Set(lines.map(l=>l.o.id)).size;
  const fd=d=>new Date(d+"T12:00").toLocaleDateString("de-DE");
  const zr=von&&bis?(von===bis?fd(von):fd(von)+" bis "+fd(bis)):von?"ab "+fd(von):bis?"bis "+fd(bis):"alle Termine";
  $("#b-kpis").innerHTML=`<div class="kpi"><b>${total}</b><span>Tiere ${$("#b-mode").value==="offen"?"noch benötigt":"bestellt"}</span></div>
    <div class="kpi"><b>${list.length}</b><span>Tierarten</span></div><div class="kpi"><b>${kunden}</b><span>Bestellungen</span></div>
    <div class="kpi" style="align-self:flex-end"><span style="text-transform:none;letter-spacing:0;font-size:.95rem">${esc(zr)}${q?" · Suche „"+esc($("#b-tier").value.trim())+"“":""}</span></div>`;
  if(!list.length){$("#b-table").innerHTML=`<tbody><tr><td class="empty">Für diesen Zeitraum gibt es keine passenden Bestellungen.</td></tr></tbody>`;$("#b-detail").innerHTML="";return}
  const many=cols.length>1&&cols.length<=24;
  let h=`<thead><tr><th>Tierart</th>${many?cols.map(c=>`<th class="num">${esc(c.label)}</th>`).join(""):""}<th class="num">Gesamt</th></tr></thead><tbody>`;
  h+=list.map(x=>`<tr><td>${esc(x.t)}</td>${many?cols.map(({k})=>`<td class="num${x.r[k]?"":" zero"}">${x.r[k]||"–"}</td>`).join(""):""}<td class="num big">${x.sum}</td></tr>`).join("");
  h+=`<tr class="tot"><td>Gesamt</td>${many?cols.map(({k})=>`<td class="num">${list.reduce((a,x)=>a+(x.r[k]||0),0)||"–"}</td>`).join(""):""}<td class="num">${total}</td></tr></tbody>`;
  $("#b-table").innerHTML=h;
  if(q){
    const ls=lines.sort((a,b)=>sortOrders(a.o,b.o));
    $("#b-detail").innerHTML=`<div class="section-h">Wer hat bestellt</div><div class="tablewrap"><table class="list"><thead><tr><th>Datum</th><th>Tour · Abholort</th><th>Kunde</th><th>Tierart</th><th class="num">Stück</th><th>Status</th></tr></thead><tbody>`+
      ls.map(({o,p})=>`<tr class="row" data-id="${esc(o.id)}" tabindex="0"><td style="white-space:nowrap">${esc(dShort(o.datum))}</td><td><span class="tourtag">${esc(tourById(o.tour)?.nr||o.tour)}</span><br>${esc(o.ort)}</td><td><b>${esc(o.kunde)}</b><br><span class="sub">${esc(o.telefon)}</span></td><td>${esc(p.tier)}</td><td class="num">${+p.anzahl}</td><td><span class="chip ${esc(o.status)}">${esc(o.status||"offen")}</span></td></tr>`).join("")+`</tbody></table></div>`;
    $("#b-detail").querySelectorAll("tr.row").forEach(r=>{r.onclick=()=>editOrder(r.dataset.id);r.onkeydown=e=>{if(e.key==="Enter")editOrder(r.dataset.id)}});
  } else $("#b-detail").innerHTML=`<p class="hint">Tipp: Gib oben eine Tierart ein, z. B. „Olivleger“, dann siehst du zusätzlich, welche Kunden sie bestellt haben.</p>`;
}
$("#b-csv").onclick=async()=>{
  if(!dl&&window.top!==window)return;
  const {von,bis,cols,list}=bedarfData(), q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
  const lines=[["Tierart",...cols.map(c=>c.long),"Gesamt"].map(q).join(";")].concat(list.map(x=>[x.t,...cols.map(({k})=>x.r[k]||0),x.sum].map(q).join(";")));
  const csv="\ufeff"+lines.join("\r\n"), fn=`Tierbedarf_${von}_bis_${bis}.csv`;
  if(!dl){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=fn;document.body.appendChild(a);a.click();a.remove();toast("Übersicht gespeichert");return}
  try{await dl.save({filename:fn,data:csv});toast("Übersicht gespeichert")}catch(e){if(e&&e.code!=="declined")toast("Speichern nicht möglich.")}
};
setupBedarf();

/* ---------- Bestellliste ---------- */
const KAT_FEST={
 "Enten":["Flugenten","Flugerpel","Mularden","Dänenenten","Wildenten","Landenten","Laufenten","Lauferpel","Sachsenenten"],
 "Gänse":["Gänse / Gössel"],
 "Mast":["Mastküken","Masthähnchen 3 Wochen","Masthähnchen schlachtreif"],
 "Puten":["Weiße Puten","Bronzeputen"],
 "Wachteln":["Wachtelhennen","Wachtelhähne"],
 "Perlhühner":["Perlhühner"],
 "Fasane":["Fasane"]};
const LISTE_A=["Hybridhennen","Enten","Gänse","Mast","Puten","Wachteln","Perlhühner","Fasane","Sonstige"];
function kategorie(t){
  t=canonTier(t);
  for(const [k,l] of Object.entries(KAT_FEST)) if(l.includes(t)) return k;
  const hm=t.match(/^(.*) Hahn$/i); if(hm&&!TIERE.includes(t)) return kategorie(hm[1]);
  if(HYBRID_EXTRA.includes(t.toLowerCase())) return "Hybridhennen";
  const i=TIERE.indexOf(t), ia=TIERE.indexOf("Araucana"), ie=TIERE.indexOf("Moderner Englischer Zwergkämpfer Hahn");
  if(i>=0&&i<ia) return "Hybridhennen";
  if(i>=ia&&i<=ie) return "Rassehühner";
  return "Sonstige";
}
function bestellData(){
  let v=$("#o-von").value,b=$("#o-bis").value; if(v&&b&&v>b)[v,b]=[b,v];
  const mode=$("#o-mode").value;
  const os=orders.filter(o=>o.datum&&(!v||o.datum>=v)&&(!b||o.datum<=b)&&o.status!=="storniert"&&(mode==="alle"||o.status!=="abgeholt"));
  const dates=[...new Set(os.map(o=>o.datum))].sort();
  const kat={};
  os.forEach(o=>(o.positionen||[]).forEach(p=>{if(!p.tier||!(+p.anzahl))return;const k=kategorie(p.tier);
    kat[k]=kat[k]||{};const r=kat[k][p.tier]=kat[k][p.tier]||{};r[o.datum]=(r[o.datum]||0)+ +p.anzahl}));
  return {v,b,dates,kat,n:os.length};
}
const katSort=(k,r)=>Object.keys(r).sort((a,b)=>{const ia=TIERE.indexOf(a),ib=TIERE.indexOf(b);return (ia<0?999:ia)-(ib<0?999:ib)||a.localeCompare(b,"de")});
let einkauf={};
const ekKey=()=>($("#o-von").value||"x")+"_"+($("#o-bis").value||"x");
async function saveEinkauf(tier,val){
  const k=ekKey(), cur={...(einkauf[k]||{})};
  if(val===""||isNaN(val)) delete cur[tier]; else cur[tier]=val;
  einkauf[k]=cur;
  try{ if(db) await db.doc("einkauf/"+k).set({tiere:cur,von:$("#o-von").value,bis:$("#o-bis").value,updated:new Date().toISOString()});
       else localStorage.setItem(LS+"-einkauf",JSON.stringify(einkauf)); }
  catch(e){toast("Speichern fehlgeschlagen. Bitte erneut versuchen.")}
  syncEinkauf();
}
function diffCell(need,got){ if(got===undefined||got==="") return ""; const d=got-need; return `<span style="font-weight:700;color:${d<0?"#c62828":"#2e7d32"}">${d>0?"+":""}${d}</span>`; }
function syncEinkauf(){
  const cur=einkauf[ekKey()]||{};
  document.querySelectorAll("#o-paper input.ek").forEach(i=>{const v=cur[i.dataset.tier];
    if(document.activeElement!==i) i.value=v??"";
    const dc=i.closest("tr").querySelector(".diff"); if(dc) dc.innerHTML=diffCell(+i.dataset.need, v);});
}
function buildBestell(forPrint){
  const {v,b,dates,kat,n}=bestellData(), which=$("#o-liste").value;
  const zr=v&&b?(v===b?dLong(v):dShort(v)+" bis "+dShort(b)):v?"ab "+dShort(v):b?"bis "+dShort(b):"alle Termine";
  const cols=dates.length>1&&dates.length<=8?dates:[];
  const stamp=new Date().toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
  const ek=einkauf[ekKey()]||{};
  const table=(k)=>{const r=kat[k];if(!r)return"";const ts=katSort(k,r);
    const sum=t=>Object.values(r[t]).reduce((a,x)=>a+x,0), tot=ts.reduce((a,t)=>a+sum(t),0);
    return `<div class="stop" style="--oc:#333"><h3>${esc(k)}<span class="cnt">${tot} Tiere</span></h3><table><thead><tr><th class="ck">✓</th><th>Tierart</th>${cols.map(d=>`<th class="r">${esc(dShort(d))}</th>`).join("")}<th class="r">Benötigt</th><th class="r">Tatsächlich bestellt</th><th class="r">Differenz</th></tr></thead><tbody>`+
      ts.map(t=>{const got=ek[t];return `<tr><td class="ck"><span></span></td><td>${esc(t)}</td>${cols.map(d=>`<td class="r">${r[t][d]||""}</td>`).join("")}<td class="r"><b>${sum(t)}</b></td>`+
        `<td class="r ekc">${forPrint?(got??""):`<input class="ek" type="number" min="0" step="1" inputmode="numeric" data-tier="${esc(t)}" data-need="${sum(t)}" value="${got??""}" aria-label="Tatsächlich bestellt ${esc(t)}">`}</td>`+
        `<td class="r diff">${diffCell(sum(t),got)}</td></tr>`}).join("")+`</tbody></table></div>`};
  const page=(title,keys)=>{const has=keys.some(k=>kat[k]);const tot=keys.reduce((a,k)=>a+Object.values(kat[k]||{}).reduce((x,r)=>x+Object.values(r).reduce((y,z)=>y+z,0),0),0);
    return `<section class="page"><div class="hd"><div><div class="t">Bestellliste</div><div class="tn">${esc(title)}</div></div><div><div class="dt">${esc(zr)}</div><div class="meta">${tot} Tiere</div></div></div>`+
    (has?keys.map(table).join(""):`<div class="none">Keine Bestellungen in diesem Zeitraum.</div>`)+`<div class="foot">Geflügelverkauf Holle · Stand ${esc(stamp)}</div></section>`};
  let h="";
  if(which!=="B") h+=page("Hybridhennen · Enten · Gänse · Mast · Puten · Wachteln · Perlhühner",LISTE_A);
  if(which!=="A") h+=page("Rassehühner",["Rassehühner"]);
  return `<div class="sheet">${h}</div>`;
}
function renderBestell(){
  const pp=$("#o-paper"); if(!pp) return;
  if(pp.contains(document.activeElement)&&document.activeElement.matches("input.ek")){pp.dataset.stale="1";return}
  pp.innerHTML=buildBestell(false); delete pp.dataset.stale;
  pp.querySelectorAll("input.ek").forEach(i=>{
    i.addEventListener("change",()=>saveEinkauf(i.dataset.tier,i.value===""?"":parseInt(i.value)));
    i.addEventListener("input",()=>{const dc=i.closest("tr").querySelector(".diff");dc.innerHTML=diffCell(+i.dataset.need,i.value===""?"":parseInt(i.value))});
    i.addEventListener("blur",()=>{if(pp.dataset.stale)setTimeout(renderBestell,0)});
  });
}
(()=>{
  const t=new Date(), set=(a,b)=>{$("#o-von").value=a;$("#o-bis").value=b;renderBestell()};
  const add=d=>{const x=new Date(t);x.setDate(x.getDate()+d);return iso(x)};
  const y=t.getFullYear(), m=t.getMonth();
  const mEnd=(yy,mm)=>iso(new Date(yy,mm+1,0)), mStart=(yy,mm)=>iso(new Date(yy,mm,1));
  const Q=[["Nächster Samstag",()=>set(nextSaturday(),nextSaturday())],["Nächste 2 Wochen",()=>set(iso(t),add(14))],["Nächste 4 Wochen",()=>set(iso(t),add(28))],
    ["Dieser Monat",()=>set(mStart(y,m),mEnd(y,m))],["Nächster Monat",()=>set(mStart(y,m+1),mEnd(y,m+1))],["Alle offenen ab heute",()=>set(iso(t),"")]];
  $("#o-quick").innerHTML=Q.map((q,i)=>`<button type="button" data-i="${i}">${esc(q[0])}</button>`).join("");
  $("#o-quick").querySelectorAll("button").forEach(b=>b.onclick=()=>Q[+b.dataset.i][1]());
  $("#o-von").value=iso(t);$("#o-bis").value=add(28);
  ["#o-von","#o-bis","#o-liste","#o-mode"].forEach(s=>$(s).addEventListener("input",renderBestell));
})();
$("#o-print").onclick=async()=>{
  if(!dl){ if(window.top===window) window.print(); return; }
  const doc=`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Bestellliste</title><style>@page{size:A4;margin:12mm}body{margin:0;padding:8px}${SHEET_CSS}@media print{.sheet .page+.page{margin-top:0}}</style></head><body>${buildBestell(true)}<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`;
  try{await dl.save({filename:`Bestellliste_${$("#o-von").value||"alle"}_bis_${$("#o-bis").value||"offen"}.html`,data:doc});toast("Bestellliste gespeichert. Datei öffnen und drucken.")}
  catch(e){if(e&&e.code!=="declined")toast("Speichern nicht möglich.")}
};
$("#o-csv").onclick=async()=>{
  if(!dl&&window.top!==window)return;
  const {dates,kat}=bestellData(), q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
  const ek=einkauf[ekKey()]||{};
  const lines=[["Liste","Kategorie","Tierart",...dates.map(dShort),"Benötigt","Tatsächlich bestellt","Differenz"].map(q).join(";")];
  [...LISTE_A,"Rassehühner"].forEach(k=>{const r=kat[k];if(!r)return;katSort(k,r).forEach(t=>lines.push([k==="Rassehühner"?"Rassehühner":"Hybriden & Co.",k,t,...dates.map(d=>r[t][d]||0),...(n=>[n,ek[t]??"",ek[t]===undefined?"":ek[t]-n])(Object.values(r[t]).reduce((a,x)=>a+x,0))].map(q).join(";")))});
  const csv="\ufeff"+lines.join("\r\n"), fn=`Bestellliste_${$("#o-von").value||"alle"}.csv`;
  if(!dl){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=fn;document.body.appendChild(a);a.click();a.remove();toast("Liste gespeichert");return}
  try{await dl.save({filename:fn,data:csv});toast("Liste gespeichert")}catch(e){if(e&&e.code!=="declined")toast("Speichern nicht möglich.")}
};

/* ---------- Nachweisliste ---------- */
function buildNachweis(){
  const k=$("#n-kopf").value, n=+$("#n-zeilen").value;
  const kopfe=k==="*"?["Kreis Eichsfeld","Raum Hildesheim","onOvo Tour","Norddeutschland","Markt Weikersheim","Rietberg"]:[k];
  return `<div class="sheet nach">`+kopfe.map(t=>`<section class="page">
    <div class="hd"><div><div class="t">${esc(t)}</div><div class="tn">Nachweis über die Abgabe von Geflügel</div></div>
      <div style="text-align:right;font-size:12px;line-height:1.4"><b>Geflügelverkauf Holle</b><br>Eberhard-Unkraut-Straße 76<br>33397 Rietberg · 0157 / 80267793</div></div>
    <div class="nfeld"><span>Datum: <i></i></span><span>Haltepunkt: <i class="w"></i></span></div>
    <table><thead><tr><th class="r" style="width:32px">Nr.</th><th style="width:26%">Name, Vorname</th><th>Anschrift (Straße, Hausnummer, PLZ, Ort)</th><th class="r" style="width:90px">Anzahl Tiere</th></tr></thead><tbody>`+
    Array.from({length:n},(_,i)=>`<tr style="height:${Math.floor(740/n)}px"><td class="r">${i+1}</td><td></td><td></td><td></td></tr>`).join("")+
    `</tbody></table><div class="foot">Die Angaben dienen dem Nachweis gegenüber dem zuständigen Veterinäramt, wohin die Tiere abgegeben wurden.</div></section>`).join("")+`</div>`;
}
function renderNachweis(){ $("#n-paper").innerHTML=buildNachweis(); }
["#n-kopf","#n-zeilen"].forEach(x=>$(x).addEventListener("input",renderNachweis));
/* Mini-PDF ohne Bibliothek: Helvetica, Linien, Rechtecke */
function miniPdf(pages){
  const enc=t=>{let o="";for(const ch of String(t)){let c=ch.charCodeAt(0);if(ch==="–")c=0x96;else if(ch==="·")c=0xB7;else if(c>255)c=63;
    o+=(c===40||c===41||c===92)?"\\"+ch:(c<32||c>126)?"\\"+c.toString(8).padStart(3,"0"):ch;}return o};
  const P=v=>(v*72/25.4).toFixed(2), Y=v=>(841.89-v*72/25.4).toFixed(2);
  const objs=[]; const add=x=>{objs.push(x);return objs.length};
  const cat=add(""),pagesId=add(""),f1=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"),f2=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const kids=[];
  pages.forEach(ops=>{
    let c="";
    ops.forEach(o=>{
      if(o.t==="text") c+=`BT /${o.b?"F2":"F1"} ${o.s} Tf ${o.g!=null?o.g+" g ":"0 g "}${P(o.x)} ${Y(o.y)} Td (${enc(o.v)}) Tj ET\n`;
      else if(o.t==="line") c+=`${(o.w||0.25)*72/25.4} w 0 G ${P(o.x1)} ${Y(o.y1)} m ${P(o.x2)} ${Y(o.y2)} l S\n`;
      else if(o.t==="rect") c+=`${o.g} g ${P(o.x)} ${Y(o.y+o.h)} ${P(o.w)} ${(o.h*72/25.4).toFixed(2)} re f 0 g\n`;
    });
    const cs=add(`<< /Length ${c.length} >>\nstream\n${c}endstream`);
    kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${cs} 0 R >>`));
  });
  objs[cat-1]=`<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objs[pagesId-1]=`<< /Type /Pages /Kids [${kids.map(k=>k+" 0 R").join(" ")}] /Count ${kids.length} >>`;
  let out="%PDF-1.4\n",offs=[];
  objs.forEach((o,i)=>{offs.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
  const x=out.length; out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+offs.map(n=>String(n).padStart(10,"0")+" 00000 n \n").join("")+`trailer\n<< /Size ${objs.length+1} /Root ${cat} 0 R >>\nstartxref\n${x}\n%%EOF`;
  const bytes=new Uint8Array(out.length); for(let i=0;i<out.length;i++) bytes[i]=out.charCodeAt(i)&255;
  return new Blob([bytes],{type:"application/pdf"});
}
function nachweisPdf(){
  const k=$("#n-kopf").value, n=+$("#n-zeilen").value;
  const kopfe=k==="*"?["Kreis Eichsfeld","Raum Hildesheim","onOvo Tour","Norddeutschland","Markt Weikersheim","Rietberg"]:[k];
  const L=15,R=195;
  const pages=kopfe.map(t=>{
    const o=[];
    o.push({t:"text",b:1,s:22,x:L,y:22,v:t.toUpperCase()},{t:"text",b:1,s:11,x:L,y:29,v:"Nachweis über die Abgabe von Geflügel"});
    o.push({t:"text",b:1,s:9,x:140,y:17,v:"Geflügelverkauf Holle"},{t:"text",s:9,x:140,y:22,v:"Eberhard-Unkraut-Straße 76"},{t:"text",s:9,x:140,y:27,v:"33397 Rietberg · 0157 / 80267793"});
    o.push({t:"line",w:0.8,x1:L,y1:32,x2:R,y2:32});
    o.push({t:"text",b:1,s:11,x:L,y:42,v:"Datum:"},{t:"line",x1:L+15,y1:42.5,x2:L+60,y2:42.5});
    o.push({t:"text",b:1,s:11,x:L+70,y:42,v:"Haltepunkt:"},{t:"line",x1:L+93,y1:42.5,x2:R,y2:42.5});
    const cols=[10,47,98,25],x=[L];cols.forEach(c=>x.push(x[x.length-1]+c));
    const top=50,hh=8,rh=(262-top-hh)/n;
    o.push({t:"rect",g:0.91,x:L,y:top,w:R-L,h:hh});
    ["NR.","NAME, VORNAME","ANSCHRIFT (STRASSE, HAUSNUMMER, PLZ, ORT)","ANZAHL TIERE"].forEach((h,i)=>o.push({t:"text",b:1,s:8,x:x[i]+1.5,y:top+5.3,v:h}));
    o.push({t:"line",x1:L,y1:top,x2:R,y2:top});
    for(let r=0;r<=n;r++){const y=top+hh+r*rh;o.push({t:"line",x1:L,y1:y,x2:R,y2:y});
      if(r<n){const v=String(r+1);o.push({t:"text",s:9,x:x[1]-1.5-v.length*1.765,y:y+4,v})}}
    x.forEach(xx=>o.push({t:"line",x1:xx,y1:top,x2:xx,y2:top+hh+n*rh}));
    o.push({t:"text",s:7.5,g:0.35,x:L,y:top+hh+n*rh+6,v:"Die Angaben dienen dem Nachweis gegenüber dem zuständigen Veterinäramt, wohin die Tiere abgegeben wurden."});
    return o;
  });
  return {blob:miniPdf(pages),name:`Nachweisliste_${k==="*"?"alle":k.replace(/\s/g,"_")}.pdf`};
}
$("#n-print").onclick=async()=>{
  const {blob,name}=nachweisPdf();
  if(!dl){ if(window.top!==window) return; const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();toast("PDF gespeichert");return; }
  try{await dl.save({filename:name,data:blob});toast("PDF gespeichert")}
  catch(e){if(e&&e.code!=="declined")toast("Speichern nicht möglich.")}
};
renderNachweis();

/* ---------- Fahrplan ---------- */
const HALT_START_NEU={"Bispingen":{"laden":"Kiebitzmarkt Renken","str":"Bahnhofstr. 21","plz":"29646","stadt":"Bispingen"},"Rosengarten":{"laden":"Raisa","str":"Bremer Str. 12","plz":"21224","stadt":"Rosengarten"},"Stockelsdorf":{"laden":"Futterhandel Dirk Ullrich","str":"Ahrenböcker Str. 21","plz":"23617","stadt":"Stockelsdorf"},"Weikersheim":{"laden":"Vereinsgelände Kleintierzuchtverein Z6","str":"Uferweg 19","plz":"97990","stadt":"Weikersheim"}};
const HALT_START={"Diemelstadt": {"laden": "SVG Rastplatz A44", "str": "", "plz": "34474", "stadt": "Diemelstadt"}, "Burghasungen (Zierenberg)": {"laden": "Pendlerparkplatz A44", "str": "", "plz": "34289", "stadt": "Zierenberg-Burghasungen"}, "Dramfeld": {"laden": "", "str": "Hauptstraße 59", "plz": "37124", "stadt": "Rosdorf-Dramfeld"}, "Teistungen": {"laden": "Gemeindehaus (Parkplatz)", "str": "", "plz": "37339", "stadt": "Teistungen"}, "Worbis": {"laden": "Honsel Tankstelle", "str": "Nordhäuser Str. 44", "plz": "37339", "stadt": "Leinefelde-Worbis"}, "Nordhausen": {"laden": "Scheunenhof Sundhausen", "str": "Uthleber Str. 24", "plz": "99735", "stadt": "Nordhausen-Sundhausen"}, "Dingelstädt": {"laden": "", "str": "Am Schützenplatz", "plz": "37351", "stadt": "Dingelstädt"}, "Groß Bartloff": {"laden": "Edeka Müller", "str": "Auf der Rinne 4", "plz": "37359", "stadt": "Großbartloff"}, "Geismar": {"laden": "", "str": "Am Anger", "plz": "37308", "stadt": "Geismar"}, "Eschwege": {"laden": "Sandrock Tier + Garten", "str": "Friedhofsweg 17", "plz": "37269", "stadt": "Eschwege-Oberhone"}, "Hessisch Lichtenau": {"laden": "OnOvO Tierbedarf", "str": "Am Hambacher Weg 4", "plz": "37235", "stadt": "Hessisch Lichtenau"}, "Gudensberg": {"laden": "", "str": "Fritzlarer Str. 43", "plz": "34281", "stadt": "Gudensberg"}, "Warburg": {"laden": "Raiffeisen-Markt Warburg", "str": "Landfurt 57-61", "plz": "34414", "stadt": "Warburg"}, "Hemeringen": {"laden": "Falcova GmbH & Co. KG", "str": "Herkendorfer Str. 14", "plz": "31840", "stadt": "Hessisch Oldendorf-Hemeringen"}, "Hameln": {"laden": "", "str": "Hastenbecker Weg 82", "plz": "31785", "stadt": "Hameln"}, "Coppenbrügge": {"laden": "Bahnhof", "str": "Bahnhof", "plz": "31863", "stadt": "Coppenbrügge"}, "Hemmendorf": {"laden": "", "str": "Marktplatz 3", "plz": "31020", "stadt": "Salzhemmendorf-Hemmendorf"}, "Burgstemmen": {"laden": "", "str": "Neuer Weg 1-3", "plz": "31171", "stadt": "Nordstemmen-Burgstemmen"}, "Eldagsen": {"laden": "Raiffeisen-Markt Eldagsen", "str": "Lange Str. 83a", "plz": "31832", "stadt": "Springe-Eldagsen"}, "Alfeld (Leine)": {"laden": "Zooparadies Kempf", "str": "", "plz": "31061", "stadt": "Alfeld (Leine)"}, "Hildesheim": {"laden": "MTG Fleige", "str": "Frankenstraße 2", "plz": "31135", "stadt": "Hildesheim"}, "Holle": {"laden": "", "str": "Am Mohldberg 1", "plz": "31188", "stadt": "Holle"}, "Steinlah": {"laden": "Gebrüderkassel Mühle", "str": "Mühlenweg 3", "plz": "38275", "stadt": "Haverlah-Steinlah"}, "Vechelde": {"laden": "Raiffeisenmarkt", "str": "", "plz": "38159", "stadt": "Vechelde"}, "Groß Lafferde": {"laden": "", "str": "Marktstraße 50", "plz": "31246", "stadt": "Ilsede-Groß Lafferde"}, "Schellerten": {"laden": "EDEKA Herbst", "str": "Über der Wasserfurche 1", "plz": "31174", "stadt": "Schellerten"}, "Beverungen": {"laden": "onOvo Stadtmühle", "str": "Lange Str. 1", "plz": "37688", "stadt": "Beverungen"}, "Hann. Münden": {"laden": "onOvo Farmer Store", "str": "Veckerhäger Str. 82", "plz": "34346", "stadt": "Hann. Münden"}, "Rosdorf": {"laden": "Farmerstore onOvo", "str": "", "plz": "37124", "stadt": "Rosdorf"}, "Waldkappel": {"laden": "Rewe (Einfahrt)", "str": "", "plz": "37284", "stadt": "Waldkappel"}, "Rietberg Hof": {"laden": "Hof Holle", "str": "Merschhemkeweg", "plz": "33397", "stadt": "Rietberg"}, "Rietberg zuhause": {"laden": "", "str": "Eberhard-Unkraut-Straße 76", "plz": "33397", "stadt": "Rietberg"}};
Object.assign(HALT_START,HALT_START_NEU);
const PLZ_PRUEFEN=["Hameln", "Hildesheim"];
let plzEigen={};
function halt(o){const e=plzEigen[o]??(o==="Hemmendorf"?undefined:undefined);const b=HALT_START[o]||{laden:"",str:"",plz:"",stadt:o};return typeof e==="string"?{...b,plz:e}:{...b,...(e||{})};}
const plzVon=o=>halt(o).plz;
const navi=h=>[h.str,[h.plz,h.stadt].filter(Boolean).join(" ")].filter(Boolean).join(", ");
async function saveHalt(ort,feld,val){
  const cur=halt(ort); plzEigen={...plzEigen,[ort]:{...cur,[feld]:val}};
  try{ if(db) await db.doc("einstellungen/plz").set({plz:plzEigen}); else localStorage.setItem(LS+"-plz",JSON.stringify(plzEigen)); toast("Gespeichert")}
  catch(e){toast("Speichern fehlgeschlagen.")}
  renderFahr();renderPaper();
}
function renderPlzTable(){
  const orte=[];TOURS.forEach(t=>t.stops.forEach(s=>{if(s[1]!==HOME&&!orte.includes(s[1]))orte.push(s[1])}));
  const warn="background:var(--yolk-soft);border-color:var(--yolk)";
  $("#f2-plz").innerHTML=`<thead><tr><th>Haltepunkt</th><th>Laden / Geschäft</th><th>Straße und Hausnummer</th><th>PLZ</th><th>Ort fürs Navi</th></tr></thead><tbody>`+orte.map((o,i)=>{const h=halt(o),own=plzEigen[o]&&typeof plzEigen[o]==="object";
    const f=(k,w,st)=>`<input id="h-${k}-${i}" data-ort="${esc(o)}" data-f="${k}" value="${esc(h[k])}" style="min-width:${w}px;${st||""}">`;
    return `<tr><td><b>${esc(o)}</b></td><td>${f("laden",150)}</td><td>${f("str",170,!h.str?warn:"")}</td><td>${f("plz",70,PLZ_PRUEFEN.includes(o)&&!own?warn:"")}</td><td>${f("stadt",150)}</td></tr>`}).join("")+`</tbody>`;
  $("#f2-plz").querySelectorAll("input").forEach(i=>i.addEventListener("change",()=>saveHalt(i.dataset.ort,i.dataset.f,i.value.trim())));
}
function buildFahr(datum,tourId){
  const act=orders.filter(o=>o.datum===datum&&o.status!=="storniert");
  const tours=tourId?[tourById(tourId)]:TOURS.filter(t=>act.some(o=>o.tour===t.id));
  if(!tours.length) return `<div class="sheet"><div class="none">Für ${esc(dLong(datum))} gibt es noch keine Bestellungen.</div></div>`;
  const leer=$("#f2-leer").checked;
  return `<div class="sheet fahr">`+tours.map(t=>{
    const list=act.filter(o=>o.tour===t.id);
    let rows=t.stops.filter(s=>s[1]!==HOME).map(s=>{const h=halt(s[1]);return {zeit:s[0],ort:s[1],laden:h.laden,adr:navi(h),fehlt:!h.str,n:list.filter(o=>o.ort===s[1]).length}});
    if(leer) rows=rows.filter(r=>r.n);
    list.filter(o=>o.ort===HOME).forEach(o=>{const a=o.adresse||"";const m=a.match(/\b(\d{5})\b\s*(.*)$/);
      rows.push({zeit:"",ort:"Lieferung nach Hause",laden:o.kunde||"",adr:a,n:1,home:true})});
    const kunden=rows.reduce((a,r)=>a+r.n,0);
    return `<section class="page"><div class="hd"><div><div class="t">Fahrplan ${esc(t.nr)}</div><div class="tn">${esc(t.name)}</div></div><div><div class="dt">${esc(dLong(datum))}</div><div class="meta">${rows.length} Halte · ${kunden} Kunden</div></div></div>
      <table><thead><tr><th class="r">Uhrzeit</th><th>Ort · Laden</th><th>Adresse fürs Navi</th><th class="r">Kunden</th></tr></thead><tbody>`+
      rows.map(r=>`<tr${r.home?' class="home"':""}><td class="r zeit">${esc(r.zeit)}</td><td class="ort">${esc(r.ort)}${r.laden?`<div class="laden">${esc(r.laden)}</div>`:""}</td><td class="adr">${esc(r.adr)}${r.fehlt?`<div class="fehlt">Straße fehlt</div>`:""}</td><td class="r kn">${r.n||"–"}</td></tr>`).join("")+
      `</tbody></table></section>`}).join("")+`</div>`;
}
function renderFahr(){ if($("#f2-paper")&&$("#f2-datum").value) $("#f2-paper").innerHTML=buildFahr($("#f2-datum").value,$("#f2-tour").value); }
tourOptions($("#f2-tour"),"Alle Touren (je Tour eine Seite)");
["#f2-datum","#f2-tour","#f2-leer"].forEach(x=>$(x).addEventListener("input",renderFahr));
$("#f2-print").onclick=async()=>{
  if(!dl){ if(window.top===window) window.print(); return; }
  const d=$("#f2-datum").value,t=$("#f2-tour").value,tr=t?tourById(t):null;
  const doc=`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Fahrplan ${esc(dLong(d))}</title><style>@page{size:A4;margin:12mm}body{margin:0;padding:8px}${SHEET_CSS}@media print{.sheet .page+.page{margin-top:0}}</style></head><body>${buildFahr(d,t)}<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`;
  try{await dl.save({filename:`Fahrplan_${d}${tr?"_"+tr.nr.replace(/\s/g,""):""}.html`,data:doc});toast("Fahrplan gespeichert. Datei öffnen und drucken.")}
  catch(e){if(e&&e.code!=="declined")toast("Speichern nicht möglich.")}
};

/* ---------- Erinnerung Vortag ---------- */
function renderReminder(){
  const t=new Date();t.setDate(t.getDate()+3);const mo=iso(t);
  const os=orders.filter(o=>o.datum===mo&&(o.status==="offen"||o.status==="neu"));
  if(!os.length){$("#reminder").innerHTML="";return}
  const by=new Map();os.forEach(o=>{const k=tourById(o.tour)?.nr||o.tour;by.set(k,(by.get(k)||[]).concat(o))});
  const home=os.filter(o=>o.ort===HOME).length;
  $("#reminder").innerHTML=`<div class="remind"><h2>Bald Auslieferung · ${esc(dLong(mo))}</h2>
    <div>${os.length} offene Bestellungen · ${os.reduce((a,o)=>a+stueck(o),0)} Tiere${home?` · davon ${home} Lieferung nach Hause`:""}</div>
    <ul>${[...by.entries()].map(([k,l])=>`<li><b>${esc(k)}:</b> ${l.length} Kunden, ${l.reduce((a,o)=>a+stueck(o),0)} Tiere</li>`).join("")}</ul>
    <div class="btns"><button class="btn" type="button" id="remLade">Ladeliste für diesen Tag öffnen</button></div></div>`;
  $("#remLade").onclick=()=>{$("#p-datum").value=mo;$("#p-tour").value="";renderPaper();showTab("lade")};
}

/* ---------- Gesamt-Render ---------- */
function renderAll(){
  $("#cnt").textContent=orders.filter(o=>o.status!=="storniert"&&!istAlt(o)).length;
  const names=[...new Set(orders.map(o=>o.kunde).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"de"));
  $("#dl-kunden").innerHTML=names.map(n=>`<option value="${esc(n)}">`).join("");
  { const sel=$("#l-datum"),cur=sel.value,ds=[...new Set(orders.filter(o=>istAlt(o)===listArchiv).map(o=>o.datum).filter(Boolean))].sort();
    if(listArchiv) ds.reverse();
    sel.innerHTML=`<option value="">Alle Termine</option>`+ds.map(d=>`<option value="${d}">${esc(dLong(d))}</option>`).join(""); sel.value=ds.includes(cur)?cur:""; }dateOptions($("#p-datum"),false);
  renderList();renderPaper();renderBedarf();renderReminder();renderNeu();renderKunden();renderKasse();renderErinnern();renderNachrichten();renderFahrer();renderZahlen();renderBestell();dateOptions($("#f2-datum"),false);renderFahr();if(!renderPlzTable.done){renderPlzTable();renderPlzTable.done=1}
}
resetForm();renderAll();
try{const t=localStorage.getItem("holle-tab");if(t)showTab(t)}catch(e){}

/* =====================================================================
   Holle-App: Erweiterungen gegenüber dem alten Bestellbuch
   ===================================================================== */
const SB = window.__holle.supabase;
const SHOP_WA_TEXT_GRUSS = "Viele Grüße\nGeflügelverkauf Holle";

/* ---------- Neue Bestellungen aus der Kunden-App ---------- */
function waNum(t){let n=String(t||"").replace(/[^0-9+]/g,"");if(n.startsWith("+"))n=n.slice(1);else if(n.startsWith("00"))n=n.slice(2);else if(n.startsWith("0"))n="49"+n.slice(1);return n}
function abholText(o){
  if(o.tour==="R") return `in Rietberg am ${dLong(o.datum)}. Uhrzeit und genauen Ort schicken wir dir noch.`;
  if(o.ort===HOME) return `Lieferung am ${dLong(o.datum)}${o.adresse?" nach "+o.adresse:""}.`;
  const t=tourById(o.tour), st=t?t.stops.find(s=>s[1]===o.ort):null, h=halt(o.ort);
  const wo=[h.laden,navi(h)].filter(Boolean).join(", ");
  return `${dLong(o.datum)}${st&&st[0]?", "+st[0]+" Uhr":""} in ${o.ort}${wo?" ("+wo+")":""}.`;
}
function bestaetigungText(o){
  const vn=(o.kunde||"").split(" ")[0];
  const pos=(o.positionen||[]).filter(p=>p.tier&&+p.anzahl);
  const ohne=pos.some(p=>p.preis==null||p.preis===""), summe=betrag(o);
  const zeile=p=>`• ${p.anzahl} × ${p.tier}`+(p.preis!=null&&p.preis!==""?` à ${eur(+p.preis)} = ${eur(+p.anzahl*+p.preis)}`:preisInfo(p)?` (${preisInfo(p)})`:" (Preis folgt)");
  const rb=rabattEur(o);
  const gesamt=summe?`${rb?`\n\nZwischensumme: ${eur(brutto(o))}\n${rabattText(o)}: − ${eur(rb)}`:"\n"}\n*Gesamtpreis: ${eur(summe)}*${ohne?" zzgl. der Tiere mit Wochenpreis/Preis folgt":""}`:"";
  return `Hallo ${vn}, deine Bestellung bei Geflügelverkauf Holle ist bestätigt:\n`+
    pos.map(zeile).join("\n")+gesamt+
    `\n\nAbholung: ${abholText(o)}\nBezahlung bei Abholung (bar, PayPal oder Überweisung).\nFalls etwas dazwischenkommt, sag bitte mindestens 24–36 Stunden vorher Bescheid.`+
    (orderLink(o)?`\nDeine Bestellung ansehen oder absagen: ${orderLink(o)}`:"")+`\n\n${SHOP_WA_TEXT_GRUSS}`;
}
const waLinkOrder=o=>`https://wa.me/${waNum(o.telefon)}?text=${encodeURIComponent(bestaetigungText(o))}`;
async function bestaetige(id){
  const o=orders.find(x=>x.id===id); if(!o) return;
  const {id:_,...rest}=o;
  try{await saveOrder(id,{...rest,status:"offen",updated:new Date().toISOString()});toast(`Bestätigt: ${o.kunde}`)}
  catch(e){toast("Speichern fehlgeschlagen. Bitte erneut versuchen.")}
}
function renderNeu(){
  const box=$("#neuBox"); if(!box) return;
  const neu=orders.filter(o=>o.status==="neu").sort((a,b)=>(a.created||"").localeCompare(b.created||""));
  if(!neu.length){box.innerHTML="";return}
  box.innerHTML=`<div class="neubox"><h2>${neu.length} neue Bestellung${neu.length>1?"en":""} aus der Kunden-App</h2>`+
    neu.map(o=>{const tr=tourById(o.tour);return `<div class="neuitem">
      <div class="neuhead"><b>${esc(o.kunde)}</b> <span class="sub">${esc(o.telefon)}${o.wohnort?" · "+esc(o.wohnort):""}</span></div>
      <div><span class="odot" style="background:${ortFarbe(o.ort)}"></span>${esc(dShort(o.datum))} · ${esc(tr?tr.nr:o.tour)} · ${esc(o.ort)}</div>
      <div class="tiere">${tierHtml(o)}${betrag(o)?` · ${esc(eur(betrag(o)))}`:""}</div>
      ${o.bemerkung?`<div class="sub">💬 ${esc(o.bemerkung)}</div>`:""}
      <div class="btns">
        <a class="btn wa" href="${esc(waLinkOrder(o))}" target="_blank" rel="noopener" data-ok="${esc(o.id)}">Bestätigen + WhatsApp</a>
        <button class="btn ghost" type="button" data-ok2="${esc(o.id)}">Nur bestätigen</button>
        <button class="btn ghost" type="button" data-ed="${esc(o.id)}">Bearbeiten</button>
      </div></div>`}).join("")+`</div>`;
  box.querySelectorAll("[data-ok]").forEach(a=>a.addEventListener("click",()=>bestaetige(a.dataset.ok)));
  box.querySelectorAll("[data-ok2]").forEach(b=>b.onclick=()=>bestaetige(b.dataset.ok2));
  box.querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>editOrder(b.dataset.ed));
}
// Im Bearbeiten-Formular: WhatsApp-Knopf für neue und offene Bestellungen
{
  const _edit=editOrder;
  editOrder=function(id){
    _edit(id);
    const o=orders.find(x=>x.id===id); if(!o||!o.telefon) return;
    const a=document.createElement("a");
    a.className="btn wa"; a.target="_blank"; a.rel="noopener"; a.href=waLinkOrder(o);
    a.textContent=o.status==="neu"?"Bestätigen + WhatsApp":"Bestätigung per WhatsApp";
    if(o.status==="neu") a.addEventListener("click",()=>{bestaetige(id);resetForm()});
    $("#delWrap").prepend(a);
  };
}

/* ---------- Preise aus dem Sortiment als Vorschlag ---------- */
let products=[];
async function loadProducts(){
  let {data,error}=await SB.from("products").select("*").order("sort").order("name").then(r=>r,e=>({data:null,error:e}));
  if(error){let alt=null;try{alt=JSON.parse(localStorage.getItem("holle-cache-products")||"null")}catch(e){}
    if(alt){data=alt}else{toast("Sortiment konnte nicht geladen werden.");return}}
  else{try{localStorage.setItem("holle-cache-products",JSON.stringify(data||[]))}catch(e){}}
  products=data||[];
  products.forEach(p=>{
    if(p.price!=null&&p.price_bis==null) PREIS_VORSCHLAG[p.name]=+p.price; else delete PREIS_VORSCHLAG[p.name];
    if(p.price_hahn!=null&&p.price_hahn_bis==null) PREIS_VORSCHLAG[p.name+" Hahn"]=+p.price_hahn;
    else if(p.category==="Hybrid-Legehennen"&&p.price!=null&&p.price_bis==null&&p.name!=="Großer Hahn (Hybrid)") PREIS_VORSCHLAG[p.name+" Hahn"]=Math.max(0,p.price-2); // großer Hahn: 2 € unter der Henne
    else delete PREIS_VORSCHLAG[p.name+" Hahn"];
    if(!TIERE.includes(p.name)) TIERE.push(p.name);
    if(p.price_hahn!=null&&!TIERE.includes(p.name+" Hahn")) TIERE.push(p.name+" Hahn");
  });
  $("#dl-tiere").innerHTML=TIERE.map(t=>`<option value="${esc(t)}"${PREIS_VORSCHLAG[t]!=null?` label="${esc(eur(PREIS_VORSCHLAG[t]))}"`:""}>`).join("");
  renderProducts();
}
const num=v=>{const s=String(v??"").trim().replace(",",".");if(s==="")return null;const n=parseFloat(s);return isNaN(n)?undefined:n};
async function patchProduct(id,patch){
  const {error}=await SB.from("products").update(patch).eq("id",id);
  if(error){toast("Speichern fehlgeschlagen.");return}
  toast("Gespeichert");await loadProducts();
}
function renderProducts(){
  const tb=$("#pr-table"); if(!tb) return;
  $("#dl-kat").innerHTML=[...new Set(products.map(p=>p.category))].map(k=>`<option value="${esc(k)}">`).join("");
  let last=null;
  tb.innerHTML=`<thead><tr><th>In App</th><th>Tierart</th><th class="num">Preis €</th><th class="num">bis €</th><th class="num">Hahn €</th><th class="num">bis €</th><th class="num">Bestand</th><th>Hinweis</th><th>Bild & Info</th></tr></thead><tbody>`+
    products.map(p=>{const head=p.category!==last?(last=p.category):null;
      return (head?`<tr class="tot"><td colspan="9">${esc(head)}</td></tr>`:"")+
      `<tr><td><input type="checkbox" data-pid="${p.id}" data-f="available" ${p.available?"checked":""} style="width:22px;height:22px"></td>
       <td>${esc(p.name)}</td>
       <td class="num"><input data-pid="${p.id}" data-f="price" value="${p.price??""}" inputmode="decimal" style="width:80px;text-align:right"></td>
       <td class="num"><input data-pid="${p.id}" data-f="price_bis" value="${p.price_bis??""}" inputmode="decimal" placeholder="–" style="width:70px;text-align:right"></td>
       <td class="num"><input data-pid="${p.id}" data-f="price_hahn" value="${p.price_hahn??""}" inputmode="decimal" style="width:80px;text-align:right"></td>
       <td class="num"><input data-pid="${p.id}" data-f="price_hahn_bis" value="${p.price_hahn_bis??""}" inputmode="decimal" placeholder="–" style="width:70px;text-align:right"></td>
       <td class="num"><input data-pid="${p.id}" data-f="bestand" value="${p.bestand??""}" inputmode="numeric" placeholder="∞" style="width:70px;text-align:right${p.bestand===0?";color:var(--warn);font-weight:700":""}"></td>
       <td><input data-pid="${p.id}" data-f="price_note" value="${esc(p.price_note??"")}" placeholder="z. B. je nach Alter"></td>
       <td><button class="btn ghost tinfo-edit" type="button" data-tinfo="${p.id}">${p.bild_url?`<img src="${esc(p.bild_url)}" alt="">`:"📷"} ${p.bild_url||p.beschreibung?"ändern":"hinzufügen"}</button></td></tr>`}).join("")+`</tbody>`;
  tb.querySelectorAll("[data-tinfo]").forEach(b=>b.onclick=()=>tierInfoBearbeiten(+b.dataset.tinfo));
  tb.querySelectorAll("input[data-pid]").forEach(i=>i.addEventListener("change",()=>{
    const f=i.dataset.f;let v;
    if(f==="available") v=i.checked;
    else if(f==="price_note") v=i.value.trim()||null;
    else if(f==="bestand"){const t=i.value.trim(); v=t===""?null:parseInt(t,10); if(v!==null&&(isNaN(v)||v<0)){toast("Bitte eine ganze Zahl eingeben.");return}}
    else {v=num(i.value); if(v===undefined){toast("Bitte eine Zahl eingeben.");return}}
    patchProduct(+i.dataset.pid,{[f]:v});
  }));
}
$("#pr-add").onclick=async()=>{
  const name=$("#pr-name").value.trim(), category=$("#pr-kat").value.trim()||"Sonstige";
  if(!name){toast("Bitte Tierart eingeben.");return}
  const price=num($("#pr-preis").value), price_hahn=num($("#pr-hahn").value);
  if(price===undefined||price_hahn===undefined){toast("Preis bitte als Zahl.");return}
  const sort=Math.max(0,...products.filter(p=>p.category===category).map(p=>p.sort))+1;
  const {error}=await SB.from("products").insert({name,category,price,price_hahn,sort});
  if(error){toast(error.code==="23505"?"Diese Tierart gibt es schon.":"Speichern fehlgeschlagen.");return}
  ["#pr-name","#pr-preis","#pr-hahn"].forEach(s=>$(s).value="");toast("Hinzugefügt");loadProducts();
};

/* ---------- Termine (Fahrten) für die Kunden-App ---------- */
let fahrten=[];
const faTour=$("#fa-tour"), faOrte=$("#fa-orte");
faTour.innerHTML=TOURS.filter(t=>t.id!=="R").map(t=>`<option value="${t.id}">${esc(t.nr+" – "+t.name)}</option>`).join("");
const fillFaOrte=()=>{const t=tourById(faTour.value);faOrte.innerHTML=t.stops.filter(s=>s[1]!==HOME).map(s=>`<option value="${esc(s[1])}">${esc((s[0]?s[0]+" · ":"")+s[1])}</option>`).join("")};
faTour.addEventListener("change",fillFaOrte);fillFaOrte();
{const y=new Date().getFullYear();$("#fa-jahr").innerHTML=[y,y+1,y+2].map(j=>`<option${j===y+1?" selected":""}>${j}</option>`).join("")}
async function loadFahrten(){
  const {data,error}=await SB.from("fahrten").select("*").gte("datum",iso(new Date())).order("datum").order("tour");
  if(error){toast("Termine konnten nicht geladen werden.");return}
  fahrten=data||[];renderFahrten();
}
function renderFahrten(){
  const tb=$("#fa-table");
  if(!fahrten.length){tb.innerHTML=`<tbody><tr><td class="empty">Keine kommenden Termine. Kunden können dann nur „Abholung in Rietberg“ wählen.</td></tr></tbody>`;return}
  tb.innerHTML=`<thead><tr><th>Datum</th><th>Tour</th><th>Haltepunkte</th><th>Für Kunden</th><th></th></tr></thead><tbody>`+
    fahrten.map(f=>{const t=tourById(f.tour);const n=orders.filter(o=>o.datum===f.datum&&o.tour===f.tour&&o.status!=="storniert").length;
      return `<tr><td style="white-space:nowrap"><b>${esc(dShort(f.datum))}</b><br><span class="sub">${n} Bestellungen</span></td>
      <td>${esc(t?t.nr+" – "+t.name:f.tour)}${f.hinweis?`<br><span class="sub">${esc(f.hinweis)}</span>`:""}</td>
      <td class="sub">${f.nur_orte&&f.nur_orte.length?esc(f.nur_orte.join(", ")):"alle"}</td>
      <td><input type="checkbox" data-fid="${f.id}" ${f.aktiv?"checked":""} style="width:22px;height:22px"></td>
      <td><button class="btn warn" type="button" data-fdel="${f.id}" style="padding:4px 10px">×</button></td></tr>`}).join("")+`</tbody>`;
  tb.querySelectorAll("[data-fid]").forEach(c=>c.onchange=async()=>{const {error}=await SB.from("fahrten").update({aktiv:c.checked}).eq("id",+c.dataset.fid);toast(error?"Speichern fehlgeschlagen.":c.checked?"Termin für Kunden sichtbar":"Termin für Kunden ausgeblendet");loadFahrten()});
  tb.querySelectorAll("[data-fdel]").forEach(b=>b.onclick=async()=>{if(!confirm("Termin löschen? Bestellungen bleiben erhalten."))return;const {error}=await SB.from("fahrten").delete().eq("id",+b.dataset.fdel);toast(error?"Löschen fehlgeschlagen.":"Termin gelöscht");loadFahrten()});
}
$("#fa-add").onclick=async()=>{
  const datum=$("#fa-datum").value;if(!datum){toast("Bitte Datum wählen.");return}
  const nur=[...faOrte.selectedOptions].map(o=>o.value);
  const {error}=await SB.from("fahrten").upsert({datum,tour:faTour.value,nur_orte:nur.length?nur:null,hinweis:$("#fa-hinweis").value.trim()||null,aktiv:true},{onConflict:"datum,tour"});
  if(error){toast("Speichern fehlgeschlagen.");return}
  toast("Termin gespeichert");$("#fa-hinweis").value="";[...faOrte.options].forEach(o=>o.selected=false);loadFahrten();
};
$("#fa-gen").onclick=async()=>{
  const y=+$("#fa-jahr").value, rows=[];
  for(let m=2;m<=9;m++){ // März bis Oktober
    for(let d=new Date(y,m,1);d.getMonth()===m;d.setDate(d.getDate()+1)){
      const wd=d.getDay(); if(wd!==6&&wd!==0) continue;
      const n=Math.ceil(d.getDate()/7), ds=iso(d);
      const ts=TOURS.filter(t=>t.id!=="R"&&(t.tag??6)===wd&&t.weeks.includes(n));
      ts.forEach(t=>rows.push({datum:ds,tour:t.id,nur_orte:null,aktiv:true}));
      if(wd===6&&!ts.some(t=>t.stops.some(s=>s[1]==="Eschwege"))) rows.push({datum:ds,tour:"T4",nur_orte:["Eschwege"],aktiv:true});
    }
  }
  if(!confirm(`${rows.length} Termine für ${y} anlegen (laut Fahrrhythmus jeder Tour, Eschwege jeden Samstag, Markt Weikersheim jeden 1. Sonntag)? Vorhandene Termine bleiben unverändert.`))return;
  const {error}=await SB.from("fahrten").upsert(rows,{onConflict:"datum,tour",ignoreDuplicates:true});
  toast(error?"Anlegen fehlgeschlagen.":"Termine angelegt");loadFahrten();
};

/* ---------- Daten-Umzug aus dem alten Bestellbuch ---------- */
$("#imp-file").addEventListener("change",async e=>{
  const f=e.target.files[0]; if(!f) return;
  const st=$("#imp-state");
  try{
    const j=JSON.parse(await f.text());
    if(j.format!=="holle-bestellbuch"||!Array.isArray(j.orders)) throw new Error("format");
    if(!confirm(`${j.orders.length} Bestellungen aus dem alten Bestellbuch übernehmen?`)) return;
    st.textContent="Übernehme …";
    const now=new Date().toISOString();
    const rows=j.orders.filter(o=>o&&o.id).map(({id,...data})=>({coll:"orders",id:String(id),data,updated_at:now}));
    Object.entries(j.einkauf||{}).forEach(([k,tiere])=>{const [von,bis]=k.split("_");rows.push({coll:"einkauf",id:k,data:{tiere,von:von==="x"?"":von,bis:bis==="x"?"":bis,updated:now},updated_at:now})});
    if(j.plz&&Object.keys(j.plz).length) rows.push({coll:"einstellungen",id:"plz",data:{plz:j.plz},updated_at:now});
    for(let i=0;i<rows.length;i+=200){
      const {error}=await SB.from("bb_docs").upsert(rows.slice(i,i+200));
      if(error) throw error;
      st.textContent=`Übernehme … ${Math.min(i+200,rows.length)} von ${rows.length}`;
    }
    ["orders","einkauf","einstellungen"].forEach(c=>window.__holle.db._refresh(c));
    st.textContent=`Fertig: ${j.orders.length} Bestellungen übernommen.`;toast("Umzug abgeschlossen");
  }catch(err){
    st.textContent=err.message==="format"?"Das ist keine Export-Datei aus dem Bestellbuch.":"Fehler beim Übernehmen. Bitte nochmal versuchen.";
  }finally{e.target.value=""}
});

loadProducts();loadFahrten();

/* ---------- Push-Benachrichtigung ---------- */
(async()=>{
  const {data}=await SB.from("app_settings").select("key,value");
  const m=Object.fromEntries((data||[]).map(r=>[r.key,r.value]));
  $("#push-state").innerHTML=m.telegram_token&&m.telegram_chat_id?"<b>Telegram ist eingerichtet.</b>":"Telegram ist noch nicht eingerichtet.";
})();
$("#push-test").onclick=async()=>{const {error}=await SB.rpc("push_test");toast(error?"Test fehlgeschlagen.":"Test gesendet – kommt gleich aufs Handy")};

/* ---------- Kundenkartei und Stempelkarte ---------- */
var kundenInfo={}; // Schlüssel -> {karte:true, seit:"YYYY-MM-DD", eingeloest:n, gewerbe:bool, notiz}
window.__holle.db.collection("kunden").onSnapshot(s=>{kundenInfo={};s.docs.forEach(d=>kundenInfo[d.id]=d.data());renderKunden()},()=>{});
function telKey(t){let n=String(t||"").replace(/[^0-9+]/g,"");if(n.startsWith("+"))n=n.slice(1);else if(n.startsWith("00"))n=n.slice(2);else if(n.startsWith("0"))n="49"+n.slice(1);return n.length>=8?n:""}
function kundeKey(o){return telKey(o.telefon)||("name:"+(o.kunde||"").trim().toLowerCase())}
var kSel=null;
function kundenListe(){
  const m=new Map();
  orders.forEach(o=>{const k=kundeKey(o);if(!m.has(k))m.set(k,{key:k,orders:[]});m.get(k).orders.push(o)});
  return [...m.values()].map(c=>{
    const os=c.orders.sort((a,b)=>(b.datum||"").localeCompare(a.datum||""));
    const last=os[0], act=os.filter(o=>o.status!=="storniert");
    const info=kundenInfo[c.key]||{};
    return {...c,orders:os,name:last.kunde,telefon:os.find(o=>o.telefon)?.telefon||"",wohnort:os.find(o=>o.wohnort)?.wohnort||"",
      anzahl:act.length,tiere:act.reduce((a,o)=>a+stueck(o),0),umsatz:act.reduce((a,o)=>a+betrag(o),0),letzte:last.datum,info,...stempel(os,info)};
  }).concat(Object.entries(kundenInfo||{}).filter(([k,i])=>i.kontakt&&i.telefon&&!m.has(k)).map(([k,i])=>
    ({key:k,orders:[],name:i.name||i.telefon,telefon:i.telefon,wohnort:i.wohnort||"",anzahl:0,tiere:0,umsatz:0,letzte:"",info:i,kontaktNur:true,...stempel([],i)})));
}
function stempel(os,info){
  if(!info.karte||info.gewerbe) return {stempel:0,frei:0};
  let rasse=0,hybrid=0;
  os.filter(o=>o.status==="abgeholt"&&(!info.seit||(o.datum||"")>=info.seit)).forEach(o=>(o.positionen||[]).forEach(p=>{
    if(/\bhahn\b|hähne?\b/i.test(p.tier||"")) return; // nur Hennen zählen
    const k=kategorie(p.tier),n=+p.anzahl||0;
    if(k==="Rassehühner") rasse+=n; else if(k==="Hybridhennen") hybrid+=n;
  }));
  const st=rasse+Math.floor(hybrid/2), frei=Math.floor(st/10)-(+info.eingeloest||0);
  return {stempel:st,rest:st-(Math.floor(st/10))*10,frei:Math.max(0,frei)};
}
async function saveKunde(key,patch){
  const cur=kundenInfo[key]||{};
  try{const neu={...cur,...patch,updated:new Date().toISOString()};await window.__holle.db.doc("kunden/"+key).set(neu);kundenInfo[key]=neu;toast("Gespeichert")}
  catch(e){toast("Speichern fehlgeschlagen.")}
}
function renderKunden(){
  const tb=$("#k-table"); if(!tb) return;
  const q=$("#k-q").value.trim().toLowerCase(), f=$("#k-f").value;
  let ks=kundenListe();
  const alle=ks.length, karten=ks.filter(k=>k.info.karte&&!k.info.gewerbe).length, faellig=ks.filter(k=>k.frei>0).length;
  $("#k-kpis").innerHTML=`<div class="kpi"><b>${alle}</b><span>Kunden</span></div><div class="kpi"><b>${ks.filter(k=>k.anzahl>=3).length}</b><span>Stammkunden</span></div><div class="kpi"><b>${karten}</b><span>Stempelkarten</span></div><div class="kpi"><b>${faellig}</b><span>Gratis-Huhn fällig</span></div>`;
  if(q) ks=ks.filter(k=>[k.name,k.telefon,k.wohnort,...k.orders.map(o=>o.ort)].join(" ").toLowerCase().includes(q));
  if(f==="karte") ks=ks.filter(k=>k.info.karte&&!k.info.gewerbe);
  if(f==="gratis") ks=ks.filter(k=>k.frei>0);
  if(f==="stamm") ks=ks.filter(k=>k.anzahl>=3);
  if(f==="kontakt") ks=ks.filter(k=>k.kontaktNur);
  if(f==="interessent") ks=ks.filter(k=>k.info.interessent);
  ks.sort((a,b)=>b.frei-a.frei||(b.letzte||"").localeCompare(a.letzte||"")||a.name.localeCompare(b.name,"de"));
  tb.innerHTML=`<thead><tr><th>Kunde</th><th class="num">Bestellungen</th><th class="num">Tiere</th><th class="num">Umsatz</th><th>Zuletzt</th><th>Stempelkarte</th></tr></thead><tbody>`+
    (ks.length?ks.slice(0,300).map(k=>`<tr class="row" data-k="${esc(k.key)}" tabindex="0"><td><b>${esc(k.name)}</b>${k.info.interessent&&!k.anzahl?' <span class="chip neu">Interessent</span>':""}<br><span class="sub">${esc(k.telefon)}${k.wohnort?" · "+esc(k.wohnort):""}</span>${k.info.interesse?`<br><span class="sub">💡 ${esc(k.info.interesse)}</span>`:""}</td>
      <td class="num">${k.anzahl}</td><td class="num">${k.tiere}</td><td class="num">${k.umsatz?esc(eur(k.umsatz)):"–"}</td><td style="white-space:nowrap">${esc(dShort(k.letzte))}</td>
      <td>${k.info.gewerbe?'<span class="chip">Gewerbe</span>':k.info.karte?`${stempelDots(k)}${k.frei?` <span class="chip neu">${k.frei}× gratis</span>`:""}`:'<span class="sub">–</span>'}</td></tr>`).join("")
      :`<tr><td colspan="6" class="empty">Keine Kunden gefunden.</td></tr>`)+`</tbody>`;
  tb.querySelectorAll("tr.row").forEach(r=>{r.onclick=()=>{kSel=r.dataset.k;renderKundeDetail();$("#k-detail").scrollIntoView({behavior:"smooth"})}});
  renderKundeDetail();
}
function stempelDots(k){return `<span class="dots">${Array.from({length:10},(_,i)=>`<i class="${i<k.rest||(k.frei>0&&k.rest===0)?"on":""}"></i>`).join("")}</span>`}
function renderKundeDetail(){
  const box=$("#k-detail"); if(!box) return;
  const k=kSel&&kundenListe().find(x=>x.key===kSel);
  if(!k){box.innerHTML="";return}
  const wa=k.telefon?`https://wa.me/${waNum(k.telefon)}`:"";
  box.innerHTML=`<div class="kcard">
    <div class="khead"><div><h2>${esc(k.name)}</h2><div class="sub">${esc(k.telefon)}${k.wohnort?" · "+esc(k.wohnort):""}</div></div>
      <button class="btn ghost" type="button" id="k-close">Schließen</button></div>
    <div class="btns">${wa?`<a class="btn wa" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a><a class="btn ghost" href="tel:${esc(k.telefon.replace(/\s/g,""))}">Anrufen</a>`:""}
      <button class="btn ghost" type="button" id="k-neu">Neue Bestellung</button>${k.info.karte&&!k.info.gewerbe?'<button class="btn" type="button" id="k-bild">🖼 Stempelkarte als Bild</button>':""}</div>
    <div class="section-h">Notiz / Interesse</div>
    <textarea id="k-notiz" placeholder="z. B. will 5 Sussex im März, Wunsch-Haltepunkt Warburg">${esc(k.info.interesse||"")}</textarea>
    <div class="btns" style="margin-top:6px"><button class="btn ghost" type="button" id="k-notiz-ok">Notiz speichern</button>${k.info.ort?`<span class="sub">Wunsch-Haltepunkt: ${esc(k.info.ort)}</span>`:""}</div>
    <div class="section-h">Stempelkarte</div>
    ${k.info.gewerbe?`<p>Als <b>Gewerbe / Mobilstall</b> markiert – keine Stempelkarte.</p><button class="btn ghost" type="button" id="k-gew0">Doch Privatkunde</button>`:
      k.info.karte?`<div class="bigdots">${stempelDots(k)}</div>
        <p><b>${k.stempel}</b> Stempel gesammelt seit ${esc(dShort(k.info.seit))} · ${+k.info.eingeloest||0}× eingelöst${k.frei?` · <b class="ok">${k.frei} Gratis-Huhn fällig</b>`:` · noch ${10-k.rest} bis zum Gratis-Huhn`}</p>
        <div class="btns">${k.frei?`<button class="btn" type="button" id="k-einl">Gratis-Huhn einlösen</button>`:""}
        ${wa?`<a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/${esc(waNum(k.telefon))}?text=${encodeURIComponent(`Hallo ${(k.name||"").split(" ")[0]}, deine Holle-Stempelkarte: ${k.stempel} Stempel${k.frei?` – du hast ${k.frei} Huhn nach Wahl (bis 30 €) gratis! 🐔`:`, noch ${10-k.rest} bis zu deinem Gratis-Huhn.`}\nViele Grüße\nGeflügelverkauf Holle`)}">Stand per WhatsApp</a>`:""}
        <button class="btn warn" type="button" id="k-aus">Karte beenden</button></div>`:
      `<p class="sub">Noch keine Stempelkarte. Richte sie ein, wenn der Kunde danach fragt.</p>
       <div class="btns"><button class="btn" type="button" id="k-an">Stempelkarte einrichten</button><button class="btn ghost" type="button" id="k-gew">Gewerbe / Mobilstall</button></div>`}
    <div class="btns" style="margin-top:8px"><a class="btn wa" id="k-mein" target="_blank" rel="noopener" href="#">Mein-Holle-Link senden</a><button class="btn ghost" type="button" id="k-stop">${k.info.keineRund?"✓ Keine Rundnachrichten (aufheben)":"Keine Rundnachrichten"}</button>
      ${k.kontaktNur?'<button class="btn warn" type="button" id="k-del">Aus Kartei entfernen</button>':""}</div>
    <div class="section-h">Bestellungen</div>
    <div class="tablewrap"><table class="list"><tbody>${k.orders.map(o=>{const tr=tourById(o.tour);return `<tr class="row" data-id="${esc(o.id)}"><td style="white-space:nowrap">${esc(dShort(o.datum))}</td><td>${esc(tr?tr.nr:o.tour)} · ${esc(o.ort)}</td><td>${esc(tierText(o,", "))}</td><td class="num">${betrag(o)?esc(eur(betrag(o))):""}</td><td><span class="chip ${esc(o.status)}">${esc(o.status||"offen")}</span></td></tr>`}).join("")}</tbody></table></div>
  </div>`;
  $("#k-close").onclick=()=>{kSel=null;renderKundeDetail()};
  box.querySelectorAll("tr.row").forEach(r=>r.onclick=()=>editOrder(r.dataset.id));
  const on=(id,fn)=>{const el=$(id);if(el)el.onclick=fn};
  on("#k-an",()=>saveKunde(k.key,{karte:true,seit:iso(new Date()),eingeloest:0,gewerbe:false,name:k.name}));
  on("#k-aus",()=>confirm("Stempelkarte beenden? Gesammelte Stempel verfallen.")&&saveKunde(k.key,{karte:false}));
  on("#k-gew",()=>saveKunde(k.key,{gewerbe:true,name:k.name}));
  on("#k-gew0",()=>saveKunde(k.key,{gewerbe:false}));
  on("#k-einl",()=>confirm("Gratis-Huhn als eingelöst eintragen?")&&saveKunde(k.key,{eingeloest:(+k.info.eingeloest||0)+1}));
  on("#k-bild",()=>openCard(k));
  {const a=$("#k-mein"); if(a){const nr=telKey(k.telefon); if(!nr){a.remove()} else {
    const setz=()=>{const l=meinLink(k.key); a.href=`https://wa.me/${nr}?text=${encodeURIComponent(`Hallo ${vorname(k.name)}, hier ist Geflügelverkauf Holle 🐔\nIn „Mein Holle“ siehst du deine Hühner, deine Stempelkarte und unsere Neuigkeiten:\n${l}\n\nTipp: Seite öffnen → Teilen → „Zum Home-Bildschirm“, dann hast du sie wie eine App.`)}`};
    if(meinLink(k.key)) setz(); else {a.style.opacity=.5; meinLinksLaden([k.key],()=>{a.style.opacity=1;setz()})}}}}
  on("#k-stop",()=>saveKunde(k.key,{keineRund:!k.info.keineRund,name:k.name,telefon:k.telefon}));
  on("#k-del",async()=>{if(!confirm(k.name+" aus der Kartei entfernen?"))return;try{await window.__holle.db.doc("kunden/"+k.key).delete();kSel=null;toast("Entfernt")}catch(e){toast("Hat nicht geklappt.")}});
  on("#k-neu",()=>{resetForm();$("#f-kunde").value=k.name;$("#f-tel").value=k.telefon;$("#f-wohnort").value=k.wohnort;if(k.info.interesse&&!$("#f-bem").value)$("#f-bem").value=k.info.interesse;showTab("neu");setTimeout(()=>$("#form").scrollIntoView({behavior:"smooth"}),30)});
  on("#k-notiz-ok",async()=>{await saveKunde(k.key,{interesse:$("#k-notiz").value.trim(),name:k.name,telefon:k.telefon});renderKunden()});
}
["#k-q","#k-f"].forEach(s=>$(s).addEventListener("input",renderKunden));


/* ---------- Stempelkarte als Bild (Design aus dem Holle-Cockpit) ---------- */
const LOGO=new Image();const LOGO_READY=new Promise((r,j)=>{LOGO.onload=r;LOGO.onerror=j});LOGO.src="./logo.png";
function rr(x,c,y,w,h,r){x.beginPath();x.moveTo(c+r,y);x.arcTo(c+w,y,c+w,y+h,r);x.arcTo(c+w,y+h,c,y+h,r);x.arcTo(c,y+h,c,y,r);x.arcTo(c,y,c+w,y,r);x.closePath()}
function naechsterTermin(ort){
  if(!ort) return null;
  const h=iso(new Date());
  return fahrten.filter(f=>f.aktiv&&f.datum>=h&&(!f.nur_orte||!f.nur_orte.length||f.nur_orte.includes(ort))&&(tourById(f.tour)?.stops||[]).some(s=>s[1]===ort))
    .sort((a,b)=>a.datum.localeCompare(b.datum))[0]||null;
}
async function drawCard(k){
  try{await Promise.all([document.fonts.load('800 80px Outfit'),document.fonts.load('600 40px Outfit'),document.fonts.load('400 34px Outfit')])}catch(e){}
  const ZIEL=10, PRAEMIE="1 Huhn nach Wahl (bis 30 €)", REGEL="1 Rassehenne = 1 Stempel · 2 Hybridhennen = 1 Stempel";
  const W=1080,H=1350,cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");
  const voll=k.frei>0, s=voll?ZIEL:k.rest;
  x.fillStyle="#faf7f5";x.fillRect(0,0,W,H);
  const g=x.createLinearGradient(0,0,W,420);g.addColorStop(0,"#5e0810");g.addColorStop(1,"#b3121f");x.fillStyle=g;x.fillRect(0,0,W,430);
  x.fillStyle="#fff";x.beginPath();x.arc(W-120,110,66,0,7);x.fill();try{await LOGO_READY;x.save();x.beginPath();x.arc(W-120,110,62,0,7);x.clip();x.drawImage(LOGO,W-182,48,124,124);x.restore();}catch(e){}
  x.textAlign="left";x.textBaseline="alphabetic";
  x.fillStyle="rgba(255,255,255,.8)";x.font="600 34px Outfit";x.fillText("GEFLÜGELVERKAUF HOLLE",70,120);
  let fs=96;x.font="800 "+fs+"px Outfit";while(fs>60&&x.measureText("Deine Stempelkarte").width>W-140){fs-=4;x.font="800 "+fs+"px Outfit"}
  x.fillStyle="#fff";x.fillText("Deine ",70,250);const wd=x.measureText("Deine ").width;x.fillStyle="#ff8a92";x.fillText("Stempelkarte",70+wd,250);
  x.fillStyle="#ff8a92";x.fillRect(70,282,190,10);
  x.fillStyle="rgba(255,255,255,.92)";x.font="400 38px Outfit";x.fillText(String(k.name||"").slice(0,34),70,365);
  const n=ZIEL,cols=5,rows=2,gap=24,size=Math.min(150,Math.floor((W-140-(cols-1)*gap)/cols));
  const gw=cols*size+(cols-1)*gap,gx=(W-gw)/2,gy=500;
  x.fillStyle="#fff";rr(x,gx-40,gy-40,gw+80,rows*size+(rows-1)*gap+80,36);x.fill();x.strokeStyle="#e9e2df";x.lineWidth=3;x.stroke();
  for(let i=0;i<n;i++){const cx=gx+(i%cols)*(size+gap)+size/2,cy=gy+Math.floor(i/cols)*(size+gap)+size/2;
    x.beginPath();x.arc(cx,cy,size/2-4,0,7);
    if(i<s){x.fillStyle="#b3121f";x.fill();x.font=Math.round(size*.52)+"px sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("🐔",cx,cy+4)}
    else{x.setLineDash([10,9]);x.strokeStyle="#d6cbc8";x.lineWidth=4;x.stroke();x.setLineDash([]);if(i===n-1){x.fillStyle="#b3121f";x.font="800 "+Math.round(size*.2)+"px Outfit";x.textAlign="center";x.textBaseline="middle";x.fillText("GRATIS",cx,cy)}}
  }
  x.textAlign="left";x.textBaseline="alphabetic";
  let y=gy+rows*size+(rows-1)*gap+120;
  x.fillStyle="#1d1a19";x.font="800 64px Outfit";x.fillText(s+" von "+n+" Stempeln",70,y);
  y+=62;x.font="600 40px Outfit";x.fillStyle=voll?"#1f7a3f":"#b3121f";x.fillText(voll?"🎉 Prämie fällig: "+PRAEMIE:"Noch "+(n-s)+" bis "+PRAEMIE,70,y);
  y+=50;x.fillStyle="#6f6866";x.font="400 30px Outfit";x.fillText(REGEL,70,y);y+=40;x.fillText("Nur für Privatkunden · keine Barauszahlung",70,y);
  const ort=(k.orders.find(o=>o.tour!=="R"&&o.ort&&o.ort!==HOME)||{}).ort;
  const t=naechsterTermin(ort);
  if(t){y+=56;x.fillStyle="#1d1a19";x.font="600 34px Outfit";x.fillText("📍 Nächster Termin in "+ort+": "+dShort(t.datum),70,y)}
  x.fillStyle="#b3121f";x.fillRect(0,H-110,W,110);x.fillStyle="#fff";x.font="600 34px Outfit";x.textAlign="center";x.fillText("Geflügelverkauf Holle · @gefluegelholle · 0157 80267793",W/2,H-44);
  return new Promise(r=>cv.toBlob(b=>r(b),"image/png"));
}
let cardFile=null;
async function openCard(k){
  const d=$("#cardDlg");$("#cardImg").removeAttribute("src");d.hidden=false;
  const blob=await drawCard(k);
  cardFile=new File([blob],"Holle-Stempelkarte-"+String(k.name||"Kunde").replace(/[^\wäöüÄÖÜß-]+/g,"-")+".png",{type:"image/png"});
  $("#cardImg").src=URL.createObjectURL(blob);
  const a=$("#cardWa"), nr=waNum(k.telefon);
  if(nr){a.href="https://wa.me/"+nr;a.hidden=false}else a.hidden=true;
  const canShare=!!(navigator.canShare&&navigator.canShare({files:[cardFile]}));
  $("#cardShare").textContent=canShare?"Teilen":"Bild speichern";
}
$("#cardClose").onclick=()=>{$("#cardDlg").hidden=true};
$("#cardShare").onclick=async()=>{
  if(!cardFile) return;
  if(navigator.canShare&&navigator.canShare({files:[cardFile]})){
    try{await navigator.share({files:[cardFile]})}catch(e){if(e.name!=="AbortError")toast("Teilen nicht möglich – Bild lange drücken")}
  } else {
    const a=document.createElement("a");a.href=URL.createObjectURL(cardFile);a.download=cardFile.name;document.body.appendChild(a);a.click();a.remove();
  }
};

/* ---------- Kasse am Haltepunkt und Tagesabschluss ---------- */
var kasseDocs={};
window.__holle.db.collection("kasse").onSnapshot(s=>{kasseDocs={};s.docs.forEach(d=>kasseDocs[d.id]=d.data());renderKasse()},()=>{});
const ZART={bar:"Bar",paypal:"PayPal",ueberweisung:"Überweisung"};
function kaDefaultDatum(){
  const h=iso(new Date()), ds=[...new Set(orders.filter(o=>o.status!=="storniert").map(o=>o.datum))].sort();
  return ds.includes(h)?h:(ds.filter(d=>d<=h).pop()||h);
}
function kaOrders(d){return orders.filter(o=>o.datum===d&&o.status!=="storniert")}
function kaSummen(os){
  const s={bar:0,paypal:0,ueberweisung:0,offen:0,offenN:0,n:os.length};
  os.forEach(o=>{if(o.zahlung&&ZART[o.zahlung.art]) s[o.zahlung.art]+=+o.zahlung.betrag||0; else {s.offen+=betrag(o);s.offenN++}});
  s.summe=s.bar+s.paypal+s.ueberweisung; return s;
}
async function kaZahlung(id,art,b0){
  const o=orders.find(x=>x.id===id); if(!o) return;
  const inp=document.querySelector(`[data-kbetrag="${CSS.escape(id)}"]`);
  const b=num(b0!==undefined?b0:inp?inp.value:betrag(o));
  if(art&&(b===undefined||b===null)){toast("Bitte den kassierten Betrag eintragen.");inp&&inp.focus();return}
  const {id:_,...rest}=o, now=new Date().toISOString();
  const upd={...rest,updated:now};
  if(art){upd.zahlung={art,betrag:b,zeit:now};upd.status="abgeholt"}
  else{delete upd.zahlung;if(upd.status==="abgeholt")upd.status="offen"}
  try{await saveOrder(id,upd);toast(art?`${o.kunde}: ${eur(b)} ${ZART[art]}`:"Zahlung zurückgenommen")}catch(e){toast("Speichern fehlgeschlagen.")}
}
function renderKasse(){
  const dIn=$("#ka-datum"); if(!dIn||!kasseDocs) return;
  if(!dIn.value) dIn.value=kaDefaultDatum();
  if(!$("#ka-monat").value) $("#ka-monat").value=dIn.value.slice(0,7);
  const d=dIn.value, alle=kaOrders(d);
  const ortSel=$("#ka-ort"), orte=[...new Set(alle.map(o=>o.ort))].sort((a,b)=>a.localeCompare(b,"de"));
  const cur=ortSel.value; ortSel.innerHTML=`<option value="">Alle (${alle.length})</option>`+orte.map(o=>`<option${o===cur?" selected":""}>${esc(o)}</option>`).join("");
  const os=alle.filter(o=>!ortSel.value||o.ort===ortSel.value).sort((a,b)=>(a.zahlung?1:0)-(b.zahlung?1:0)||a.ort.localeCompare(b.ort,"de")||a.kunde.localeCompare(b.kunde,"de"));
  const s=kaSummen(alle), abg=kasseDocs[d];
  $("#ka-kpis").innerHTML=`<div class="kpi"><b>${esc(eur(s.bar))}</b><span>Bar</span></div><div class="kpi"><b>${esc(eur(s.paypal))}</b><span>PayPal</span></div><div class="kpi"><b>${esc(eur(s.ueberweisung))}</b><span>Überweisung</span></div><div class="kpi"><b>${s.offenN}</b><span>noch offen${s.offen?" · "+esc(eur(s.offen)):""}</span></div>`;
  $("#ka-list").innerHTML=os.length?os.map(o=>{const z=o.zahlung;return `<div class="kitem${z?" bezahlt":""}" data-oid="${esc(o.id)}">
      <div class="kl"><span class="odot" style="background:${ortFarbe(o.ort)}"></span><b>${esc(o.kunde)}</b> <span class="sub">${esc(o.ort)}</span>
        <div class="sub">${tierHtml(o)}</div></div>
      ${z?`<div class="kr"><b>${esc(eur(z.betrag))}</b> <span class="chip abgeholt">${esc(ZART[z.art]||z.art)}</span>
          ${abg?"":`<button class="linkbtn" type="button" data-kundo="${esc(o.id)}">ändern</button>`}</div>`
        :`<div class="kr"><input data-kbetrag="${esc(o.id)}" inputmode="decimal" value="${betrag(o)||""}" placeholder="€">
          <div class="kbtns"><button class="btn" type="button" data-kz="bar" data-kid="${esc(o.id)}">Bar</button><button class="btn ghost" type="button" data-kz="paypal" data-kid="${esc(o.id)}">PayPal</button><button class="btn ghost" type="button" data-kz="ueberweisung" data-kid="${esc(o.id)}">Überw.</button></div></div>`}
    </div>`}).join(""):`<p class="empty">An diesem Tag gibt es keine Bestellungen.</p>`;
  $("#ka-list").querySelectorAll("[data-kz]").forEach(b=>b.onclick=()=>kaZahlung(b.dataset.kid,b.dataset.kz));
  $("#ka-list").querySelectorAll("[data-kundo]").forEach(b=>b.onclick=()=>confirm("Zahlung zurücknehmen?")&&kaZahlung(b.dataset.kundo,null));
  // Tagesabschluss
  const touren=[...new Set(alle.map(o=>o.tour))].map(t=>tourById(t)?.nr||t).join(" + ");
  $("#ka-abschluss").innerHTML=abg?`<div class="kabschluss done"><b>Kassenbericht Nr. ${esc(abg.nr)}</b> – abgeschlossen am ${esc(new Date(abg.abgeschlossen).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}))}<br>
      Bar ${esc(eur(abg.bar))} · PayPal ${esc(eur(abg.paypal))} · Überweisung ${esc(eur(abg.ueberweisung))} · ${esc(abg.vermerk||"")}</div>`
    :`<div class="kabschluss"><label>Vermerk<input id="ka-vermerk" value="${esc(touren)}"></label>
      <p class="sub">${s.offenN?`<b>${s.offenN} Bestellung${s.offenN>1?"en sind":" ist"} noch nicht bezahlt.</b> Nicht abgeholte bitte vorher stornieren oder auf einen anderen Tag legen.`:"Alle Bestellungen sind bezahlt."}</p>
      <button class="btn" type="button" id="ka-close">Tag abschließen</button></div>`;
  const cb=$("#ka-close"); if(cb) cb.onclick=kaAbschliessen;
  renderBerichte();
}
async function kaAbschliessen(){
  const d=$("#ka-datum").value, s=kaSummen(kaOrders(d));
  const nrs=Object.values(kasseDocs).map(k=>+k.nr).filter(n=>n>0);
  let nr=nrs.length?Math.max(...nrs)+1:parseInt($("#ka-startnr").value,10);
  if(!nr){toast("Bitte beim ersten Mal die erste Bericht-Nr. eintragen.");$("#ka-startnr").focus();return}
  if(!confirm(`Verkaufstag ${dShort(d)} als Kassenbericht Nr. ${nr} abschließen?\nBar ${eur(s.bar)} · PayPal ${eur(s.paypal)} · Überweisung ${eur(s.ueberweisung)}\n\nDanach lassen sich die Zahlungen dieses Tages nicht mehr ändern.`))return;
  try{await window.__holle.db.doc("kasse/"+d).set({nr,datum:d,vermerk:$("#ka-vermerk").value.trim(),bar:s.bar,paypal:s.paypal,ueberweisung:s.ueberweisung,offen:s.offen,anzahl:s.n,abgeschlossen:new Date().toISOString()});toast(`Kassenbericht Nr. ${nr} gespeichert`)}
  catch(e){toast("Speichern fehlgeschlagen.")}
}
function renderBerichte(){
  const m=$("#ka-monat").value, tb=$("#ka-berichte");
  const ks=Object.values(kasseDocs).filter(k=>k.datum&&k.datum.startsWith(m)).sort((a,b)=>a.datum.localeCompare(b.datum));
  if(!ks.length){tb.innerHTML=`<tbody><tr><td class="empty">Noch keine abgeschlossenen Tage in diesem Monat.</td></tr></tbody>`;return}
  const t=ks.reduce((a,k)=>({bar:a.bar+k.bar,paypal:a.paypal+k.paypal,ueb:a.ueb+k.ueberweisung}),{bar:0,paypal:0,ueb:0});
  tb.innerHTML=`<thead><tr><th>Nr.</th><th>Datum</th><th>Vermerk</th><th class="num">Bar</th><th class="num">PayPal</th><th class="num">Überw.</th></tr></thead><tbody>`+
    ks.map(k=>`<tr class="row" data-kd="${esc(k.datum)}"><td>${esc(k.nr)}</td><td style="white-space:nowrap">${esc(dShort(k.datum))}</td><td>${esc(k.vermerk||"")}</td><td class="num">${esc(eur(k.bar))}</td><td class="num">${esc(eur(k.paypal))}</td><td class="num">${esc(eur(k.ueberweisung))}</td></tr>`).join("")+
    `<tr class="tot"><td colspan="3">Summe ${ks.length} Tage</td><td class="num">${esc(eur(t.bar))}</td><td class="num">${esc(eur(t.paypal))}</td><td class="num">${esc(eur(t.ueb))}</td></tr></tbody>`;
  tb.querySelectorAll("[data-kd]").forEach(r=>r.onclick=()=>{$("#ka-datum").value=r.dataset.kd;renderKasse();window.scrollTo({top:0,behavior:"smooth"})});
}
$("#ka-csv").onclick=()=>{
  const m=$("#ka-monat").value;
  const ks=Object.values(kasseDocs).filter(k=>k.datum&&k.datum.startsWith(m)).sort((a,b)=>a.datum.localeCompare(b.datum));
  if(!ks.length){toast("Keine abgeschlossenen Tage in diesem Monat.");return}
  const f=v=>String(v??"").replace(/;/g,","), e=n=>(+n||0).toFixed(2).replace(".",",");
  const lines=["Nr.;Datum;Vermerk;Bar;PayPal;Überweisung;Summe;Bestellungen"].concat(ks.map(k=>[k.nr,k.datum.split("-").reverse().join("."),f(k.vermerk),e(k.bar),e(k.paypal),e(k.ueberweisung),e(k.bar+k.paypal+k.ueberweisung),k.anzahl].join(";")));
  // Einzelpositionen dazu
  lines.push("","Datum;Kunde;Haltepunkt;Tiere;Zahlart;Betrag");
  ks.forEach(k=>orders.filter(o=>o.datum===k.datum&&o.zahlung).forEach(o=>lines.push([k.datum.split("-").reverse().join("."),f(o.kunde),f(o.ort),f(tierText(o,", ")),ZART[o.zahlung.art]||"",e(o.zahlung.betrag)].join(";"))));
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+lines.join("\r\n")],{type:"text/csv"}));a.download=`Kasse_${m}.csv`;document.body.appendChild(a);a.click();a.remove();toast("Liste gespeichert");
};
["#ka-datum","#ka-ort"].forEach(s=>$(s).addEventListener("change",renderKasse));
$("#ka-monat").addEventListener("change",renderBerichte);

/* ---------- Erinnerungen vor der Tour ---------- */
function erOffen(o){return (o.status==="offen"||o.status==="neu")&&!o.zahlung}
function erinnerungText(o){
  const vn=(o.kunde||"").split(" ")[0];
  const morgen=iso(new Date(Date.now()+864e5))===o.datum, heute=iso(new Date())===o.datum;
  const pos=(o.positionen||[]).filter(p=>p.tier&&+p.anzahl), summe=betrag(o);
  return `Hallo ${vn}, kleine Erinnerung von Geflügelverkauf Holle 🐔\n`+
    `${heute?"Heute ist es so weit":morgen?"Morgen ist es so weit":"Bald ist es so weit"} – Abholung: ${abholText(o)}\n\n`+
    `Deine Bestellung:\n`+pos.map(p=>`• ${p.anzahl} × ${p.tier}`).join("\n")+
    (summe?`\nGesamt: ${eur(summe)}`:"")+
    `\n\nBezahlung vor Ort bar, PayPal oder Überweisung. Falls du nicht kommen kannst, gib bitte kurz Bescheid`+
    (orderLink(o)?` oder sag hier ab: ${orderLink(o)}`:".")+`\nBis dann!`;
}
function renderErinnern(){
  const dSel=$("#er-datum"); if(!dSel) return;
  const h=iso(new Date());
  const tage=[...new Set(orders.filter(o=>erOffen(o)&&o.datum>=h).map(o=>o.datum))].sort().slice(0,12);
  const cur=dSel.value&&tage.includes(dSel.value)?dSel.value:tage[0]||"";
  dSel.innerHTML=tage.length?tage.map(d=>{const n=orders.filter(o=>o.datum===d&&erOffen(o)).length;return `<option value="${d}"${d===cur?" selected":""}>${esc(dShort(d))} · ${n} Kunden</option>`}).join(""):`<option value="">Keine offenen Abholungen</option>`;
  const alle=orders.filter(o=>o.datum===cur&&erOffen(o));
  const oSel=$("#er-ort"), orte=[...new Set(alle.map(o=>o.ort))].sort((a,b)=>a.localeCompare(b,"de")), oc=oSel.value;
  oSel.innerHTML=`<option value="">Alle (${alle.length})</option>`+orte.map(o=>`<option${o===oc?" selected":""}>${esc(o)}</option>`).join("");
  const halteZeit=o=>{const t=tourById(o.tour),st=t?t.stops.find(s=>s[1]===o.ort):null;return st?st[0]||"":""};
  const os=alle.filter(o=>!oSel.value||o.ort===oSel.value).sort((a,b)=>(a.erinnert?1:0)-(b.erinnert?1:0)||halteZeit(a).localeCompare(halteZeit(b))||a.kunde.localeCompare(b.kunde,"de"));
  const done=alle.filter(o=>o.erinnert).length;
  $("#er-info").textContent=cur?`${done} von ${alle.length} Kunden erinnert.`:"";
  $("#er-list").innerHTML=os.map(o=>{
    const nr=waNum(o.telefon), z=halteZeit(o);
    return `<div class="kitem${o.erinnert?" bezahlt":""}">
      <div class="kl"><span class="odot" style="background:${ortFarbe(o.ort)}"></span><b>${esc(o.kunde)}</b> <span class="sub">${esc(z?z+" · ":"")}${esc(o.ort)}</span>
        <div class="sub">${esc(tierText(o,", "))}${betrag(o)?" · "+esc(eur(betrag(o))):""}</div></div>
      <div class="kr">${!nr||nr.length<8?`<span class="sub">keine Handynummer</span>`:
        `<a class="btn ${o.erinnert?"ghost":"wa"}" target="_blank" rel="noopener" data-er="${esc(o.id)}" href="https://wa.me/${esc(nr)}?text=${encodeURIComponent(erinnerungText(o))}">${o.erinnert?"✓ Nochmal":"Erinnern"}</a>`}</div>
    </div>`}).join("")||(cur?`<p class="empty">Keine Kunden.</p>`:"");
  $("#er-list").querySelectorAll("[data-er]").forEach(a=>a.addEventListener("click",async()=>{
    const o=orders.find(x=>x.id===a.dataset.er); if(!o||o.erinnert) return;
    const {id:_,...rest}=o;
    try{await saveOrder(o.id,{...rest,erinnert:new Date().toISOString()})}catch(e){}
  }));
}
["#er-datum","#er-ort"].forEach(s=>$(s).addEventListener("change",renderErinnern));

/* =====================================================================
   Kunden-Link, Firma, Nachrichten (Warteliste, Rundnachricht, Bewertung),
   Fahrer-Ansicht, Auswertung, Quittung, Kontakte-Import
   ===================================================================== */
function appBase(){return new URL("./",location.href).href}
function orderLink(o){return o&&o.id&&String(o.id).length>=16?appBase()+"#/b/"+o.id:""}
function vorname(n){return String(n||"").trim().split(/\s+/)[0]||""}

/* ---------- Firma / Einstellungen ---------- */
var FIRMA_STD={name:"Geflügelverkauf Holle",adresse:"Eberhard-Unkraut-Str. 76, 33397 Rietberg",tel:"0157 80267793",
  google:"https://search.google.com/local/writereview?placeid=ChIJySyygQguukcRE0ze4HtAydE",fuss:""};
var firma={...FIRMA_STD};
function renderFirma(){[["name","#fi-name"],["adresse","#fi-adresse"],["tel","#fi-tel"],["google","#fi-google"],["fuss","#fi-fuss"]].forEach(([k,id])=>{const e=$(id);if(e&&document.activeElement!==e)e.value=firma[k]||""})}
window.__holle.db.doc("einstellungen/firma").onSnapshot(d=>{firma={...FIRMA_STD,...((d.exists&&d.data())||{})};renderFirma()},()=>{});
renderFirma();
$("#fi-save").onclick=async()=>{
  const v={name:$("#fi-name").value.trim(),adresse:$("#fi-adresse").value.trim(),tel:$("#fi-tel").value.trim(),google:$("#fi-google").value.trim(),fuss:$("#fi-fuss").value.trim()};
  try{await window.__holle.db.doc("einstellungen/firma").set(v);toast("Gespeichert")}catch(e){toast("Speichern fehlgeschlagen.")}
};

/* ---------- Nachrichten: Bereiche ---------- */
var nachSeg="tour";
function setSeg(s){nachSeg=s;["tour","warte","gutschein","rund","bewert","news","insta"].forEach(x=>{$("#seg-"+x).hidden=x!==s});if(s==="insta")igStart();if(s==="news")newsLaden();
  document.querySelectorAll("#nach-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.seg===s));
  if(s==="warte") ladeWarteliste(); renderNachrichten();}
document.querySelectorAll("#nach-seg button").forEach(b=>b.onclick=()=>setSeg(b.dataset.seg));
function badge(id,n){const e=$(id);if(!e)return;e.textContent=n;e.hidden=!n}
function renderNachrichten(){
  if(!$("#rn-list")||!aktionen||!warteliste||!firma) return;
  renderRund(); renderBewert(); renderWarteliste();
  badge("#nach-n",bewertKandidaten().length+warteliste.filter(w=>!w.benachrichtigt).length+gsOffenNeu());
}

/* ---------- Warteliste ---------- */
var warteliste=[];
async function ladeWarteliste(){
  const {data,error}=await SB.from("warteliste").select("*").is("erledigt",null).order("created");
  if(!error){warteliste=data||[];renderNachrichten()}
}
ladeWarteliste(); setInterval(ladeWarteliste,90000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)ladeWarteliste()});
function warteText(w){
  const p=products.find(x=>x.id===w.product_id), b=p&&p.bestand;
  return `Hallo ${vorname(w.name)}, gute Nachricht von Geflügelverkauf Holle 🐔\n${w.tier} ${b?`ist wieder da (${b} Stück verfügbar)`:"ist wieder da"}. Du hattest ${w.anzahl} vorgemerkt.\n\nDu kannst jetzt hier bestellen: ${appBase()}\nOder antworte einfach auf diese Nachricht.\n\n${SHOP_WA_TEXT_GRUSS}`;
}
function renderWarteliste(){
  const box=$("#wl-list"); if(!box) return;
  badge("#wl-n",warteliste.filter(w=>!w.benachrichtigt).length);
  if(!warteliste.length){box.innerHTML=`<p class="empty">Niemand auf der Warteliste.</p>`;return}
  const g=new Map(); warteliste.forEach(w=>{if(!g.has(w.tier))g.set(w.tier,[]);g.get(w.tier).push(w)});
  box.innerHTML=[...g.entries()].map(([tier,ws])=>{const p=products.find(x=>x.name===tier);
    return `<div class="stop"><div class="stophead"><b>${esc(tier)}</b><span class="sub">${ws.reduce((a,w)=>a+w.anzahl,0)} Stück gewünscht · Bestand: ${p?(p.bestand==null?"unbegrenzt":p.bestand):"–"}</span></div>`+
    ws.map(w=>`<div class="kitem${w.benachrichtigt?" bezahlt":""}"><div class="kl"><b>${esc(w.name)}</b> <span class="sub">${esc(w.telefon)} · ${w.anzahl} Stück · seit ${esc(new Date(w.created).toLocaleDateString("de-DE"))}</span>${w.bemerkung?`<div class="sub">💬 ${esc(w.bemerkung)}</div>`:""}</div>
      <div class="kr"><a class="btn ${w.benachrichtigt?"ghost":"wa"}" target="_blank" rel="noopener" data-wl="${w.id}" href="https://wa.me/${esc(waNum(w.telefon))}?text=${encodeURIComponent(warteText(w))}">${w.benachrichtigt?"✓ Nochmal":"Bescheid geben"}</a>
      <button class="btn ghost" type="button" data-wlx="${w.id}">Erledigt</button></div></div>`).join("")+`</div>`}).join("");
  box.querySelectorAll("[data-wl]").forEach(a=>a.addEventListener("click",async()=>{
    const w=warteliste.find(x=>x.id==a.dataset.wl); if(!w||w.benachrichtigt) return;
    w.benachrichtigt=new Date().toISOString(); await SB.from("warteliste").update({benachrichtigt:w.benachrichtigt}).eq("id",w.id); renderNachrichten();
  }));
  box.querySelectorAll("[data-wlx]").forEach(b=>b.onclick=async()=>{
    await SB.from("warteliste").update({erledigt:new Date().toISOString()}).eq("id",b.dataset.wlx);
    warteliste=warteliste.filter(x=>x.id!=b.dataset.wlx); renderNachrichten();
  });
}

/* ---------- Rundnachricht (z. B. Saisonstart) ---------- */
var aktionen={};
window.__holle.db.collection("aktionen").onSnapshot(s=>{aktionen={};s.docs.forEach(d=>aktionen[d.id]=d.data());renderRund()},()=>{});
const RN_STOPP="\n\nDu bekommst von uns unregelmäßig etwa alle 4–6 Wochen eine kurze Info zu Neuigkeiten und Tourterminen. Wenn du das nicht möchtest, antworte einfach mit STOPP – dann nehmen wir dich sofort aus der Liste.";
const RN_VORLAGEN=[{titel:"Saisonstart",aktion:"Saisonstart 2027",text:"Hallo {vorname}, hier ist Geflügelverkauf Holle aus Rietberg 🐔\nAb März sind wir wieder mit unseren Touren für dich unterwegs – mit Junghennen, Rassehühnern, Enten, Gänsen und mehr.\n\nDu kannst jetzt schon bequem vorbestellen und dir deine Tiere sichern: {link}"+RN_STOPP},{titel:"Erste Nachricht (neue Kontakte)",aktion:"Willkommen Liste",text:"Hallo {vorname}, hier ist Taulant von Geflügelverkauf Holle aus Rietberg 🐔\nIch habe deine Nummer noch von einem Hühnerkauf bzw. einer Anfrage bei uns gespeichert und möchte dich ab jetzt kurz informieren, wenn es Neuigkeiten gibt – z. B. neue Rassen, Tourtermine bei dir in der Nähe oder Angebote.\n\nBestellen kannst du jederzeit hier: {link}"+RN_STOPP},{titel:"Neue Tiere eingetroffen",aktion:"Neue Tiere",text:"Hallo {vorname}, frische Ware bei Geflügelverkauf Holle 🐔\nGerade sind neue Junghennen und Rassehühner eingetroffen – die beliebten Rassen sind oft schnell weg.\n\nSchau gleich rein und reservier dir deine Tiere: {link}"+RN_STOPP},{titel:"Tourtermine",aktion:"Tourtermine",text:"Hallo {vorname}, hier ist Geflügelverkauf Holle 🐔\nDie nächsten Tourtermine stehen fest – wir kommen wieder an unsere Haltepunkte in deiner Nähe.\n\nAlle Termine und Vorbestellung: {link}\nBestellst du vorher, ist dein Wunschtier sicher dabei."+RN_STOPP},{titel:"Frühjahr / Ostern",aktion:"Frühjahr",text:"Hallo {vorname}, der Frühling ist da 🌷🐔\nJetzt ist die beste Zeit, deinen Hühnerstall aufzustocken – wir haben Junghennen in vielen Farben und Rassen dabei.\n\nHier vorbestellen: {link}"+RN_STOPP},{titel:"Restplätze / Angebot",aktion:"Angebot",text:"Hallo {vorname}, kurze Info von Geflügelverkauf Holle 🐔\nFür die nächste Tour haben wir noch einige Tiere frei. Wer jetzt bestellt, bekommt sie garantiert.\n\nVerfügbare Tiere ansehen: {link}"+RN_STOPP},{titel:"Mein Holle vorstellen",aktion:"Mein Holle",text:"Hallo {vorname}, hier ist Geflügelverkauf Holle 🐔\nNeu für unsere Kunden: In „Mein Holle“ siehst du deine Hühner, deine Stempelkarte, unseren Spruch der Woche und alle Neuigkeiten – ganz ohne Anmeldung:\n{meinholle}\n\nTipp: Öffnen → Teilen → „Zum Home-Bildschirm“, dann hast du es wie eine App."+RN_STOPP},{titel:"Saisonende / Danke",aktion:"Saisonende",text:"Hallo {vorname}, die Tour-Saison ist zu Ende – vielen Dank, dass du bei Geflügelverkauf Holle gekauft hast! 🐔❤️\nIm März geht es wieder los. Bis dahin erreichst du uns jederzeit per WhatsApp, Abholung in Rietberg nach Absprache.\n\nVorbestellungen für nächstes Jahr: {link}"+RN_STOPP}];
const RN_STD=RN_VORLAGEN[0].text;
function rnKey(){return "rn-"+($("#rn-name").value.trim().toLowerCase().replace(/[^a-z0-9äöüß]+/g,"-").replace(/^-|-$/g,"")||"aktion")}
function rnText(k){const v=vorname(k.name);return ($("#rn-text").value||RN_STD).replace(/ ?\{vorname\}/g,v?" "+v:"").replaceAll("{link}",appBase()).replaceAll("{meinholle}",meinLink(k.key)||appBase())}
$("#rn-vorlage").innerHTML+=RN_VORLAGEN.map((v,i)=>`<option value="${i}">${esc(v.titel)}</option>`).join("");
$("#rn-vorlage").addEventListener("change",async()=>{const v=RN_VORLAGEN[+$("#rn-vorlage").value];if(!v)return;
  if($("#rn-text").value.trim()&&$("#rn-text").value!==v.text&&!confirm("Aktuellen Text durch die Vorlage ersetzen?")){$("#rn-vorlage").value="";return}
  $("#rn-name").value=v.aktion+" "+new Date().getFullYear();$("#rn-text").value=v.text;$("#rn-vorlage").value="";
  const k=rnKey(),cur=aktionen[k]||{};try{await window.__holle.db.doc("aktionen/"+k).set({...cur,name:$("#rn-name").value,text:v.text})}catch(e){}renderRund()});
$("#rn-name").addEventListener("change",()=>{const a=aktionen[rnKey()];$("#rn-text").value=(a&&a.text)||RN_STD;renderRund()});
$("#rn-text").addEventListener("change",async()=>{const k=rnKey(),a=aktionen[k]||{};try{await window.__holle.db.doc("aktionen/"+k).set({...a,name:$("#rn-name").value.trim(),text:$("#rn-text").value})}catch(e){}});
["#rn-f","#rn-ort"].forEach(s=>$(s).addEventListener("change",renderRund));
function renderRund(){
  const box=$("#rn-list"); if(!box||!aktionen) return;
  const key=rnKey(), a=aktionen[key]||{}, ges=a.gesendet||{};
  if(!$("#rn-text").value) $("#rn-text").value=a.text||RN_STD;
  let ks=kundenListe().filter(k=>telKey(k.telefon)&&!k.info.keineRund);
  const f=$("#rn-f").value;
  if(f==="best") ks=ks.filter(k=>k.anzahl>0); if(f==="kontakt") ks=ks.filter(k=>k.kontaktNur); if(f==="interessent") ks=ks.filter(k=>k.info.interessent); if(f==="stamm") ks=ks.filter(k=>k.anzahl>=3);
  const letzterOrt=k=>(k.orders.find(o=>o.status!=="storniert")||{}).ort||k.info.ort||"";
  const oSel=$("#rn-ort"), oc=oSel.value, orte=[...new Set(ks.map(letzterOrt).filter(Boolean))].sort((x,y)=>x.localeCompare(y,"de"));
  oSel.innerHTML=`<option value="">Alle</option>`+orte.map(o=>`<option${o===oc?" selected":""}>${esc(o)}</option>`).join("");
  if(oSel.value) ks=ks.filter(k=>letzterOrt(k)===oSel.value);
  ks.sort((x,y)=>(ges[x.key]?1:0)-(ges[y.key]?1:0)||x.name.localeCompare(y.name,"de"));
  if(($("#rn-text").value||"").includes("{meinholle}")) meinLinksLaden(ks.slice(0,400).map(k=>k.key),renderRund);
  $("#rn-info").textContent=`${ks.filter(k=>ges[k.key]).length} von ${ks.length} angeschrieben.`;
  box.innerHTML=ks.slice(0,400).map(k=>`<div class="kitem${ges[k.key]?" bezahlt":""}"><div class="kl"><b>${esc(k.name)}</b> <span class="sub">${esc(k.telefon)}${letzterOrt(k)?" · "+esc(letzterOrt(k)):k.kontaktNur?" · Kontakt":""}</span></div>
    <div class="kr"><a class="btn ${ges[k.key]?"ghost":"wa"}" target="_blank" rel="noopener" data-rn="${esc(k.key)}" href="https://wa.me/${esc(telKey(k.telefon))}?text=${encodeURIComponent(rnText(k))}">${ges[k.key]?"✓ Nochmal":"Senden"}</a>
      <button class="btn ghost" type="button" data-rnstop="${esc(k.key)}" title="Hat mit STOPP geantwortet">Stopp</button></div></div>`).join("")||`<p class="empty">Keine Kunden.</p>`;
  box.querySelectorAll("[data-rnstop]").forEach(b=>b.onclick=async()=>{const k=kundenListe().find(x=>x.key===b.dataset.rnstop);if(!k)return;
    if(!confirm(k.name+" hat STOPP geschrieben – keine Rundnachrichten mehr senden?"))return;
    await saveKunde(k.key,{keineRund:true,keineRundSeit:new Date().toISOString(),name:k.name,telefon:k.telefon});toast(k.name+" bekommt keine Rundnachrichten mehr");renderRund()});
  box.querySelectorAll("[data-rn]").forEach(el=>el.addEventListener("click",async()=>{
    const k=rnKey(),cur=aktionen[k]||{}; if((cur.gesendet||{})[el.dataset.rn]) return;
    const neu={...cur,name:$("#rn-name").value.trim(),text:$("#rn-text").value,gesendet:{...(cur.gesendet||{}),[el.dataset.rn]:new Date().toISOString()}};
    aktionen[k]=neu; renderRund(); try{await window.__holle.db.doc("aktionen/"+k).set(neu)}catch(e){toast("Speichern fehlgeschlagen.")}
  }));
}

/* ---------- Google-Bewertung: nur auf Knopfdruck, frühestens 7 Tage nach Abholung ---------- */
function bewertKandidaten(){
  const heute=new Date(), bis=iso(new Date(heute-7*864e5)), ab=iso(new Date(heute-90*864e5));
  const gefragt=new Set(orders.filter(o=>o.bewertung).map(kundeKey));
  const m=new Map();
  orders.filter(o=>o.status==="abgeholt"&&o.datum&&o.datum<=bis&&o.datum>=ab&&telKey(o.telefon)).forEach(o=>{
    const k=kundeKey(o); if(gefragt.has(k)||(kundenInfo[k]||{}).gewerbe) return;
    if(!m.has(k)||m.get(k).datum<o.datum) m.set(k,o);
  });
  return [...m.values()].sort((a,b)=>a.datum.localeCompare(b.datum));
}
function bewertText(o){
  return `Hallo ${vorname(o.kunde)}, hier ist Geflügelverkauf Holle 🐔\nWir hoffen, deine Tiere haben sich gut eingelebt!\n\nWenn du zufrieden bist, würden wir uns riesig über eine kurze Google-Bewertung freuen – das hilft uns als Familienbetrieb sehr:\n${firma.google}\n\nDanke dir!\n${SHOP_WA_TEXT_GRUSS}`;
}
async function setBewertung(id,wert){const o=orders.find(x=>x.id===id);if(!o)return;const {id:_,...rest}=o;try{await saveOrder(id,{...rest,bewertung:wert})}catch(e){toast("Speichern fehlgeschlagen.")}}
function renderBewert(){
  const box=$("#bw-list"); if(!box) return;
  const ks=bewertKandidaten(); badge("#bw-n",ks.length);
  box.innerHTML=ks.map(o=>{const tage=Math.round((Date.now()-new Date(o.datum+"T12:00"))/864e5);
    return `<div class="kitem"><div class="kl"><b>${esc(o.kunde)}</b> <span class="sub">abgeholt ${esc(dShort(o.datum))} (vor ${tage} Tagen) · ${esc(o.ort)}</span><div class="sub">${esc(tierText(o,", "))}</div></div>
    <div class="kr"><a class="btn wa" target="_blank" rel="noopener" data-bw="${esc(o.id)}" href="https://wa.me/${esc(telKey(o.telefon))}?text=${encodeURIComponent(bewertText(o))}">Anfragen</a>
    <button class="btn ghost" type="button" data-bwx="${esc(o.id)}">Nicht fragen</button></div></div>`}).join("")||`<p class="empty">Gerade niemand fällig.</p>`;
  box.querySelectorAll("[data-bw]").forEach(a=>a.addEventListener("click",()=>setBewertung(a.dataset.bw,new Date().toISOString())));
  box.querySelectorAll("[data-bwx]").forEach(b=>b.onclick=()=>setBewertung(b.dataset.bwx,"nein"));
}

/* ---------- Fahrer-Ansicht ---------- */
function renderFahrer(){
  const dSel=$("#fr-datum"); if(!dSel) return;
  const h=iso(new Date()), vor=iso(new Date(Date.now()-3*864e5));
  const act=orders.filter(o=>(o.status!=="storniert"||o.nichtDa)&&o.datum>=vor&&o.tour!=="R");
  const tage=[...new Set(act.map(o=>o.datum))].sort().slice(0,20);
  const def=tage.find(d=>d>=h)||tage[tage.length-1]||"";
  const cur=tage.includes(dSel.value)?dSel.value:def;
  dSel.innerHTML=tage.map(d=>`<option value="${d}"${d===cur?" selected":""}>${esc(dShort(d))}${d===h?" ("+T("heute")+")":""}</option>`).join("")||`<option value="">${T("keineTouren")}</option>`;
  const tSel=$("#fr-tour"), ts=[...new Set(act.filter(o=>o.datum===cur).map(o=>o.tour))].sort();
  const tc=ts.includes(tSel.value)?tSel.value:ts[0]||"";
  tSel.innerHTML=ts.map(t=>{const tr=tourById(t);return `<option value="${t}"${t===tc?" selected":""}>${esc(tr?tr.nr+" – "+tr.name:t)}</option>`}).join("");
  const os=act.filter(o=>o.datum===cur&&o.tour===tc), tr=tourById(tc);
  const bez=os.filter(o=>o.zahlung).reduce((a,o)=>a+(+o.zahlung.betrag||0),0), nd=os.filter(o=>o.nichtDa).length;
  $("#fr-kpis").innerHTML=os.length?`<div class="fz-zahlen"><span><b>${os.length}</b> ${T("kunden")}</span><span><b>${os.reduce((a,o)=>a+stueck(o),0)}</b> ${T("tiere")}</span><span>${T("kassiert")} <b>${esc(eur(bez))}</b> / ${esc(eur(os.reduce((a,o)=>a+betrag(o),0)))}</span>${nd?`<span><b>${nd}</b> ${T("nichtErsch")}</span>`:""}</div>`:"";
  if(os.length){const fertig=os.filter(o=>o.zahlung||o.nichtDa).length,pz=Math.round(fertig/os.length*100);
    $("#fr-kpis").insertAdjacentHTML("afterbegin",`<div class="fortschritt"><div class="fbar"><i style="width:${pz}%"></i></div><span>${T("erledigt",{a:fertig,b:os.length,p:pz})}</span></div>`);
    motivation(cur,tc,fertig,os.length);}
  if(!tr){$("#fr-list").innerHTML="";return}
  const mapsLink=q=>"https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(q);
  const telHref=o=>"tel:"+String(o.telefon||"").replace(/[^\d+]/g,"");
  const zeile=o=>{const z=o.zahlung, nr=telKey(o.telefon), id=esc(o.id);
    const extra=`${o.bemerkung?`<div class="fz-notiz">💬 ${esc(o.bemerkung)}</div>`:""}${o.ort===HOME&&o.adresse?`<div class="fz-notiz">🏠 ${esc(o.adresse)} · <a href="${esc(mapsLink(o.adresse))}" target="_blank" rel="noopener">${T("navi")}</a></div>`:""}`;
    if(o.nichtDa) return `<div class="fz erledigt"><div class="fz-kopf"><b>${esc(o.kunde)}</b><span class="chip">${T("nichtErsch")}</span></div>
      <div class="fz-tiere">${esc(tierText(o,", "))}</div><button class="linkbtn" type="button" data-nda="${id}">${T("rueck")}</button></div>`;
    if(z) return `<div class="fz erledigt"><div class="fz-kopf"><b>${esc(o.kunde)}</b><span class="fz-betrag ok">✓ ${esc(eur(z.betrag))}</span></div>
      <div class="fz-tiere">${tierHtml(o)}</div><div class="fz-fuss"><span class="sub">${esc(ZART[z.art]||z.art)}</span><button class="linkbtn" type="button" data-q="${id}">${T("quittung")}</button></div></div>`;
    const offen=frOffen===o.id;
    return `<div class="fz${offen?" auf":""}" data-fzo="${id}">
      <div class="fz-kopf"><b>${esc(o.kunde)}</b><span class="fz-betrag">${betrag(o)?esc(eur(betrag(o))):""}</span></div>
      <div class="fz-tiere">${tierHtml(o)}</div>${extra}
      <div class="fz-aktion">
        <button class="btn fz-kass" type="button" data-fk="${id}">${T("kassieren")}</button>
        ${nr?`<a class="ibtn" href="${esc(telHref(o))}" aria-label="${T("anrufen")}">📞</a><a class="ibtn wa" target="_blank" rel="noopener" href="https://wa.me/${esc(nr)}?text=${encodeURIComponent(woBistDuText(o))}" aria-label="WhatsApp">💬</a>`:""}
      </div>
      <div class="fz-kasse"${offen?"":" hidden"}>
        <label>${T("betrag")} <input data-fb="${id}" inputmode="decimal" value="${betrag(o)||""}" placeholder="€"></label>
        <div class="fz-arten"><button class="btn" type="button" data-fz="bar" data-fid="${id}">${T("bar")}</button><button class="btn ghost" type="button" data-fz="paypal" data-fid="${id}">PayPal</button><button class="btn ghost" type="button" data-fz="ueberweisung" data-fid="${id}">${T("ueberw")}</button></div>
        <button class="linkbtn fz-nd" type="button" data-nd="${id}">${T("nichtDaLang")}</button>
      </div>
    </div>`};
  $("#fr-list").innerHTML=tr.stops.map(st=>{
    const so=os.filter(o=>o.ort===st[1]).sort((a,b)=>a.kunde.localeCompare(b.kunde,"de")); if(!so.length) return "";
    const hh=st[1]===HOME?null:halt(st[1]), adr=hh?[hh.laden,navi(hh)].filter(Boolean).join(", "):"";
    const offen=so.filter(o=>!o.zahlung&&!o.nichtDa).length;
    return `<div class="stop"><div class="stophead"><div><b>${esc(st[0]?st[0]+" · ":"")}${esc(st[1])}</b><div class="sub">${esc(adr)}</div></div>
      <div class="btns"><span class="chip${offen?"":" abgeholt"}">${offen?offen+" "+T("offen"):T("fertig")}</span>${hh&&navi(hh)?`<a class="btn ghost" target="_blank" rel="noopener" href="${esc(mapsLink(navi(hh)))}">${T("navi")}</a>`:""}</div></div>
      ${so.map(zeile).join("")}</div>`}).join("")||`<p class="empty">${T("keine")}</p>`;
  $("#fr-list").querySelectorAll("[data-fz]").forEach(b=>b.onclick=()=>{const i=$("#fr-list").querySelector(`[data-fb="${CSS.escape(b.dataset.fid)}"]`);kaZahlung(b.dataset.fid,b.dataset.fz,i?i.value:undefined)});
  $("#fr-list").querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>quittung(b.dataset.q));
  $("#fr-list").querySelectorAll("[data-fk]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.fk, auf=frOffen!==id; frOffen=auf?id:null;
    $("#fr-list").querySelectorAll(".fz[data-fzo]").forEach(k=>{const an=auf&&k.dataset.fzo===id;k.classList.toggle("auf",an);k.querySelector(".fz-kasse").hidden=!an});
    if(auf){const i=$("#fr-list").querySelector(`[data-fb="${CSS.escape(id)}"]`);if(i)i.select()}});
  $("#fr-list").querySelectorAll("[data-nd]").forEach(b=>b.onclick=()=>nichtDa(b.dataset.nd,true));
  $("#fr-list").querySelectorAll("[data-nda]").forEach(b=>b.onclick=()=>nichtDa(b.dataset.nda,false));
}
["#fr-datum","#fr-tour"].forEach(s=>$(s).addEventListener("change",renderFahrer));

/* ---------- Auswertung ---------- */
function renderZahlen(){
  const jSel=$("#za-jahr"); if(!jSel) return;
  const jahre=[...new Set(orders.map(o=>(o.datum||"").slice(0,4)).filter(Boolean))].sort().reverse();
  const cur=jahre.includes(jSel.value)?jSel.value:(jahre.includes(String(new Date().getFullYear()))?String(new Date().getFullYear()):jahre[0]||"");
  jSel.innerHTML=jahre.map(j=>`<option${j===cur?" selected":""}>${j}</option>`).join("");
  const alleJ=orders.filter(o=>(o.datum||"").startsWith(cur)), os=alleJ.filter(o=>o.status!=="storniert");
  const umsatz=os.reduce((a,o)=>a+betrag(o),0), tiere=os.reduce((a,o)=>a+stueck(o),0);
  const erste=new Map(); orders.filter(o=>o.status!=="storniert").forEach(o=>{const k=kundeKey(o);if(!erste.has(k)||erste.get(k)>o.datum)erste.set(k,o.datum)});
  const kunden=new Set(os.map(kundeKey)), neu=[...kunden].filter(k=>(erste.get(k)||"").startsWith(cur)).length;
  const app=os.filter(o=>o.quelle==="kunde").length, sto=alleJ.length-os.length;
  $("#za-kpis").innerHTML=[[eur(umsatz),"Umsatz"],[tiere,"Tiere"],[os.length,"Bestellungen"],[kunden.size,"Kunden"],[neu,"Neukunden"],[os.length?eur(umsatz/os.length):"–","Ø pro Bestellung"],[os.length?Math.round(app/os.length*100)+" %":"–","über Kunden-App"],[alleJ.length?Math.round(sto/alleJ.length*100)+" %":"–","storniert"]]
    .map(([b,s])=>`<div class="kpi"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("");
  const tab=(rows,head,maxU)=>`<thead><tr>${head.map((h,i)=>`<th${i?' class="num"':""}>${h}</th>`).join("")}</tr></thead><tbody>`+
    rows.map(r=>`<tr><td>${esc(r[0])}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num" style="white-space:nowrap"><span class="bar" style="width:${maxU?Math.round(r[3]/maxU*80):0}px"></span>${esc(eur(r[3]))}</td></tr>`).join("")+`</tbody>`;
  const agg=(keyFn)=>{const m=new Map();os.forEach(o=>{const k=keyFn(o);const c=m.get(k)||[0,0,0];c[0]++;c[1]+=stueck(o);c[2]+=betrag(o);m.set(k,c)});return m};
  const MON=["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
  const mm=agg(o=>+o.datum.slice(5,7)), mrows=MON.map((n,i)=>{const c=mm.get(i+1)||[0,0,0];return [n,c[0],c[1],c[2]]}).filter(r=>r[1]);
  $("#za-monat").innerHTML=tab(mrows,["Monat","Bestellungen","Tiere","Umsatz"],Math.max(0,...mrows.map(r=>r[3])));
  const om=agg(o=>o.ort||"–"), orows=[...om.entries()].map(([k,c])=>[k,c[0],c[1],c[2]]).sort((a,b)=>b[3]-a[3]||b[2]-a[2]);
  $("#za-ort").innerHTML=tab(orows,["Haltepunkt","Bestellungen","Tiere","Umsatz"],Math.max(0,...orows.map(r=>r[3])));
  const tm=new Map(); os.forEach(o=>(o.positionen||[]).forEach(p=>{if(!p.tier||!+p.anzahl)return;const c=tm.get(p.tier)||[0,0,0];c[0]++;c[1]+=+p.anzahl;c[2]+=(+p.anzahl)*(+p.preis||0);tm.set(p.tier,c)}));
  const trows=[...tm.entries()].map(([k,c])=>[k,c[0],c[1],c[2]]).sort((a,b)=>b[2]-a[2]).slice(0,30);
  $("#za-tier").innerHTML=tab(trows,["Tierart","Bestellungen","Stück","Umsatz"],Math.max(0,...trows.map(r=>r[3])));
}
$("#za-jahr").addEventListener("change",renderZahlen);

/* ---------- Quittung als PDF ---------- */
async function logoDataUrl(){
  if(logoDataUrl.v) return logoDataUrl.v;
  try{const b=await fetch("./logo.png").then(r=>r.blob());logoDataUrl.v=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)})}catch(e){logoDataUrl.v=null}
  return logoDataUrl.v;
}
async function quittung(id){
  const o=orders.find(x=>x.id===id); if(!o) return;
  toast("Quittung wird erstellt …");
  const {jsPDF}=await import("jspdf");
  const d=new jsPDF({unit:"mm",format:"a5"}), W=148, L=14, R=W-14;
  const z=o.zahlung||{}, datum=z.zeit?new Date(z.zeit):new Date(o.datum+"T12:00");
  const nr="Q-"+datum.getFullYear()+"-"+String(o.id).slice(0,6).toUpperCase();
  const lg=await logoDataUrl(); if(lg) try{d.addImage(lg,"PNG",R-22,10,22,22)}catch(e){}
  d.setFont("helvetica","bold");d.setFontSize(15);d.text(firma.name||"Geflügelverkauf Holle",L,17);
  d.setFont("helvetica","normal");d.setFontSize(9);d.setTextColor(90);
  d.text([firma.adresse,firma.tel?"Telefon/WhatsApp: "+firma.tel:""].filter(Boolean),L,23);
  d.setTextColor(0);d.setFont("helvetica","bold");d.setFontSize(18);d.text("Quittung",L,44);
  d.setFont("helvetica","normal");d.setFontSize(10);
  d.text(`Nr. ${nr}`,R,44,{align:"right"});
  d.text(`Datum: ${datum.toLocaleDateString("de-DE")}`,R,50,{align:"right"});
  d.text(["Kunde:",o.kunde||"",o.adresse||o.wohnort||""].filter(Boolean),L,52);
  let y=72; d.setDrawColor(180);d.line(L,y-5,R,y-5);
  d.setFont("helvetica","bold");d.text("Anzahl",L,y);d.text("Tierart",L+18,y);d.text("Einzel",R-28,y,{align:"right"});d.text("Gesamt",R,y,{align:"right"});
  d.setFont("helvetica","normal");y+=3;d.line(L,y,R,y);y+=6;
  (o.positionen||[]).filter(p=>p.tier&&+p.anzahl).forEach(p=>{
    if(y>175){d.addPage();y=20}
    d.text(String(p.anzahl),L,y);d.text(d.splitTextToSize(p.tier,R-28-L-30),L+18,y);
    if(+p.preis){d.text(eur(+p.preis),R-28,y,{align:"right"});d.text(eur(+p.anzahl*+p.preis),R,y,{align:"right"})}
    y+=7;
  });
  d.line(L,y-3,R,y-3);y+=4;
  if(rabattEur(o)){d.text("Zwischensumme",L,y);d.text(eur(brutto(o)),R,y,{align:"right"});y+=6;d.text(rabattText(o),L,y);d.text("− "+eur(rabattEur(o)),R,y,{align:"right"});y+=8}
  const summe=z.betrag!=null?+z.betrag:betrag(o);
  d.setFont("helvetica","bold");d.setFontSize(12);d.text("Gesamtbetrag",L,y);d.text(eur(summe),R,y,{align:"right"});
  d.setFont("helvetica","normal");d.setFontSize(10);y+=8;
  if(z.art) d.text(`Bezahlt: ${ZART[z.art]||z.art}${z.art==="bar"?" – Betrag dankend erhalten.":""}`,L,y);
  if(Math.abs(summe-betrag(o))>0.009&&betrag(o)) {y+=6;d.setFontSize(8);d.setTextColor(90);d.text(`(Positionen ${eur(betrag(o))}, kassiert ${eur(summe)})`,L,y);d.setTextColor(0);d.setFontSize(10)}
  y+=18;d.line(L,y,L+60,y);d.setFontSize(8);d.setTextColor(90);d.text("Unterschrift / Stempel",L,y+4);
  if(firma.fuss){d.setFontSize(8);d.text(d.splitTextToSize(firma.fuss,R-L),L,196)}
  const file=new File([d.output("blob")],`Quittung-${nr}.pdf`,{type:"application/pdf"});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:"Quittung "+nr})}catch(e){}}
  else{const a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=file.name;document.body.appendChild(a);a.click();a.remove()}
}
// Quittung auch in der Kasse bei bezahlten Bestellungen
{
  const _rk=renderKasse;
  renderKasse=function(){_rk();const l=$("#ka-list");if(!l)return;
    l.querySelectorAll(".kitem.bezahlt .kr").forEach(kr=>{const id=kr.parentElement.querySelector("[data-kundo]")?.dataset.kundo||kr.closest(".kitem").dataset.oid;if(!id||kr.querySelector("[data-q]"))return;
      const b=document.createElement("button");b.className="btn ghost";b.type="button";b.dataset.q=id;b.textContent="Quittung";b.onclick=()=>quittung(id);kr.appendChild(b)});};
}

/* ---------- Kontakte vom Handy (vCard) ---------- */
function parseVcf(txt){
  const lines=txt.replace(/\r\n/g,"\n").replace(/\n[ \t]/g,"").split("\n"), out=[]; let c=null;
  const un=v=>v.replace(/\\n/gi," ").replace(/\\([,;\\])/g,"$1").trim();
  for(const l of lines){
    const i=l.indexOf(":"); if(i<0) continue;
    const head=l.slice(0,i), val=l.slice(i+1), name=head.split(";")[0].replace(/^item\d+\./i,"").toUpperCase();
    if(name==="BEGIN"&&/vcard/i.test(val)) c={fn:"",n:"",tels:[],org:"",ort:""};
    else if(name==="END"&&c){out.push(c);c=null}
    else if(!c) continue;
    else if(name==="FN") c.fn=un(val);
    else if(name==="N"){const p=val.split(";").map(un);c.n=[p[1],p[0]].filter(Boolean).join(" ")}
    else if(name==="ORG") c.org=un(val.split(";")[0]);
    else if(name==="TEL") c.tels.push({nr:val.replace(/^tel:/i,"").trim(),cell:/cell|mobile|iphone/i.test(head)});
    else if(name==="ADR"&&!c.ort){const p=val.split(";").map(un);c.ort=p[3]||""}
  }
  const mobil=t=>/^(\+?49|0049|0)1[5-7]/.test(t.replace(/[\s\-\/()]/g,""));
  return out.map(c=>{const t=c.tels.find(t=>mobil(t.nr))||c.tels.find(t=>t.cell)||c.tels[0];
    return t?{name:(c.fn||c.n||c.org||"").trim(),telefon:t.nr,org:c.org,ort:c.ort,key:telKey(t.nr)}:null}).filter(c=>c&&c.key);
}
var kiDaten=[];
$("#ki-file").addEventListener("change",async e=>{
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  const txt=await f.text(); const roh=parseVcf(txt), seen=new Set();
  const bekannt=new Set(kundenListe().map(k=>k.key));
  kiDaten=roh.filter(c=>!seen.has(c.key)&&seen.add(c.key)).map(c=>({...c,bekannt:bekannt.has(c.key),an:!bekannt.has(c.key)}))
    .sort((a,b)=>a.name.localeCompare(b.name,"de"));
  if(!kiDaten.length){toast("Keine Kontakte mit Telefonnummer in der Datei gefunden.");return}
  $("#ki-q").value=""; $("#kiDlg").hidden=false; renderKi();
});
function renderKi(){
  const q=$("#ki-q").value.trim().toLowerCase();
  const vis=kiDaten.filter(c=>!q||(c.name+" "+c.telefon+" "+c.org+" "+c.ort).toLowerCase().includes(q));
  $("#ki-list").innerHTML=vis.slice(0,5000).map(c=>`<label><input type="checkbox" data-ki="${esc(c.key)}"${c.an?" checked":""}${c.bekannt?" disabled":""}><span><b>${esc(c.name||"(ohne Namen)")}</b>${c.org&&c.org!==c.name?` <span class="sub">${esc(c.org)}</span>`:""}<br><span class="sub">${esc(c.telefon)}${c.ort?" · "+esc(c.ort):""}</span></span><span class="sub">${c.bekannt?"schon in der Kartei":""}</span></label>`).join("");
  $("#ki-info").textContent=`${kiDaten.filter(c=>c.an).length} von ${kiDaten.length} ausgewählt`;
  $("#ki-list").querySelectorAll("[data-ki]").forEach(i=>i.onchange=()=>{const c=kiDaten.find(x=>x.key===i.dataset.ki);c.an=i.checked;$("#ki-info").textContent=`${kiDaten.filter(c=>c.an).length} von ${kiDaten.length} ausgewählt`});
}
$("#ki-q").addEventListener("input",renderKi);
$("#ki-all").onclick=()=>{const q=$("#ki-q").value.trim().toLowerCase();kiDaten.forEach(c=>{if(!c.bekannt&&(!q||(c.name+" "+c.telefon).toLowerCase().includes(q)))c.an=true});renderKi()};
$("#ki-none").onclick=()=>{const q=$("#ki-q").value.trim().toLowerCase();kiDaten.forEach(c=>{if(!q||(c.name+" "+c.telefon).toLowerCase().includes(q))c.an=false});renderKi()};
$("#ki-close").onclick=()=>{$("#kiDlg").hidden=true};
$("#ki-go").onclick=async()=>{
  const sel=kiDaten.filter(c=>c.an&&!c.bekannt); if(!sel.length){toast("Nichts ausgewählt.");return}
  const now=new Date().toISOString();
  const rows=sel.map(c=>({coll:"kunden",id:c.key,data:{...(kundenInfo[c.key]||{}),kontakt:true,name:c.name||c.telefon,telefon:c.telefon,wohnort:c.ort||"",importiert:now,updated:now}}));
  $("#ki-go").disabled=true;
  try{
    for(let i=0;i<rows.length;i+=200){const {error}=await SB.from("bb_docs").upsert(rows.slice(i,i+200),{onConflict:"coll,id"});if(error) throw error}
    rows.forEach(r=>kundenInfo[r.id]=r.data); renderKunden(); renderNachrichten();
    $("#kiDlg").hidden=true; toast(`${rows.length} Kontakte importiert`);
  }catch(e){toast("Import fehlgeschlagen: "+(e.message||e))}
  $("#ki-go").disabled=false;
};

/* ---------- Fahrer-Zugänge ---------- */
const ROLLE=window.__holle.rolle||"admin";
if(ROLLE==="fahrer"){ showTab("fahrer"); }
async function ladeFahrer(){
  const box=$("#fz-list"); if(!box||ROLLE!=="admin") return;
  const {data}=await SB.from("staff").select("email,name,role,touren,tage").eq("role","fahrer").order("email");
  (data||[]).forEach(f=>{if(f.tage)f.tage=f.tage.map(d=>String(d).slice(0,10))});
  const TT=TOURS.filter(t=>t.id!=="R");
  box.innerHTML=(data||[]).map(f=>{const tu=f.touren||[];return `<div class="kitem"><div class="kl"><b>${esc(f.name||"Fahrer")}</b> <span class="sub">${esc(f.email)}</span>
      <div class="fztouren">Sieht: ${TT.map(t=>`<label><input type="checkbox" data-fzt="${esc(f.email)}" value="${t.id}"${tu.includes(t.id)?" checked":""}> ${esc(t.nr)}</label>`).join("")}
      <span class="sub">${tu.length?"":"(nichts angehakt = alle Touren)"}</span></div>
      <div class="fztouren">Tage: ${(f.tage||[]).map(d=>`<span class="chip">${esc(dShort(d))} <button class="linkbtn" type="button" data-fzdx="${esc(f.email)}" data-d="${d}" aria-label="Tag entfernen">×</button></span>`).join("")||'<span class="sub">alle Tage</span>'}
        <input type="date" data-fzd="${esc(f.email)}" style="width:auto"><button class="btn ghost" type="button" data-fzda="${esc(f.email)}">Tag hinzufügen</button></div></div>
    <div class="kr"><button class="btn warn" type="button" data-fzx="${esc(f.email)}">Zugang löschen</button></div></div>`}).join("")||`<p class="sub">Noch kein Fahrer-Zugang.</p>`;
  const tageSetzen=async(em,tage)=>{const {error}=await SB.rpc("fahrer_tage_setzen",{p_email:em,p_tage:tage});
    toast(error?error.message:tage.length?"Sieht nur: "+tage.sort().map(dShort).join(", "):"Sieht jetzt alle Tage"); ladeFahrer();};
  box.querySelectorAll("[data-fzda]").forEach(b=>b.onclick=()=>{const em=b.dataset.fzda,f=(data||[]).find(x=>x.email===em),v=box.querySelector(`[data-fzd="${CSS.escape(em)}"]`).value;
    if(!v){toast("Bitte erst ein Datum wählen.");return} tageSetzen(em,[...new Set([...(f.tage||[]),v])])});
  box.querySelectorAll("[data-fzdx]").forEach(b=>b.onclick=()=>{const em=b.dataset.fzdx,f=(data||[]).find(x=>x.email===em);tageSetzen(em,(f.tage||[]).filter(d=>d!==b.dataset.d))});
  box.querySelectorAll("[data-fzt]").forEach(c=>c.onchange=async()=>{
    const em=c.dataset.fzt, tu=[...box.querySelectorAll(`[data-fzt="${CSS.escape(em)}"]:checked`)].map(x=>x.value);
    const {error}=await SB.rpc("fahrer_touren_setzen",{p_email:em,p_touren:tu});
    toast(error?error.message:tu.length?"Sieht jetzt nur: "+tu.map(id=>tourById(id).nr).join(", "):"Sieht jetzt alle Touren"); ladeFahrer();
  });
  box.querySelectorAll("[data-fzx]").forEach(b=>b.onclick=async()=>{
    if(!confirm(`Zugang ${b.dataset.fzx} löschen? Der Fahrer kann sich dann nicht mehr anmelden.`)) return;
    const {error}=await SB.rpc("fahrer_entfernen",{p_email:b.dataset.fzx}); toast(error?error.message:"Zugang gelöscht"); ladeFahrer();
  });
}
$("#fz-add").onclick=async()=>{
  const {error}=await SB.rpc("fahrer_anlegen",{p_email:$("#fz-email").value,p_passwort:$("#fz-pw").value,p_name:$("#fz-name").value});
  if(error){toast(error.message);return}
  const login=new URL("./admin.html",location.href).href, mail=$("#fz-email").value.trim().toLowerCase(), pw=$("#fz-pw").value;
  toast("Zugang angelegt");
  const t=`Hallo ${$("#fz-name").value.trim()}, dein Zugang für die Holle-Fahrer-App:\n${login}\nE-Mail: ${mail}\nPasswort: ${pw}\n\nTipp: Seite im Safari öffnen → Teilen → „Zum Home-Bildschirm“.`;
  if(navigator.share){try{await navigator.share({text:t})}catch(e){}} else {try{await navigator.clipboard.writeText(t);toast("Zugangsdaten kopiert")}catch(e){}}
  $("#fz-pw").value=""; ladeFahrer();
};
if(ROLLE!=="admin"){const s=$("#fz-add")?.closest("section");document.querySelectorAll("#fz-name,#fz-email,#fz-pw,#fz-add").forEach(e=>e.disabled=true)}
ladeFahrer();

/* ---------- Fahrer: Kunde nicht da / Kunde anschreiben ---------- */
function woBistDuText(o){
  const t=tourById(o.tour), st=t?t.stops.find(s=>s[1]===o.ort):null;
  return `Hallo ${vorname(o.kunde)}, hier ist der Fahrer von Geflügelverkauf Holle 🐔\nWir sind ${st&&st[0]?"seit "+st[0]+" Uhr ":""}in ${o.ort} und haben deine Tiere dabei (${tierText(o,", ")}). Kommst du noch? Wir fahren bald weiter.`;
}
async function nichtDa(id,an){
  const o=orders.find(x=>x.id===id); if(!o) return;
  if(an&&!confirm(T("confirmNd",{k:o.kunde}))) return;
  const {id:_,...rest}=o, now=new Date().toISOString(), wer=(window.__holle.user&&window.__holle.user.email)||"";
  const upd={...rest,updated:now};
  if(an){upd.nichtDa={zeit:now,von:wer,vorher:o.status};upd.status="storniert";upd.bemerkung=[o.bemerkung,"Nicht erschienen "+new Date().toLocaleDateString("de-DE")].filter(Boolean).join(" · ")}
  else{upd.status=(o.nichtDa&&o.nichtDa.vorher)||"offen";delete upd.nichtDa;upd.bemerkung=String(o.bemerkung||"").replace(/\s*·?\s*Nicht erschienen \d\d\.\d\d\.\d{4}$/,"")}
  try{await saveOrder(id,upd);toast(an?`${o.kunde}: nicht erschienen`:"Zurückgenommen")}catch(e){toast("Speichern fehlgeschlagen.")}
}
// In der Kundenkartei anzeigen, wie oft jemand nicht gekommen ist
{
  const _rkd=renderKundeDetail;
  renderKundeDetail=function(){_rkd();const k=kSel&&kundenListe().find(x=>x.key===kSel);if(!k)return;
    const n=k.orders.filter(o=>o.nichtDa).length; if(!n) return;
    const h=$("#k-detail .khead .sub"); if(h&&!h.querySelector(".nd")) h.insertAdjacentHTML("beforeend",` <span class="chip nd" style="background:#fde7e9;color:#b3121f">${n}× nicht erschienen</span>`);};
}

/* ---------- Standort des Fahrers ---------- */
var standortWatch=null, standortLetzt=0;
const ST_KEY="holle-standort-teilen";
function naechsterHalt(lat,lng){
  let best=null;
  for(const [ort,[a,b]] of Object.entries(ORT_KOORD)){const km=kmLuft([lat,lng],[a,b]);if(!best||km<best.km)best={ort,km}}
  return best;
}
function kmLuft(a,b){const r=x=>x*Math.PI/180,dLat=r(b[0]-a[0]),dLng=r(b[1]-a[1]);const h=Math.sin(dLat/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(dLng/2)**2;return 2*6371*Math.asin(Math.sqrt(h))}
function standortStart(){
  if(!navigator.geolocation){toast("Dieses Handy kann keinen Standort senden.");return}
  try{localStorage.setItem(ST_KEY,"1")}catch(e){}
  standortWatch=navigator.geolocation.watchPosition(async p=>{
    if(Date.now()-standortLetzt<45000) return; standortLetzt=Date.now();
    const u=window.__holle.user;
    await SB.from("fahrer_position").upsert({email:(u.email||"").toLowerCase(),name:u.user_metadata?.name||null,lat:p.coords.latitude,lng:p.coords.longitude,genau:p.coords.accuracy,zeit:new Date().toISOString()},{onConflict:"email"});
    renderStandort();
  },e=>{toast(e.code===1?"Standort nicht erlaubt. In den Einstellungen für Safari freigeben.":"Standort gerade nicht verfügbar.");standortStop()},{enableHighAccuracy:true,maximumAge:30000,timeout:30000});
  renderStandort();
}
function standortStop(){if(standortWatch!=null)navigator.geolocation.clearWatch(standortWatch);standortWatch=null;try{localStorage.removeItem(ST_KEY)}catch(e){}renderStandort()}
async function renderStandort(){
  const box=$("#fr-standort"); if(!box) return;
  if(ROLLE==="fahrer"){
    box.innerHTML=standortWatch!=null
      ?`<div class="kabschluss done">${esc(T("stAn"))} <button class="btn ghost" type="button" id="st-aus">${T("aus")}</button></div>`
      :`<div class="kabschluss">${esc(T("stAus"))} <button class="btn" type="button" id="st-an">${T("teilen")}</button></div>`;
    const a=$("#st-an"),b=$("#st-aus"); if(a)a.onclick=standortStart; if(b)b.onclick=standortStop; return;
  }
  const {data}=await SB.from("fahrer_position").select("*").order("zeit",{ascending:false});
  const fs=(data||[]).filter(f=>Date.now()-new Date(f.zeit)<36*3600e3);
  box.innerHTML=fs.length?fs.map(f=>{const n=naechsterHalt(f.lat,f.lng),min=Math.round((Date.now()-new Date(f.zeit))/60000);
    const wo=n&&n.km<3?`ist in <b>${esc(n.ort)}</b>`:n?`ist ca. ${Math.round(n.km)} km von ${esc(n.ort)} entfernt`:"";
    return `<div class="kitem"><div class="kl">📍 <b>${esc(f.name||f.email)}</b> ${wo}<div class="sub">${min<1?"gerade eben":min<60?"vor "+min+" Min.":"vor "+Math.round(min/60)+" Std."}${min>10?" · Standort wird gerade nicht gesendet":""}</div></div>
      <div class="kr"><a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}">Karte</a></div></div>`}).join("")
    :`<p class="sub">📍 Kein Fahrer teilt gerade seinen Standort.</p>`;
}
if(ROLLE==="fahrer"){try{if(localStorage.getItem(ST_KEY))standortStart()}catch(e){}}
renderStandort(); setInterval(()=>{if(!document.hidden&&!$("#tab-fahrer").hidden)renderStandort()},30000);


/* ---------- Motivation für den Fahrer ---------- */
const MOTIV={
  erster:["Der erste Kunde ist glücklich – läuft! 🐔","Erster Kunde erledigt – guter Start! 💪","Los geht's – der Erste ist durch! 🚚"],
  25:["Ein Viertel geschafft – weiter so! 💪","25 % erledigt – du bist gut unterwegs! 🐔","Ein Viertel ist durch – stark angefangen! 👍"],
  50:["Halbzeit! Die Hälfte ist geschafft – stark! 🙌","50 % erledigt – ab jetzt geht's bergab! 🚚","Die Hälfte ist durch – richtig gut gemacht! 💪"],
  75:["Drei Viertel geschafft – der Endspurt beginnt! 🏁","Nur noch ein Viertel – gleich hast du's! 💪","75 % erledigt – die Hühner sind fast alle im neuen Zuhause! 🐔"],
  100:["Tour geschafft! Alle Kunden erledigt – super Arbeit, danke dir! 🎉","Fertig! Jeder Kunde erledigt – starke Leistung heute! 🏆","Alles erledigt – gute Heimfahrt und danke für deinen Einsatz! 🚚🐔"]
};
function motivation(datum,tour,fertig,gesamt){
  if(!gesamt) return;
  const stufen=[]; if(fertig>=1) stufen.push("erster");
  [25,50,75,100].forEach(p=>{if(fertig/gesamt*100>=p) stufen.push(String(p))});
  const key="holle-motiv-"+datum+"-"+tour; let gezeigt=null;
  try{gezeigt=JSON.parse(localStorage.getItem(key)||"null")}catch(e){}
  if(gezeigt===null){try{localStorage.setItem(key,JSON.stringify(stufen))}catch(e){}return} // beim Öffnen nichts nachholen
  const neu=stufen.filter(x=>!gezeigt.includes(x)); if(!neu.length) return;
  try{localStorage.setItem(key,JSON.stringify(stufen))}catch(e){}
  const st=neu[neu.length-1], liste=(SPRACHE!=="de"&&MOTIV_X[SPRACHE]&&MOTIV_X[SPRACHE][st])||MOTIV[st], text=liste[Math.floor(Math.random()*liste.length)];
  const name=vorname(window.__holle.user?.user_metadata?.name||"");
  zeigeMotivation((name?name+", ":"")+text, st==="100");
}
function zeigeMotivation(text,gross){
  document.querySelectorAll(".motiv").forEach(e=>e.remove());
  const d=document.createElement("div"); d.className="motiv"+(gross?" gross":""); d.setAttribute("role","status");
  d.innerHTML=`<div>${esc(text)}</div>`; d.onclick=()=>d.remove(); document.body.appendChild(d);
  try{navigator.vibrate&&navigator.vibrate(gross?[80,60,80,60,160]:80)}catch(e){}
  setTimeout(()=>d.remove(),gross?7000:4500);
}

/* ---------- Bild & Beschreibung je Tierart (Info-Knopf) ---------- */
const TIER_EINZAHL={"bielefelder kennhuhn":"Bielefelder Kennhühner","schwedisches blumenhuhn":"Schwedische Blumenhühner","zwerg lachshuhn":"Zwerg Lachshühner","zwerg wyandotte":"Zwerg Wyandotten","große wyandotte":"Große Wyandotten","deutsches lachshuhn":"Deutsche Lachshühner","bartzwerg":"Bartzwerge","seidenhuhn":"Seidenhühner","watermaalscher zwerg":"Watermaalsche Zwerge","weißhaube":"Weißhauben","moderner englischer zwergkämpfer":"Mod. Engl. Zwergkämpfer","flugerpel":"Flugenten","lauferpel":"Laufenten","wachtelhähne":"Wachtelhennen","wachtelhahn":"Wachtelhennen"};
function produktZuTier(tier){
  const b=String(tier||"").trim().replace(/\s+Hahn$/i,"").toLowerCase(), n=(TIER_EINZAHL[b]||b).toLowerCase();
  return products.find(p=>p.name.toLowerCase()===n)||null;
}
function tierHtml(o){
  return (o.positionen||[]).filter(p=>p.tier&&+p.anzahl).map(p=>{const pr=produktZuTier(p.tier),hat=pr&&(pr.bild_url||pr.beschreibung);
    return `<span class="tpos">${esc(p.anzahl)} × ${esc(p.tier)}${hat?` <button type="button" class="tinfo" data-ti="${pr.id}" aria-label="Info zu ${esc(pr.name)}">i</button>`:""}</span>`}).join(", ");
}
document.addEventListener("click",e=>{const b=e.target.closest(".tinfo");if(!b)return;e.preventDefault();e.stopPropagation();zeigeTierInfo(+b.dataset.ti)},true);
function tierDlg(){
  let d=$("#tierDlg"); if(d) return d;
  d=document.createElement("div"); d.id="tierDlg"; d.className="carddlg"; d.hidden=true;
  d.innerHTML=`<div class="cardbox" style="max-width:480px"><div id="tierDlgInhalt"></div></div>`;
  d.addEventListener("click",e=>{if(e.target===d)d.hidden=true}); document.body.appendChild(d); return d;
}
function zeigeTierInfo(id){
  const p=products.find(x=>x.id===id); if(!p) return;
  const d=tierDlg();
  $("#tierDlgInhalt").innerHTML=`<h3>${esc(p.name)}</h3><div class="sub" style="margin:-6px 0 10px">${esc(p.category||"")}</div>
    ${p.bild_url?`<img class="tierbild" src="${esc(p.bild_url)}" alt="${esc(p.name)}">`:""}
    ${p.beschreibung?`<p style="white-space:pre-line;margin:10px 0 0">${esc(p.beschreibung)}</p>`:""}
    <div class="actions" style="margin-top:12px"><button class="btn ghost" type="button" id="tierDlgZu">${T("schliessen")}</button></div>`;
  $("#tierDlgZu").onclick=()=>{d.hidden=true}; d.hidden=false;
}
async function bildVerkleinern(file,max=1400){
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=url});
    const f=Math.min(1,max/Math.max(img.width,img.height)), c=document.createElement("canvas");
    c.width=Math.round(img.width*f); c.height=Math.round(img.height*f); c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    return await new Promise(r=>c.toBlob(r,"image/jpeg",0.82));
  }finally{URL.revokeObjectURL(url)}
}
function tierInfoBearbeiten(id){
  const p=products.find(x=>x.id===id); if(!p) return;
  const d=tierDlg(); let neuesBild=null, bildWeg=false;
  $("#tierDlgInhalt").innerHTML=`<h3>${esc(p.name)}</h3>
    <p class="hint" style="margin-top:0">Das sehen deine Fahrer beim „i“ neben der Tierart, damit sie das Tier sicher erkennen.</p>
    <div id="ti-vorschau">${p.bild_url?`<img class="tierbild" src="${esc(p.bild_url)}" alt="">`:`<p class="sub">Noch kein Bild.</p>`}</div>
    <div class="actions" style="margin:8px 0"><label class="btn ghost" style="flex-direction:row;color:var(--accent);cursor:pointer">📷 Foto wählen<input type="file" id="ti-file" accept="image/*" hidden></label>
      ${p.bild_url?'<button class="btn ghost" type="button" id="ti-weg">Bild entfernen</button>':""}</div>
    <label class="full">Beschreibung / Erkennungsmerkmale<textarea id="ti-text" rows="5" placeholder="z. B. Gefieder schwarz mit grünem Glanz, roter Kamm, Federfüße, legt braune Eier …">${esc(p.beschreibung||"")}</textarea></label>
    <div class="actions" style="margin-top:12px"><button class="btn" type="button" id="ti-save">Speichern</button><button class="btn ghost" type="button" id="ti-zu">Abbrechen</button></div>`;
  $("#ti-file").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{neuesBild=await bildVerkleinern(f);bildWeg=false;$("#ti-vorschau").innerHTML=`<img class="tierbild" src="${URL.createObjectURL(neuesBild)}" alt="">`}catch(x){toast("Bild konnte nicht gelesen werden.")}};
  const w=$("#ti-weg"); if(w) w.onclick=()=>{bildWeg=true;neuesBild=null;$("#ti-vorschau").innerHTML=`<p class="sub">Bild wird entfernt.</p>`};
  $("#ti-zu").onclick=()=>{d.hidden=true};
  $("#ti-save").onclick=async()=>{
    $("#ti-save").disabled=true;
    try{
      const patch={beschreibung:$("#ti-text").value.trim()||null};
      if(neuesBild){
        const pfad=`p${p.id}-${Date.now()}.jpg`;
        const {error}=await SB.storage.from("tierbilder").upload(pfad,neuesBild,{contentType:"image/jpeg",upsert:false});
        if(error) throw error;
        patch.bild_url=SB.storage.from("tierbilder").getPublicUrl(pfad).data.publicUrl;
      } else if(bildWeg) patch.bild_url=null;
      const alt=p.bild_url&&(neuesBild||bildWeg)?p.bild_url.split("/tierbilder/")[1]:null;
      await patchProduct(p.id,patch);
      if(alt) SB.storage.from("tierbilder").remove([decodeURIComponent(alt)]).catch(()=>{});
      d.hidden=true; renderAll();
    }catch(e){toast("Speichern fehlgeschlagen: "+(e.message||e))}
    finally{const b=$("#ti-save");if(b)b.disabled=false}
  };
  d.hidden=false;
}


/* ---------- Sprachauswahl ---------- */
function spracheAnwenden(){
  const lab=(id,k)=>{const e=$(id);if(e&&e.parentElement&&e.parentElement.tagName==="LABEL"){e.parentElement.firstChild.nodeValue=T(k)}};
  lab("#fr-datum","tag"); lab("#fr-tour","tour");
  const h=$("#tab-fahrer > p.hint:last-of-type"); if(h) h.textContent=T("hint");
  const tb=document.querySelector('nav.tabs button[data-tab=fahrer]'); if(tb) tb.textContent=T("tabFahrer");
  if(ROLLE==="fahrer"){const lo=$("#logout");if(lo)lo.textContent=T("abmelden")}
  document.documentElement.lang=SPRACHE;
}
{
  const box=document.createElement("div"); box.className="sprachwahl";
  box.innerHTML=[["de","🇩🇪 Deutsch"],["en","🇬🇧 English"],["sq","🇦🇱 Shqip"],["ro","🇷🇴 Română"]].map(([c,n])=>`<button type="button" data-lang="${c}" aria-pressed="${c===SPRACHE}">${n}</button>`).join("");
  $("#tab-fahrer").prepend(box);
  box.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{SPRACHE=b.dataset.lang;try{localStorage.setItem("holle-sprache",SPRACHE)}catch(e){}
    box.querySelectorAll("[data-lang]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.lang===SPRACHE));spracheAnwenden();renderFahrer();renderStandort()});
  spracheAnwenden();
}

/* ---------- Datensicherung ---------- */
async function backupStatus(){
  const e=$("#bk-status"); if(!e||ROLLE!=="admin") return;
  const {data}=await SB.rpc("backup_status").then(r=>r,()=>({data:null}));
  e.textContent=data?`Letzte Sicherung: ${new Date(data.zeit).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"})} ${data.ok?"✓ an Telegram gesendet":"✗ fehlgeschlagen"+(data.info?" ("+data.info+")":"")}`:"Noch keine Sicherung gesendet.";
}
async function backupDaten(){
  const alle=async(t,sp="*")=>{const rows=[];for(let v=0;;v+=1000){const {data,error}=await SB.from(t).select(sp).range(v,v+999);if(error)throw error;rows.push(...data);if(data.length<1000)break}return rows};
  return {app:"holle-app",version:1,erstellt:new Date().toISOString(),tabellen:{bb_docs:await alle("bb_docs","coll,id,data,updated_at"),products:await alle("products"),fahrten:await alle("fahrten"),warteliste:await alle("warteliste")}};
}
if(ROLLE==="admin"){
  backupStatus();
  $("#bk-jetzt").onclick=async()=>{const {error}=await SB.rpc("backup_jetzt");toast(error?error.message:"Sicherung wird gesendet – kommt gleich in Telegram");setTimeout(backupStatus,15000)};
  $("#bk-dl").onclick=async()=>{
    try{toast("Sicherung wird erstellt …");const d=await backupDaten();
      const f=new File([JSON.stringify(d)],`Holle-Sicherung_${iso(new Date())}.json`,{type:"application/json"});
      if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]})}catch(e){}}
      else{const a=document.createElement("a");a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove()}
    }catch(e){toast("Sicherung fehlgeschlagen: "+(e.message||e))}
  };
  $("#bk-file").addEventListener("change",async ev=>{
    const f=ev.target.files[0]; ev.target.value=""; if(!f) return;
    let d; try{d=JSON.parse(await f.text())}catch(e){toast("Das ist keine Holle-Sicherung.");return}
    if(!d||d.app!=="holle-app"||!d.tabellen){toast("Das ist keine Holle-Sicherung.");return}
    const t=d.tabellen, n=(t.bb_docs||[]).filter(r=>r.coll==="orders").length;
    if(!confirm(`Sicherung vom ${new Date(d.erstellt).toLocaleString("de-DE")} einspielen?\n${n} Bestellungen, ${(t.products||[]).length} Tierarten, ${(t.fahrten||[]).length} Termine.\n\nVorhandene Einträge mit gleicher Nummer werden überschrieben, neuere Einträge bleiben erhalten.`)) return;
    if(!confirm("Wirklich einspielen? Das lässt sich nicht rückgängig machen.")) return;
    try{
      const up=async(tab,rows,conf)=>{for(let i=0;i<rows.length;i+=300){const {error}=await SB.from(tab).upsert(rows.slice(i,i+300),{onConflict:conf});if(error)throw new Error(tab+": "+error.message)}};
      const ohneId=rows=>rows.map(({id,...r})=>r);
      await up("products",ohneId(t.products||[]),"name"); await up("fahrten",ohneId(t.fahrten||[]),"datum,tour");
      await up("bb_docs",(t.bb_docs||[]).map(r=>({coll:r.coll,id:r.id,data:r.data,updated_at:r.updated_at||new Date().toISOString()})),"coll,id");
      await up("warteliste",t.warteliste||[],"id");
      toast("Sicherung eingespielt"); setTimeout(()=>location.reload(),1200);
    }catch(e){toast("Einspielen fehlgeschlagen: "+(e.message||e))}
  });
}else{document.querySelectorAll("#bk-jetzt,#bk-dl,#bk-file").forEach(e=>e.disabled=true)}

/* ---------- Instagram-Post zur Tour ---------- */
var igFahrten=null, igFoto=null, igGeladen=false;
const IG_ROT="#ff8a80", WT=["So","Mo","Di","Mi","Do","Fr","Sa"], WT_LANG=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
async function igStart(){
  if(!igGeladen){
    igGeladen=true;
    try{await Promise.all(["800 80px Outfit","600 40px Outfit","400 30px Outfit"].map(f=>document.fonts.load(f)))}catch(e){}
    const h=iso(new Date()), bis=iso(new Date(Date.now()+365*864e5));
    const {data}=await SB.from("fahrten").select("datum,tour,nur_orte,hinweis,aktiv").gte("datum",h).lte("datum",bis).eq("aktiv",true).order("datum");
    igFahrten=data||[];
    const tage=[...new Set(igFahrten.map(f=>f.datum))];
    $("#ig-datum").innerHTML=tage.map(d=>`<option value="${d}">${esc(dShort(d))} · ${igFahrten.filter(f=>f.datum===d).map(f=>tourById(f.tour)?.nr||f.tour).join(", ")}</option>`).join("")||`<option value="">Keine Termine</option>`;
    $("#ig-titel").value=igTitel();
    $("#ig-datum").addEventListener("change",()=>{igTourAuswahl();$("#ig-titel").value=igTitel();igMalen()});
    $("#ig-tour").addEventListener("change",igMalen);
    igTourAuswahl();
    ["#ig-format","#ig-titel","#ig-sub"].forEach(s=>$(s).addEventListener("input",igMalen));
    $("#ig-foto").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
      const url=URL.createObjectURL(f);igFoto=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=url});$("#ig-foto-weg").hidden=!igFoto;igMalen()});
    $("#ig-foto-weg").onclick=()=>{igFoto=null;$("#ig-foto-weg").hidden=true;igMalen()};
    $("#ig-share").onclick=igTeilen;
    $("#ig-copy").onclick=async()=>{try{await navigator.clipboard.writeText($("#ig-caption").value);toast("Text kopiert")}catch(e){$("#ig-caption").select();toast("Text markiert – jetzt kopieren")}};
  }
  igMalen();
}
function igTourAuswahl(){
  const d=$("#ig-datum").value, ts=(igFahrten||[]).filter(f=>f.datum===d).map(f=>f.tour);
  $("#ig-tour").innerHTML=`<option value="">Alle Touren an dem Tag${ts.length>1?" ("+ts.length+")":""}</option>`+ts.map(t=>{const tr=tourById(t);return `<option value="${t}">${esc(tr?tr.nr+" – "+tr.name:t)}</option>`}).join("");
}
function igTitel(){
  const d=$("#ig-datum").value; if(!d) return "";
  const dt=new Date(d+"T12:00"), tage=Math.round((dt-new Date(iso(new Date())+"T12:00"))/864e5);
  const wt=WT_LANG[dt.getDay()], dm=dt.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});
  return tage>=0&&tage<7?`Diesen *${wt}* kommen wir zu dir!`:`Hühner-Tour am *${wt}, ${dm}*`;
}
function igTouren(){
  const d=$("#ig-datum").value;
  const nur=$("#ig-tour").value;
  return (igFahrten||[]).filter(f=>f.datum===d&&(!nur||f.tour===nur)).map(f=>{const t=tourById(f.tour); if(!t) return null;
    const stops=t.stops.filter(s=>s[1]!==HOME&&(!f.nur_orte||!f.nur_orte.length||f.nur_orte.includes(s[1])));
    return {nr:t.nr,name:t.name,stops,hinweis:f.hinweis||""}}).filter(Boolean);
}
function igText(ctx,text,x,y,maxW){ // *Wort* in Hellrot
  const teile=text.split(/(\*[^*]+\*)/).filter(Boolean).map(t=>t.startsWith("*")?{t:t.slice(1,-1),rot:true}:{t,rot:false});
  const woerter=[]; teile.forEach(p=>p.t.split(/(\s+)/).filter(w=>w!=="").forEach(w=>woerter.push({w,rot:p.rot})));
  const zeilen=[[]]; let breite=0;
  woerter.forEach(w=>{const b=ctx.measureText(w.w).width; if(breite+b>maxW&&zeilen[zeilen.length-1].length&&w.w.trim()){zeilen.push([]);breite=0} if(!w.w.trim()&&!zeilen[zeilen.length-1].length)return; zeilen[zeilen.length-1].push(w);breite+=b});
  const lh=parseInt(ctx.font.match(/(\d+)px/)[1])*1.12;
  zeilen.forEach((z,i)=>{let xx=x;z.forEach(w=>{ctx.fillStyle=w.rot?IG_ROT:"#fff";ctx.fillText(w.w,xx,y+i*lh);xx+=ctx.measureText(w.w).width})});
  return y+zeilen.length*lh;
}
function igMalen(){
  const c=$("#ig-canvas"); if(!c) return;
  const story=$("#ig-format").value==="story", W=1080, H=story?1920:1350, P=72;
  c.width=W; c.height=H; const g=c.getContext("2d");
  // Hintergrund
  if(igFoto){const s=Math.max(W/igFoto.width,H/igFoto.height),w=igFoto.width*s,h=igFoto.height*s;g.drawImage(igFoto,(W-w)/2,(H-h)/2,w,h)}
  else{const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,"#3b0a0f");bg.addColorStop(1,"#120304");g.fillStyle=bg;g.fillRect(0,0,W,H)}
  // Kopfblock oben
  g.textBaseline="top";
  g.font="800 86px Outfit, sans-serif";
  const titel=$("#ig-titel").value||"", sub=$("#ig-sub").value||"";
  const kopfY=story?150:70;
  const mess=document.createElement("canvas").getContext("2d"); mess.font=g.font;
  const zeilen=Math.max(1,Math.ceil(mess.measureText(titel.replace(/\*/g,"")).width/(W-P*2-150)));
  const kopfH=kopfY+70+zeilen*96+30+(sub?60:0)+60;
  const kg=g.createLinearGradient(0,0,0,kopfH); kg.addColorStop(0,"rgba(110,8,16,.97)"); kg.addColorStop(1,"rgba(60,4,9,.90)");
  g.fillStyle=kg; g.fillRect(0,0,W,kopfH);
  g.font="600 30px Outfit, sans-serif"; g.fillStyle=IG_ROT; g.fillText("TOURTERMINE",P,kopfY);
  g.font="800 86px Outfit, sans-serif"; let y=igText(g,titel,P,kopfY+52,W-P*2-150);
  g.fillStyle="#e53935"; g.fillRect(P,y+14,160,10); y+=46;
  if(sub){g.font="400 40px Outfit, sans-serif";g.fillStyle="rgba(255,255,255,.92)";g.fillText(sub,P,y)}
  // Logo-Abzeichen
  const lg=$("#ig-canvas")._logo;
  if(lg){const r=62,cx=W-P-r+10,cy=kopfY+r-4;g.save();g.beginPath();g.arc(cx,cy,r+6,0,Math.PI*2);g.fillStyle="#fff";g.fill();g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.clip();g.drawImage(lg,cx-r,cy-r,r*2,r*2);g.restore()}
  else{const i=new Image();i.onload=()=>{c._logo=i;igMalen()};i.src="./logo.png"}
  // Haltepunkte: erst Zeilen sammeln, dann auf 1 oder 2 Spalten verteilen
  const touren=igTouren(), items=[];
  touren.forEach((t,ti)=>{items.push({art:"kopf",t:`${t.nr} · ${t.name}`.toUpperCase(),h:1.2,tour:ti});
    t.stops.forEach(st=>items.push({art:"halt",zeit:st[0]||"",ort:st[1],h:1,tour:ti}));
    if(t.hinweis) items.push({art:"hinweis",t:t.hinweis,h:1,tour:ti});
    items.push({art:"luecke",h:.35,tour:ti});});
  while(items.length&&items[items.length-1].art==="luecke") items.pop();
  const fussH=110, platzY=kopfH+40, platzH=H-platzY-fussH-30-48;
  const summe=items.reduce((a,x)=>a+x.h,0);
  let spalten=[items];
  if(summe*52>platzH&&items.length>3){
    // Trennstelle nahe der Mitte, bevorzugt an einem Tour-Anfang
    let acc=0,best=1,bestWert=1e9;
    for(let k=1;k<items.length;k++){acc+=items[k-1].h;const w=Math.abs(acc-summe/2)-(items[k].art==="kopf"?1.5:0);if(w<bestWert&&items[k].art!=="luecke"){bestWert=w;best=k}}
    spalten=[items.slice(0,best),items.slice(best).filter((x,k)=>!(k===0&&x.art==="luecke"))];
  }
  const maxU=Math.max(...spalten.map(sp=>sp.reduce((a,x)=>a+x.h,0)),1);
  const zh=Math.min(66,platzH/maxU), fs=Math.round(zh*.62);
  const panelH=maxU*zh+48, panelY=H-fussH-30-panelH;
  g.fillStyle="rgba(10,3,4,.72)"; rundRect(g,P-24,panelY,W-2*(P-24),panelH,28); g.fill();
  const sb=(W-2*P)/spalten.length;
  g.textBaseline="top";
  spalten.forEach((sp,si)=>{let yy=panelY+24; const x=P+si*sb, maxB=sb-(spalten.length>1?24:0);
    sp.forEach(it=>{
      if(it.art==="kopf"){g.font=`700 ${Math.round(fs*.85)}px Outfit, sans-serif`;g.fillStyle=IG_ROT;passend(g,it.t,x,yy,maxB)}
      else if(it.art==="halt"){g.font=`700 ${fs}px Outfit, sans-serif`;g.fillStyle="#fff";g.fillText(it.zeit,x,yy);
        const zx=it.zeit?fs*3.25:0;g.font=`400 ${fs}px Outfit, sans-serif`;passend(g,it.ort,x+zx,yy,maxB-zx)}
      else if(it.art==="hinweis"){g.font=`400 ${Math.round(fs*.78)}px Outfit, sans-serif`;g.fillStyle="rgba(255,255,255,.75)";passend(g,it.t,x,yy,maxB)}
      yy+=it.h*zh;});});
  if(!touren.length){g.font="400 40px Outfit, sans-serif";g.fillStyle="#fff";g.fillText("Kein Termin gewählt",P,panelY+30)}
  // Fußzeile
  g.fillStyle="rgba(0,0,0,.55)"; g.fillRect(0,H-fussH,W,fussH);
  g.font="600 34px Outfit, sans-serif"; g.fillStyle="#fff"; g.textBaseline="middle"; g.fillText("Geflügelverkauf Holle · @gefluegelholle",P,H-fussH/2);
  igCaption(touren);
}
function passend(g,text,x,y,maxB){ // Text bei Bedarf schmaler schreiben, damit er in die Spalte passt
  const b=g.measureText(text).width; if(b<=maxB){g.fillText(text,x,y);return}
  g.save();g.translate(x,y);g.scale(maxB/b,1);g.fillText(text,0,0);g.restore();
}
function rundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function igCaption(touren){
  const d=$("#ig-datum").value; if(!d){$("#ig-caption").value="";return}
  const dt=new Date(d+"T12:00");
  const orte=[...new Set(touren.flatMap(t=>t.stops.map(s=>s[1])))];
  const tags=orte.map(o=>"#"+o.replace(/\(.*?\)/g,"").replace(/[^A-Za-zÄÖÜäöüß]/g,"").toLowerCase()).filter(t=>t.length>2);
  $("#ig-caption").value=`🐔 ${$("#ig-titel").value.replace(/\*/g,"")}\n\n`+
    touren.map(t=>`📍 ${t.nr} · ${t.name} – ${WT[dt.getDay()]}, ${dt.toLocaleDateString("de-DE")}\n`+t.stops.map(s=>`${s[0]?s[0]+" ":""}${s[1]}`).join("\n")+(t.hinweis?`\n${t.hinweis}`:"")).join("\n\n")+
    `\n\nJunghennen, Rassehühner, Enten und mehr – jetzt bequem vorbestellen: ${appBase()}\nBezahlt wird bei Abholung.\n\n`+
    ["#hühner","#junghennen","#legehennen","#hühnerhaltung","#rassehühner","#gefluegelholle",...tags].slice(0,20).join(" ");
}
async function igTeilen(){
  const c=$("#ig-canvas"); const blob=await new Promise(r=>c.toBlob(r,"image/png"));
  const f=new File([blob],`Holle-Tour-${$("#ig-datum").value||"post"}.png`,{type:"image/png"});
  try{await navigator.clipboard.writeText($("#ig-caption").value)}catch(e){}
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]});toast("Text ist kopiert – im Post einfügen")}catch(e){}}
  else{const a=document.createElement("a");a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove()}
}

/* ---------- Mein Holle: Links, News, Sprüche ---------- */
var meinCache={}, meinLadend=false;
function meinLink(key){return meinCache[key]?appBase()+"#/k/"+meinCache[key]:""}
async function meinLinksLaden(keys,danach){
  const fehlt=[...new Set(keys.filter(k=>k&&!meinCache[k]))]; if(!fehlt.length||meinLadend) return;
  meinLadend=true;
  try{for(let i=0;i<fehlt.length;i+=300){const {data,error}=await SB.rpc("mein_links",{p_keys:fehlt.slice(i,i+300)});if(error)throw error;Object.assign(meinCache,data||{})}}
  catch(e){toast("Mein-Holle-Links konnten nicht geladen werden.")}
  meinLadend=false; danach&&danach();
}
var newsBild=null;
async function newsLaden(){
  const [{data:ns},{data:ps},{data:sp},{data:jetzt}]=await Promise.all([
    SB.from("news").select("*").order("erstellt",{ascending:false}).limit(30),
    SB.rpc("push_status"), SB.from("sprueche").select("*").order("id"), SB.rpc("spruch_der_woche")]);
  $("#nw-abos").textContent=ps?`${ps.abos} Kunden`:"–";
  $("#nw-list").innerHTML=(ns||[]).map(n=>`<div class="kitem${n.sichtbar?"":" bezahlt"}"><div class="kl"><b>${esc(n.titel)}</b> <span class="sub">${esc(new Date(n.erstellt).toLocaleDateString("de-DE"))}${n.gepusht?" · 🔔 gesendet":""}${n.sichtbar?"":" · ausgeblendet"}</span>${n.text?`<div class="sub">${esc(n.text.slice(0,140))}${n.text.length>140?" …":""}</div>`:""}</div>
    <div class="kr"><button class="btn ghost" type="button" data-nws="${n.id}">${n.sichtbar?"Ausblenden":"Einblenden"}</button><button class="btn ghost" type="button" data-nwx="${n.id}">Löschen</button></div></div>`).join("")||`<p class="empty">Noch keine News.</p>`;
  $("#nw-list").querySelectorAll("[data-nws]").forEach(b=>b.onclick=async()=>{const n=ns.find(x=>x.id==b.dataset.nws);await SB.from("news").update({sichtbar:!n.sichtbar}).eq("id",n.id);newsLaden()});
  $("#nw-list").querySelectorAll("[data-nwx]").forEach(b=>b.onclick=async()=>{if(!confirm("News löschen?"))return;await SB.from("news").delete().eq("id",b.dataset.nwx);newsLaden()});
  $("#sp-jetzt").textContent=jetzt||"–";
  $("#sp-list").innerHTML=(sp||[]).map(x=>`<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><input type="checkbox" data-spa="${x.id}"${x.aktiv?" checked":""} style="width:auto" title="aktiv"><input data-spt="${x.id}" value="${esc(x.text)}" style="flex:1"></div>`).join("");
  $("#sp-list").querySelectorAll("[data-spa]").forEach(c=>c.onchange=async()=>{await SB.from("sprueche").update({aktiv:c.checked}).eq("id",c.dataset.spa);toast("Gespeichert")});
  $("#sp-list").querySelectorAll("[data-spt]").forEach(i=>i.onchange=async()=>{const t=i.value.trim();if(!t)return;await SB.from("sprueche").update({text:t}).eq("id",i.dataset.spt);toast("Gespeichert")});
  $("#sp-add").onclick=async()=>{const t=$("#sp-neu").value.trim();if(!t)return;const max=Math.max(0,...(sp||[]).map(x=>x.id));const {error}=await SB.from("sprueche").insert({id:max+1,text:t});if(error){toast(error.message);return}$("#sp-neu").value="";newsLaden()};
}
$("#nw-bild").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;try{newsBild=await bildVerkleinern(f,1400);$("#nw-bild-info").textContent="✓ Bild gewählt"}catch(x){toast("Bild konnte nicht gelesen werden.")}});
$("#nw-go").onclick=async()=>{
  const titel=$("#nw-titel").value.trim(), text=$("#nw-text").value.trim(), push=$("#nw-push").checked;
  if(titel.length<3){toast("Bitte eine Überschrift eingeben.");return}
  if(push&&!confirm(`„${titel}“ veröffentlichen und als Mitteilung an alle senden?`)) return;
  $("#nw-go").disabled=true;
  try{
    let bild_url=null;
    if(newsBild){const pfad=`news-${Date.now()}.jpg`;const {error}=await SB.storage.from("tierbilder").upload(pfad,newsBild,{contentType:"image/jpeg"});if(error)throw error;bild_url=SB.storage.from("tierbilder").getPublicUrl(pfad).data.publicUrl}
    const {data,error}=await SB.from("news").insert({titel,text,bild_url}).select().single(); if(error) throw error;
    if(push){const r=await SB.rpc("news_push",{p_id:data.id}); if(r.error) throw r.error}
    $("#nw-titel").value="";$("#nw-text").value="";newsBild=null;$("#nw-bild-info").textContent="";
    toast(push?"Veröffentlicht und Mitteilung gesendet":"Veröffentlicht"); newsLaden();
  }catch(e){toast("Fehlgeschlagen: "+(e.message||e))}
  $("#nw-go").disabled=false;
};

function preisInfo(p){
  if(p.preis_info) return p.preis_info;
  const pr=typeof produktZuTier==="function"?produktZuTier(p.tier):null; if(!pr) return "";
  const hahn=/\bhahn\b/i.test(p.tier), von=hahn?pr.price_hahn:pr.price, bis=hahn?pr.price_hahn_bis:pr.price_bis;
  return von!=null&&bis!=null?`${eur(+von).replace(/\s*€$/,"")}–${eur(+bis)} je nach Alter`:"";
}

/* ---------- Interessenten direkt speichern ---------- */
(function(){
  var dlg=$("#inDlg"); if(!dlg) return;
  var orte=function(){var m=new Set();TOURS.forEach(function(t){t.stops.forEach(function(st){if(st[1]&&st[1]!==HOME)m.add(st[1])})});return [...m].sort(function(a,b){return a.localeCompare(b,"de")})};
  $("#in-open").onclick=function(){
    $("#dl-orte").innerHTML=orte().map(function(o){return `<option value="${esc(o)}">`}).join("");
    ["#in-name","#in-tel","#in-wohn","#in-ort","#in-int"].forEach(function(i){$(i).value=""});
    dlg.hidden=false; setTimeout(function(){$("#in-name").focus()},50);
  };
  $("#in-close").onclick=function(){dlg.hidden=true};
  $("#in-go").onclick=async function(){
    var name=$("#in-name").value.trim(), tel=$("#in-tel").value.trim(), key=telKey(tel);
    if(!key){toast("Bitte eine gültige Handynummer eingeben.");return}
    var cur=kundenInfo[key]||{}, now=new Date().toISOString();
    var data=Object.assign({},cur,{kontakt:true,interessent:true,name:name||cur.name||tel,telefon:tel,
      wohnort:$("#in-wohn").value.trim()||cur.wohnort||"",ort:$("#in-ort").value.trim()||cur.ort||"",
      interesse:$("#in-int").value.trim()||cur.interesse||"",angelegt:cur.angelegt||now,updated:now});
    $("#in-go").disabled=true;
    try{
      var r=await SB.from("bb_docs").upsert([{coll:"kunden",id:key,data:data}],{onConflict:"coll,id"}); if(r.error) throw r.error;
      kundenInfo[key]=data; dlg.hidden=true; toast((cur.name?"Aktualisiert: ":"Gespeichert: ")+data.name);
      renderKunden(); renderNachrichten();
    }catch(e){toast("Speichern fehlgeschlagen: "+(e.message||e))}
    $("#in-go").disabled=false;
  };
})();

/* ---------- Gutscheine (Bestellungen aus der Kunden-App, #/gutschein) ---------- */
var gutscheine=[], gsEinst={};
function gsOffenNeu(){return (gutscheine||[]).filter(g=>g.status==="neu").length}
const GS_ST={neu:"Neu",bestaetigt:"Zahlung angefragt",bezahlt:"Bezahlt",verschickt:"Verschickt",abgeholt:"Abgeholt",eingeloest:"Eingelöst",storniert:"Storniert"};
window.__holle.db.collection("gutscheine").onSnapshot(s=>{gutscheine=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.created).localeCompare(String(a.created)));renderGutscheine();badge("#gs-n",gsOffenNeu());try{renderNachrichten()}catch(e){}},()=>{});
window.__holle.db.collection("einstellungen").onSnapshot(s=>{const d=s.docs.find(x=>x.id==="gutschein");gsEinst=d?d.data():{};
  [["paypal","#gs-paypal"],["iban","#gs-iban"]].forEach(([k,id])=>{const e=$(id);if(e&&document.activeElement!==e)e.value=gsEinst[k]||""})},()=>{});
["#gs-paypal","#gs-iban"].forEach(id=>{const e=$(id);if(e)e.addEventListener("change",async()=>{
  const v={...gsEinst,paypal:$("#gs-paypal").value.trim(),iban:$("#gs-iban").value.trim(),updated:new Date().toISOString()};
  try{await window.__holle.db.doc("einstellungen/gutschein").set(v);gsEinst=v;toast("Gespeichert")}catch(x){toast("Speichern fehlgeschlagen.")}})});
["#gs-such","#gs-filter"].forEach(id=>{const e=$(id);if(e)e.addEventListener("input",renderGutscheine)});
function gsEuro(n){return Number(n||0).toLocaleString("de-DE")+" €"}
function gsBestaetText(g){
  const zahl=[gsEinst.paypal?`PayPal: ${gsEinst.paypal}`:"",gsEinst.iban?`Überweisung: ${gsEinst.iban}`:""].filter(Boolean).join("\n")||"PayPal: [ ]\nÜberweisung: [ ]";
  return `Hallo ${vorname(g.name)}, vielen Dank für deine Gutschein-Bestellung bei Geflügelverkauf Holle 🎁🐔\n\n${g.anzahl}× Gutschein über ${gsEuro(g.wert)} (${g.motiv==="neutral"?"ganzjährig":"Weihnachten"})\nGesamt: ${gsEuro(g.summe)}\n\nBitte überweise den Betrag mit dem Verwendungszweck ${g.nr}:\n${zahl}\n\n`+
    (g.art==="post"?`Sobald das Geld da ist, schreiben wir den Gutschein von Hand und schicken ihn per Post an:\n${g.adresse}`:`Sobald das Geld da ist, liegt der Gutschein in Rietberg für dich bereit. Wann passt dir die Abholung?`)+`\n\n${SHOP_WA_TEXT_GRUSS}`;
}
function gsBezahltText(g){return `Hallo ${vorname(g.name)}, die Zahlung für deinen Gutschein ${g.nr} ist angekommen – danke! 🎁\n`+(g.art==="post"?"Der Gutschein geht jetzt in die Post.":"Der Gutschein liegt in Rietberg für dich bereit.")+`\n\n${SHOP_WA_TEXT_GRUSS}`}
async function gsSetze(id,patch){const g=gutscheine.find(x=>x.id===id);if(!g)return;const {id:_i,...d}=g;const neu={...d,...patch,updated:new Date().toISOString()};
  try{await window.__holle.db.doc("gutscheine/"+id).set(neu);Object.assign(g,patch);renderGutscheine();badge("#gs-n",gsOffenNeu())}catch(e){toast("Hat nicht geklappt.")}}
function renderGutscheine(){
  const box=$("#gs-list"); if(!box) return;
  const q=($("#gs-such")&&$("#gs-such").value||"").trim().toLowerCase(), f=$("#gs-filter")?$("#gs-filter").value:"offen";
  let ls=gutscheine.filter(g=>f==="alle"?true:f==="eingeloest"?g.status==="eingeloest":!["eingeloest","storniert"].includes(g.status));
  if(q) ls=ls.filter(g=>(g.nr+" "+g.name+" "+(g.fuer||"")).toLowerCase().includes(q));
  const bez=gutscheine.filter(g=>["bezahlt","verschickt","abgeholt","eingeloest"].includes(g.status));
  const offenWert=gutscheine.filter(g=>["bezahlt","verschickt","abgeholt"].includes(g.status)).reduce((a,g)=>a+(+g.summe||0),0);
  if($("#gs-info")) $("#gs-info").textContent=`${gutscheine.length} Bestellungen · ${bez.reduce((a,g)=>a+(+g.anzahl||0),0)} Gutscheine bezahlt (${gsEuro(bez.reduce((a,g)=>a+(+g.summe||0),0))}) · noch nicht eingelöst: ${gsEuro(offenWert)}`;
  if(!ls.length){box.innerHTML=`<p class="empty">Keine Gutscheine in dieser Ansicht.</p>`;return}
  box.innerHTML=ls.map(g=>{const st=g.status||"neu";
    const btn=(k,l,cls="ghost")=>`<button class="btn ${cls}" type="button" data-gs="${esc(g.id)}" data-st="${k}">${l}</button>`;
    const wa=(t,l,cls,st2)=>`<a class="btn ${cls}" target="_blank" rel="noopener" data-gswa="${esc(g.id)}" data-st="${st2||""}" href="https://wa.me/${esc(waNum(g.telefon))}?text=${encodeURIComponent(t)}">${l}</a>`;
    let aktion="";
    if(st==="neu") aktion=wa(gsBestaetText(g),"Bestätigen + Zahlungsdaten","wa","bestaetigt");
    else if(st==="bestaetigt") aktion=btn("bezahlt","✓ Bezahlt","primary")+wa(gsBestaetText(g),"Nochmal schreiben","ghost");
    else if(st==="bezahlt") aktion=(g.art==="post"?btn("verschickt","✓ Verschickt","primary"):btn("abgeholt","✓ Abgeholt","primary"))+wa(gsBezahltText(g),"Zahlung bestätigen","wa");
    else if(st==="verschickt"||st==="abgeholt") aktion=btn("eingeloest","Eingelöst");
    if(!["eingeloest","storniert"].includes(st)) aktion+=btn("storniert","Storno");
    return `<div class="kitem${["eingeloest","storniert"].includes(st)?" bezahlt":""}"><div class="kl"><b>${esc(g.nr)}</b> · <b>${esc(g.name)}</b> <span class="sub">${esc(g.telefon)}${g.email?" · "+esc(g.email):""}</span>
      <div>${g.anzahl}× ${gsEuro(g.wert)} = <b>${gsEuro(g.summe)}</b> · ${g.motiv==="neutral"?"ganzjährig":"Weihnachten"} · ${g.art==="post"?(g.an==="beschenkt"?"Post direkt an Beschenkten":"Post an Käufer"):"Abholung Rietberg"}</div>
      ${g.art==="post"?`<div class="sub">📮 ${esc(g.adresse)}</div>`:""}
      ${g.fuer||g.von?`<div class="sub">✍️ Für: ${esc(g.fuer||"–")} · Von: ${esc(g.von||"–")}</div>`:""}
      ${g.bemerkung?`<div class="sub">💬 ${esc(g.bemerkung)}</div>`:""}
      <div class="sub">${esc(GS_ST[st]||st)} · bestellt ${esc(new Date(g.created).toLocaleDateString("de-DE"))}</div></div>
      <div class="kr">${aktion}</div></div>`}).join("");
  box.querySelectorAll("[data-gs]").forEach(b=>b.onclick=()=>{const st=b.dataset.st;if(st==="storniert"&&!confirm("Gutschein-Bestellung stornieren?"))return;gsSetze(b.dataset.gs,{status:st,["am_"+st]:new Date().toISOString()})});
  box.querySelectorAll("[data-gswa]").forEach(a=>a.addEventListener("click",()=>{if(a.dataset.st)gsSetze(a.dataset.gswa,{status:a.dataset.st,am_bestaetigt:new Date().toISOString()})}));
}
