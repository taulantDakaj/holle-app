/* Touren und Haltepunkte – gemeinsame Daten für Kunden-App und Verwaltung (aus dem Bestellbuch) */
export const TOURS=[
 {id:"T1",nr:"Tour 1",name:"Kreis Eichsfeld",weeks:[2,4],rhythm:"jeden 2. und 4. Samstag",stops:[
  ["06:00","Diemelstadt","SVG Rastplatz A44"],["06:15","Burghasungen (Zierenberg)","Pendlerparkplatz A44"],["07:15","Dramfeld","Hauptstraße 59, Rosdorf"],
  ["08:15","Teistungen","Gemeindehaus Parkplatz"],["09:00","Worbis","Honsel Tankstelle, Nordhäuser Str. 44"],["10:00","Nordhausen","Scheunenhof Sundhausen, Uthleber Str. 24"],
  ["11:15","Dingelstädt","Am Schützenplatz"],["12:00","Groß Bartloff","Edeka Müller, Auf der Rinne 4"],["12:15","Geismar","Am Anger (Thüringen)"],["13:00","Eschwege","Sandrocks Tiernahrung, Oberhone"],
  ["14:00","Hessisch Lichtenau","OnOvO Tierbedarf, Am Hambacher Weg 4"],["15:30","Gudensberg","Fritzlarer Str. 43"],["16:30","Warburg","Raiffeisen-Markt, Landfurt 57-61"]]},
 {id:"T2",nr:"Tour 2",name:"Raum Hildesheim",weeks:[2,4],rhythm:"jeden 2. und 4. Samstag",stops:[
  ["06:30","Hemeringen","Falcova GmbH, Herkendorfer Str. 14"],["07:00","Hameln","Hastenbeckerweg 82"],["07:20","Coppenbrügge","Bahnhof"],
  ["07:30","Hemmendorf","Marktplatz 3"],["08:00","Burgstemmen","Neuer Weg 1-3"],["08:30","Eldagsen","Raiffeisen-Markt, Lange Str. 83a"],
  ["09:30","Alfeld (Leine)","Zooparadies Kempf"],["10:30","Hildesheim","MTG Fleige, Frankenstr. 2"],["11:15","Holle","Am Mohldberg 1"],
  ["12:00","Steinlah","Gebrüderkassel Mühle, Mühlenweg 3"],["13:15","Vechelde","Raiffeisenmarkt"],["14:00","Groß Lafferde","Zum Marktplatz (Marktstr. 50)"],["14:30","Schellerten","EDEKA Herbst, Über der Wasserfurche 1"]]},
 {id:"T3",nr:"Tour 3",name:"Onovo",weeks:[3],rhythm:"jeden 3. Samstag",stops:[
  ["09:00","Beverungen","onOvo Stadtmühle, Lange Str. 1"],["10:30","Hann. Münden","onOvo Farmer Store, Veckerhäger Str. 82"],["12:00","Rosdorf","Farmerstore onOvo"]]},
 {id:"T4",nr:"Tour 4",name:"Warburg-Kurz",weeks:[1,3],rhythm:"jeden 1. und 3. Samstag",stops:[
  ["08:00","Warburg","Raiffeisen-Markt, Landfurt 57-61"],["09:30","Gudensberg","Fritzlarer Str. 43"],["11:00","Hessisch Lichtenau","OnOvO Tierbedarf, Am Hambacher Weg 4"],
  ["12:15","Waldkappel","Rewe Einfahrt"],["13:00","Eschwege","Sandrocks Tiernahrung, Oberhone"]]},
 {id:"R",nr:"Rietberg",name:"Hof Rietberg",weeks:[1,2,3,4,5],rhythm:"Abholung am Hof nach Absprache",stops:[
  ["","Rietberg Hof","Merschhemkeweg"],["","Rietberg zuhause","Eberhard-Unkraut-Straße 76"]]}
];
/* Feste Farben je Abholort: nie ändern, neue Orte unten anhängen */
export const ORT_FARBE={"Diemelstadt": "#c62828", "Burghasungen (Zierenberg)": "#1565c0", "Dramfeld": "#2e7d32", "Teistungen": "#6a1b9a", "Worbis": "#e65100", "Nordhausen": "#00838f", "Dingelstädt": "#5d4037", "Groß Bartloff": "#ad1457", "Geismar": "#37474f", "Eschwege": "#558b2f", "Hessisch Lichtenau": "#283593", "Gudensberg": "#9e7c00", "Warburg": "#00695c", "Hemeringen": "#8d2a0e", "Hameln": "#c62828", "Coppenbrügge": "#1565c0", "Hemmendorf": "#2e7d32", "Burgstemmen": "#6a1b9a", "Eldagsen": "#e65100", "Alfeld (Leine)": "#00838f", "Hildesheim": "#5d4037", "Holle": "#ad1457", "Steinlah": "#37474f", "Vechelde": "#558b2f", "Groß Lafferde": "#283593", "Schellerten": "#9e7c00", "Beverungen": "#00695c", "Hann. Münden": "#8d2a0e", "Rosdorf": "#c62828", "Waldkappel": "#1565c0", "Rietberg Hof": "#2e7d32", "Rietberg zuhause": "#6a1b9a", "Lieferung nach Hause": "#111111"};
export const HOME="Lieferung nach Hause";
