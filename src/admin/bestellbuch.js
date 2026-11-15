import { TOURS as TOURS_BASE, ORT_FARBE } from '../tours.js';

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
const betrag=o=>(o.positionen||[]).reduce((a,p)=>a+(+p.anzahl||0)*(+p.preis||0),0);
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
function calcTotal(){const o={positionen:readPos()};const n=stueck(o),b=betrag(o);$("#f-total").textContent=n?`${n} Tiere${b?" · "+eur(b):""}`:""}
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
  $("#f-rhythm").innerHTML=rhythmInfo(o.datum);
  $("#formTitle").textContent="Bestellung bearbeiten: "+(o.kunde||"");$("#saveBtn").textContent="Änderungen speichern";
  $("#delWrap").innerHTML=`<button type="button" class="btn warn" id="delBtn">Löschen</button>`;
  $("#delBtn").onclick=()=>{$("#delWrap").innerHTML=`<span class="confirm">Wirklich löschen? <button type="button" class="btn warn" id="delYes">Ja, löschen</button><button type="button" class="btn ghost" id="delNo">Nein</button></span>`;
    $("#delYes").onclick=async()=>{try{await deleteOrder(id);toast("Bestellung gelöscht");resetForm()}catch(e){toast("Löschen fehlgeschlagen. Bitte erneut versuchen.")}};
    $("#delNo").onclick=()=>editOrder(id)};
  calcTotal();showTab("neu");window.scrollTo({top:0,behavior:"smooth"});
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
  const o={kunde:$("#f-kunde").value.trim(),telefon:$("#f-tel").value.trim(),wohnort:$("#f-wohnort").value.trim(),
    datum:$("#f-datum").value,tour:fTour.value,ort:fOrt.value,adresse:fOrt.value===HOME?$("#f-adresse").value.trim():"",positionen:pos,status:$("#f-status").value,
    bemerkung:$("#f-bem").value.trim(),created:old?.created||now,updated:now};
  if(old?.beispiel) o.beispiel=true;if(old?.quelle) o.quelle=old.quelle;
  $("#saveBtn").disabled=true;
  try{await saveOrder(editId,o);lastDate=o.datum;lastTour=o.tour;lastOrt=o.ort;toast(editId?"Änderungen gespeichert":`Gespeichert: ${o.kunde}, ${stueck(o)} Tiere`);resetForm()}
  catch(err){toast(err&&err.code==="quota_exceeded"?"Speicher voll. Alte Bestellungen löschen.":"Speichern fehlgeschlagen. Bitte erneut versuchen.")}
  finally{$("#saveBtn").disabled=false}
});

/* ---------- Tabs ---------- */
function showTab(id){document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===id));
  ["neu","liste","kunden","bedarf","bestell","lade","fahr","nach","app"].forEach(t=>$("#tab-"+t).hidden=t!==id);try{localStorage.setItem("holle-tab",id)}catch(e){}}
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
  renderList();renderPaper();renderBedarf();renderReminder();renderNeu();renderKunden();renderBestell();dateOptions($("#f2-datum"),false);renderFahr();if(!renderPlzTable.done){renderPlzTable();renderPlzTable.done=1}
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
  return `Hallo ${vn}, deine Bestellung bei Geflügelverkauf Holle ist bestätigt:\n`+
    (o.positionen||[]).map(p=>`• ${p.anzahl} × ${p.tier}`).join("\n")+
    `\n\nAbholung: ${abholText(o)}\nBezahlung bei Abholung (bar, PayPal oder Überweisung).\nFalls etwas dazwischenkommt, sag bitte mindestens 24–36 Stunden vorher Bescheid.\n\n${SHOP_WA_TEXT_GRUSS}`;
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
      <div class="tiere">${esc(tierText(o,", "))}${betrag(o)?` · ${esc(eur(betrag(o)))}`:""}</div>
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
  const {data,error}=await SB.from("products").select("*").order("sort").order("name");
  if(error){toast("Sortiment konnte nicht geladen werden.");return}
  products=data||[];
  products.forEach(p=>{
    if(p.price!=null) PREIS_VORSCHLAG[p.name]=+p.price;
    if(p.price_hahn!=null) PREIS_VORSCHLAG[p.name+" Hahn"]=+p.price_hahn;
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
  tb.innerHTML=`<thead><tr><th>In App</th><th>Tierart</th><th class="num">Preis €</th><th class="num">Hahn €</th><th>Hinweis</th></tr></thead><tbody>`+
    products.map(p=>{const head=p.category!==last?(last=p.category):null;
      return (head?`<tr class="tot"><td colspan="5">${esc(head)}</td></tr>`:"")+
      `<tr><td><input type="checkbox" data-pid="${p.id}" data-f="available" ${p.available?"checked":""} style="width:22px;height:22px"></td>
       <td>${esc(p.name)}</td>
       <td class="num"><input data-pid="${p.id}" data-f="price" value="${p.price??""}" inputmode="decimal" style="width:80px;text-align:right"></td>
       <td class="num"><input data-pid="${p.id}" data-f="price_hahn" value="${p.price_hahn??""}" inputmode="decimal" style="width:80px;text-align:right"></td>
       <td><input data-pid="${p.id}" data-f="price_note" value="${esc(p.price_note??"")}" placeholder="z. B. je nach Alter"></td></tr>`}).join("")+`</tbody>`;
  tb.querySelectorAll("input[data-pid]").forEach(i=>i.addEventListener("change",()=>{
    const f=i.dataset.f;let v;
    if(f==="available") v=i.checked;
    else if(f==="price_note") v=i.value.trim()||null;
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
  const {data}=await SB.from("app_settings").select("value").eq("key","ntfy_topic").maybeSingle();
  $("#push-topic").textContent=data?.value||"(noch nicht eingerichtet – Datenbank-Umstellung ausführen)";
})();
$("#push-copy").onclick=async()=>{try{await navigator.clipboard.writeText($("#push-topic").textContent);toast("Kopiert")}catch(e){toast("Bitte von Hand markieren und kopieren.")}};
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
  });
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
  try{await window.__holle.db.doc("kunden/"+key).set({...cur,...patch,updated:new Date().toISOString()});toast("Gespeichert")}
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
  ks.sort((a,b)=>b.frei-a.frei||(b.letzte||"").localeCompare(a.letzte||"")||a.name.localeCompare(b.name,"de"));
  tb.innerHTML=`<thead><tr><th>Kunde</th><th class="num">Bestellungen</th><th class="num">Tiere</th><th class="num">Umsatz</th><th>Zuletzt</th><th>Stempelkarte</th></tr></thead><tbody>`+
    (ks.length?ks.slice(0,300).map(k=>`<tr class="row" data-k="${esc(k.key)}" tabindex="0"><td><b>${esc(k.name)}</b><br><span class="sub">${esc(k.telefon)}${k.wohnort?" · "+esc(k.wohnort):""}</span></td>
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
      <button class="btn ghost" type="button" id="k-neu">Neue Bestellung</button></div>
    <div class="section-h">Stempelkarte</div>
    ${k.info.gewerbe?`<p>Als <b>Gewerbe / Mobilstall</b> markiert – keine Stempelkarte.</p><button class="btn ghost" type="button" id="k-gew0">Doch Privatkunde</button>`:
      k.info.karte?`<div class="bigdots">${stempelDots(k)}</div>
        <p><b>${k.stempel}</b> Stempel gesammelt seit ${esc(dShort(k.info.seit))} · ${+k.info.eingeloest||0}× eingelöst${k.frei?` · <b class="ok">${k.frei} Gratis-Huhn fällig</b>`:` · noch ${10-k.rest} bis zum Gratis-Huhn`}</p>
        <div class="btns">${k.frei?`<button class="btn" type="button" id="k-einl">Gratis-Huhn einlösen</button>`:""}
        ${wa?`<a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/${esc(waNum(k.telefon))}?text=${encodeURIComponent(`Hallo ${(k.name||"").split(" ")[0]}, deine Holle-Stempelkarte: ${k.stempel} Stempel${k.frei?` – du hast ${k.frei} Huhn nach Wahl (bis 30 €) gratis! 🐔`:`, noch ${10-k.rest} bis zu deinem Gratis-Huhn.`}\nViele Grüße\nGeflügelverkauf Holle`)}">Stand per WhatsApp</a>`:""}
        <button class="btn warn" type="button" id="k-aus">Karte beenden</button></div>`:
      `<p class="sub">Noch keine Stempelkarte. Richte sie ein, wenn der Kunde danach fragt.</p>
       <div class="btns"><button class="btn" type="button" id="k-an">Stempelkarte einrichten</button><button class="btn ghost" type="button" id="k-gew">Gewerbe / Mobilstall</button></div>`}
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
  on("#k-neu",()=>{resetForm();$("#f-kunde").value=k.name;$("#f-tel").value=k.telefon;$("#f-wohnort").value=k.wohnort;showTab("neu");window.scrollTo({top:0,behavior:"smooth"})});
}
["#k-q","#k-f"].forEach(s=>$(s).addEventListener("input",renderKunden));
