// Mitteilungen an alle Kunden, die „Mein Holle“-Benachrichtigungen erlaubt haben
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  const { data: s } = await sb.from("app_settings").select("key,value");
  const set = Object.fromEntries((s ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  if (!set.push_secret || req.headers.get("x-push-secret") !== set.push_secret) return new Response("nicht erlaubt", { status: 401 });
  const body = await req.json().catch(() => ({}));
  const nachricht = JSON.stringify({
    title: String(body.titel || "Geflügelverkauf Holle").slice(0, 80),
    body: String(body.text || "").slice(0, 240),
    url: String(body.url || "/#/mein"),
  });
  webpush.setVapidDetails("mailto:info@gefluegelholle.de", set.vapid_public, set.vapid_private);
  const abos: { endpoint: string; p256dh: string; auth: string; fehler: number }[] = [];
  for (let von = 0; ; von += 1000) {
    const { data } = await sb.from("push_abos").select("endpoint,p256dh,auth,fehler").range(von, von + 999);
    abos.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  let ok = 0, weg = 0, fehler = 0;
  for (let i = 0; i < abos.length; i += 20) {
    await Promise.all(abos.slice(i, i + 20).map(async (a) => {
      try {
        await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, nachricht, { TTL: 60 * 60 * 24 * 3 });
        ok++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410 || a.fehler >= 4) { await sb.from("push_abos").delete().eq("endpoint", a.endpoint); weg++; }
        else { await sb.from("push_abos").update({ fehler: a.fehler + 1 }).eq("endpoint", a.endpoint); fehler++; }
      }
    }));
  }
  const info = { zeit: new Date().toISOString(), ok, weg, fehler, gesamt: abos.length };
  await sb.from("app_settings").upsert({ key: "push_letztes", value: JSON.stringify(info) });
  return new Response(JSON.stringify(info), { headers: { "Content-Type": "application/json" } });
});
