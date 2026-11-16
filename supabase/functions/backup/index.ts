// Wöchentliche Datensicherung der Holle-App: alle Daten als Datei per Telegram
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

async function alle(tabelle: string, spalten = "*") {
  const rows: unknown[] = [];
  for (let von = 0; ; von += 1000) {
    const { data, error } = await sb.from(tabelle).select(spalten).range(von, von + 999);
    if (error) throw new Error(`${tabelle}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

Deno.serve(async (req) => {
  try {
    const { data: s } = await sb.from("app_settings").select("key,value");
    const set = Object.fromEntries((s ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
    if (!set.backup_secret || req.headers.get("x-backup-secret") !== set.backup_secret) {
      return new Response("nicht erlaubt", { status: 401 });
    }
    if (!set.telegram_token || !set.telegram_chat_id) return new Response("Telegram fehlt", { status: 400 });

    const bb = (await alle("bb_docs", "coll,id,data,updated_at")) as { coll: string }[];
    const sicherung = {
      app: "holle-app",
      version: 1,
      erstellt: new Date().toISOString(),
      tabellen: {
        bb_docs: bb,
        products: await alle("products"),
        fahrten: await alle("fahrten"),
        warteliste: await alle("warteliste"),
      },
    };
    const zaehl = (c: string) => bb.filter((r) => r.coll === c).length;
    const datum = new Date().toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });
    const dateiname = `Holle-Sicherung_${new Date().toISOString().slice(0, 10)}.json`;
    const text = `💾 Holle-App Datensicherung ${datum}\n` +
      `${zaehl("orders")} Bestellungen · ${zaehl("kunden")} Kunden/Kontakte · ${sicherung.tabellen.products.length} Tierarten · ` +
      `${sicherung.tabellen.fahrten.length} Termine · ${zaehl("kasse")} Kassenabschlüsse\n` +
      `Datei gut aufheben. Einspielen: Holle-App → Kunden-App → Datensicherung.`;

    const form = new FormData();
    form.append("chat_id", set.telegram_chat_id);
    form.append("caption", text);
    form.append("document", new Blob([JSON.stringify(sicherung)], { type: "application/json" }), dateiname);
    const r = await fetch(`https://api.telegram.org/bot${set.telegram_token}/sendDocument`, { method: "POST", body: form });
    const j = await r.json();
    await sb.from("app_settings").upsert({ key: "backup_letztes", value: JSON.stringify({ zeit: new Date().toISOString(), ok: !!j.ok, info: j.ok ? "" : String(j.description ?? "") }) });
    return new Response(JSON.stringify({ ok: !!j.ok }), { status: j.ok ? 200 : 502, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    await sb.from("app_settings").upsert({ key: "backup_letztes", value: JSON.stringify({ zeit: new Date().toISOString(), ok: false, info: String(e) }) });
    return new Response(String(e), { status: 500 });
  }
});
