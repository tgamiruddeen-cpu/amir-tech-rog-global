import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set([
  "https://amirtechrog.my",
  "https://www.amirtechrog.my",
]);

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://amirtechrog.my",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const asText = (value: unknown, max = 3000) => String(value ?? "").slice(0, max);
const requestCounts = new Map<string, { start: number; count: number }>();

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (!allowedOrigins.has(origin)) return new Response(JSON.stringify({ error: "Origin tidak dibenarkan." }), { status: 403, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Gunakan POST." }), { status: 405, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "AI generatif belum diaktifkan: rahsia OPENAI_API_KEY belum diset dalam Supabase." }), { status: 503, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });

  // Basic per-instance rate limit: max 8 requests/hour per forwarded IP. Configure stronger production controls if traffic grows.
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown").split(",")[0].trim().slice(0, 80);
  const now = Date.now(); const prior = requestCounts.get(ip);
  if (prior && now - prior.start < 60 * 60 * 1000 && prior.count >= 8) {
    return new Response(JSON.stringify({ error: "Had analisis sementara dicapai. Cuba lagi kemudian atau hantar pertanyaan ke bengkel." }), { status: 429, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });
  }
  requestCounts.set(ip, !prior || now - prior.start >= 60 * 60 * 1000 ? { start: now, count: 1 } : { start: prior.start, count: prior.count + 1 });

  let body: { caseData?: Record<string, unknown>; localFindings?: unknown };
  try {
    const raw = await req.text();
    if (raw.length > 18000) return new Response(JSON.stringify({ error: "Data terlalu panjang. Ringkaskan nota tambahan dan cuba semula." }), { status: 413, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });
    body = JSON.parse(raw);
  } catch {
    return new Response(JSON.stringify({ error: "Format data tidak sah." }), { status: 400, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });
  }

  const d = body.caseData || {};
  if (!d.brand || !d.model || !d.year || !d.issue) return new Response(JSON.stringify({ error: "Pilih jenama, model, tahun dan simptom dahulu." }), { status: 400, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });

  // Do not send the customer's name to the model. Technical vehicle data only.
  const technicalCase = {
    brand: asText(d.brand, 80), model: asText(d.model, 120), year: asText(d.year, 8), engine: asText(d.engine, 80),
    systemType: asText(d.systemType, 100), meteringDevice: asText(d.meteringDevice, 100), evaporatorLayout: asText(d.evaporatorLayout, 100),
    symptom: asText(d.issue, 160), symptomText: asText(d.symptomText, 1500), when: asText(d.when, 100), testMode: asText(d.testMode, 100), rpm: asText(d.rpm, 20), blower: asText(d.blower, 100),
    ventC: asText(d.vent, 20), ambientC: asText(d.ambient, 20), engineCoolantC: asText(d.engineTemp, 20), engineTempSource: asText(d.engineTempSource, 100),
    lpPsi: asText(d.lp, 20), hpPsi: asText(d.hp, 20), shC: asText(d.sh, 20), scC: asText(d.sc, 20), evC: asText(d.ev, 20), tlowC: asText(d.tlow, 20), thighC: asText(d.thigh, 20),
    refrigerant: asText(d.gas, 50), chargeGrams: asText(d.gasGrams, 20), compressor: asText(d.compressor, 120), condenserFan: asText(d.fan, 120), lastGasAdded: asText(d.lastGas, 100), gasRefillsLast12Months: asText(d.gasRefills, 80), leakEvidence: asText(d.leakEvidence, 150), serviceHistory: asText(d.history, 600), notes: asText(d.notes, 1800),
    localScreening: asText(body.localFindings, 5000),
  };

  const instructions = `Anda ialah pembantu teknikal diagnosis aircond kenderaan untuk AMIR TECH ROG GLOBAL di Malaysia. Jawab dalam Bahasa Melayu Malaysia, tersusun dan praktikal. Analisis sebagai differential diagnosis, bukan kepastian. Bezakan fakta yang diberi, kemungkinan dan maklumat belum diketahui. Pertimbangkan jenis sistem A/C, refrigerant, compressor tetap/variable, TXV/orifice tube, sistem single/dual evaporator atau hybrid/EV jika diberi. Tafsir LP/HP bersama suhu ambient, vent, RPM, keadaan ujian, airflow condenser, SH/SC, EV, TLOW/THIGH dan coolant ECT; jangan gunakan ambang universal atau mereka carta OEM. Jika maklumat model/varian tidak cukup untuk nilai sasaran, nyatakan data OEM perlu disahkan menggunakan VIN/label/manual servis. Berikan: (1) ringkasan kes; (2) 3-5 kemungkinan punca hanya jika data menyokong, dengan tahap keyakinan rendah/sederhana/tinggi dan sebab; (3) data bercanggah/kurang; (4) langkah ujian mengikut urutan selamat dan kos rendah dahulu; (5) bacaan yang perlu direkod pada idle dan keadaan ujian yang ditetapkan; (6) apa yang jangan ditukar sebelum diuji; (7) anggaran kos Malaysia hanya jika sesuai, nyatakan julat kasar dan asingkan komponen/upah/refrigerant/minyak, jangan janji harga muktamad. Jangan sarankan melepaskan refrigerant ke atmosfera, memintas pressure switch, atau membuka sistem bertekanan tanpa alat dan latihan. Untuk suhu coolant tinggi atau HP yang berpotensi tidak selamat, utamakan hentikan ujian dan ikuti OEM. Akhiri dengan ringkasan pendek untuk pelanggan serta nota bahawa pemeriksaan fizikal diperlukan.`;

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-6-luna", instructions, input: JSON.stringify(technicalCase), max_output_tokens: 1200, store: false }),
    });
    const data = await aiResponse.json().catch(() => ({}));
    if (!aiResponse.ok) {
      console.error("OpenAI API error", aiResponse.status, data?.error?.type || "unknown");
      return new Response(JSON.stringify({ error: "Perkhidmatan AI tidak dapat menjana analisis sekarang. Semak kredit/pelan API dan tetapan backend." }), { status: 502, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });
    }
    let analysis = typeof data.output_text === "string" ? data.output_text : "";
    if (!analysis && Array.isArray(data.output)) {
      analysis = data.output.flatMap((item: any) => item?.type === "message" && Array.isArray(item.content) ? item.content.filter((c: any) => c?.type === "output_text").map((c: any) => c.text || "") : []).join("\n");
    }
    if (!analysis.trim()) return new Response(JSON.stringify({ error: "AI memberi respons kosong. Cuba lagi." }), { status: 502, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ analysis: analysis.slice(0, 14000), model: "gpt-6-luna" }), { status: 200, headers: { ...corsHeaders(origin), "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("AI network error", String(error).slice(0, 200));
    return new Response(JSON.stringify({ error: "Sambungan AI gagal sementara. Cuba semula selepas beberapa saat." }), { status: 502, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });
  }
});
