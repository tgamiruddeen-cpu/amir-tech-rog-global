import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * AMIR TECH ROG GLOBAL - AI Diagnosis Aircond Kereta
 * Supabase Edge Function: ai-diagnosis
 *
 * Required secret:
 *   OPENAI_API_KEY
 *
 * Optional secret:
 *   OPENAI_MODEL (default: gpt-6-luna)
 *
 * Keep verify_jwt enabled for this function when the website calls it
 * with the project's legacy anon JWT through Supabase client.
 */

const allowedOrigins = new Set([
  "https://amirtechrog.my",
  "https://www.amirtechrog.my",
]);

const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-6-luna";
const MAX_BODY_BYTES = 18_000;
const MAX_OUTPUT_TOKENS = 1_600;
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60 * 60 * 1000;

type RateRecord = { start: number; count: number };
const requestCounts = new Map<string, RateRecord>();

const corsHeaders = (origin: string): Record<string, string> => ({
  "Access-Control-Allow-Origin": allowedOrigins.has(origin)
    ? origin
    : "https://amirtechrog.my",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
});

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  origin: string,
  extraHeaders: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });

const asText = (value: unknown, max = 3000): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return "";
  return String(value).trim().slice(0, max);
};

const instructions = `
Anda ialah pembantu teknikal diagnosis aircond kenderaan untuk
AMIR TECH ROG GLOBAL di Malaysia. Jawab dalam Bahasa Melayu Malaysia,
tersusun, mudah difahami dan praktikal.

Prinsip diagnosis:
- Berikan differential diagnosis, bukan diagnosis pasti.
- Bezakan fakta yang diberi, kemungkinan dan maklumat belum diketahui.
- Pertimbangkan jenis sistem A/C, refrigerant, compressor tetap/variable,
  TXV/orifice tube, sistem single/dual evaporator atau hybrid/EV jika diberi.
- Tafsir LP/HP bersama suhu ambient, vent, RPM, keadaan ujian, airflow
  condenser, SH/SC, EV, TLOW/THIGH dan coolant ECT.
- Jangan gunakan ambang universal atau mereka carta/spesifikasi OEM.
- Jika maklumat model/varian tidak cukup untuk nilai sasaran, nyatakan
  data OEM perlu disahkan menggunakan VIN, label atau manual servis.
- Jangan mereka bacaan, kapasiti gas, kuantiti minyak atau harga.
- Jika unit, keadaan ujian atau maksud sesuatu bacaan tidak jelas,
  nyatakan perkara itu dan minta pengesahan.

Susunan jawapan:
1. Ringkasan kes.
2. Fakta yang diberi dan perkara belum diketahui.
3. 3 hingga 5 kemungkinan punca hanya jika data menyokongnya. Berikan
   tahap keyakinan rendah/sederhana/tinggi serta sebab.
4. Data bercanggah atau bacaan tambahan yang diperlukan.
5. Langkah ujian mengikut urutan selamat dan kos rendah dahulu.
6. Bacaan yang perlu direkod pada idle dan keadaan ujian yang ditetapkan.
7. Komponen yang jangan ditukar sebelum diuji.
8. Anggaran kos Malaysia hanya jika sesuai: julat kasar, asingkan
   komponen, upah, refrigerant dan minyak; bukan harga muktamad.
9. Ringkasan pendek untuk pelanggan dan nota pemeriksaan fizikal.

Keselamatan:
- Jangan sarankan melepaskan refrigerant ke atmosfera.
- Jangan sarankan memintas pressure switch atau sistem perlindungan.
- Jangan sarankan membuka sistem bertekanan tanpa alat dan latihan.
- Untuk suhu coolant tinggi atau HP yang berpotensi tidak selamat,
  utamakan hentikan ujian dan ikut prosedur OEM.
- Nyatakan jika kenderaan perlu dihentikan daripada diuji sehingga
  pemeriksaan keselamatan dibuat.
`.trim();

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders(origin) });
  }

  if (!allowedOrigins.has(origin)) {
    return jsonResponse({ error: "Origin tidak dibenarkan." }, 403, origin);
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Gunakan kaedah POST." }, 405, origin, {
      "Allow": "POST, OPTIONS",
    });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse({ error: "Content-Type mesti application/json." }, 415, origin);
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return jsonResponse({
      error: "AI belum diaktifkan. Tetapkan rahsia OPENAI_API_KEY dalam Supabase Edge Function Secrets.",
    }, 503, origin);
  }

  // Best-effort per-isolate limiter. For reliable production limits across
  // multiple Edge Function instances, use a shared database/Redis limiter
  // or an API gateway/WAF rule. Client-supplied IP headers can be spoofed
  // in some deployment paths, so do not treat this as a security boundary.
  const ip = (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unknown"
  ).split(",")[0].trim().slice(0, 80);

  const now = Date.now();
  const prior = requestCounts.get(ip);

  if (
    prior &&
    now - prior.start < RATE_WINDOW_MS &&
    prior.count >= RATE_LIMIT
  ) {
    return jsonResponse({
      error: "Had analisis sementara dicapai. Cuba lagi kemudian atau hubungi bengkel.",
    }, 429, origin, { "Retry-After": String(Math.ceil((RATE_WINDOW_MS - (now - prior.start)) / 1000)) });
  }

  requestCounts.set(
    ip,
    !prior || now - prior.start >= RATE_WINDOW_MS
      ? { start: now, count: 1 }
      : { start: prior.start, count: prior.count + 1 },
  );

  // Avoid unbounded growth of the in-memory map in a long-lived isolate.
  if (requestCounts.size > 2_000) {
    for (const [key, value] of requestCounts) {
      if (now - value.start >= RATE_WINDOW_MS) requestCounts.delete(key);
      if (requestCounts.size <= 1_500) break;
    }
  }

  let body: { caseData?: Record<string, unknown>; localFindings?: unknown };
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({
        error: "Data terlalu panjang. Ringkaskan nota tambahan dan cuba semula.",
      }, 413, origin);
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return jsonResponse({ error: "Format data tidak sah." }, 400, origin);
    }
    body = parsed as { caseData?: Record<string, unknown>; localFindings?: unknown };
  } catch {
    return jsonResponse({ error: "Format JSON tidak sah." }, 400, origin);
  }

  const d = body.caseData;
  if (!d || typeof d !== "object" || Array.isArray(d)) {
    return jsonResponse({ error: "Maklumat kes kenderaan tidak lengkap." }, 400, origin);
  }

  const brand = asText(d.brand, 80);
  const model = asText(d.model, 120);
  const year = asText(d.year, 8);
  const issue = asText(d.issue, 160);

  if (!brand || !model || !year || !issue) {
    return jsonResponse({
      error: "Pilih jenama, model, tahun dan simptom dahulu.",
    }, 400, origin);
  }

  // Do not send customer's name, phone number, email or address to the model.
  // Only technical vehicle and diagnostic information is forwarded.
  const technicalCase = {
    brand,
    model,
    year,
    engine: asText(d.engine, 80),
    systemType: asText(d.systemType, 100),
    meteringDevice: asText(d.meteringDevice, 100),
    evaporatorLayout: asText(d.evaporatorLayout, 100),
    symptom: issue,
    symptomText: asText(d.symptomText, 1500),
    when: asText(d.when, 100),
    testMode: asText(d.testMode, 100),
    rpm: asText(d.rpm, 20),
    blower: asText(d.blower, 100),
    ventC: asText(d.vent, 20),
    ambientC: asText(d.ambient, 20),
    engineCoolantC: asText(d.engineTemp, 20),
    engineTempSource: asText(d.engineTempSource, 100),
    lpPsi: asText(d.lp, 20),
    hpPsi: asText(d.hp, 20),
    shC: asText(d.sh, 20),
    scC: asText(d.sc, 20),
    evC: asText(d.ev, 20),
    tlowC: asText(d.tlow, 20),
    thighC: asText(d.thigh, 20),
    refrigerant: asText(d.gas, 50),
    chargeGrams: asText(d.gasGrams, 20),
    compressor: asText(d.compressor, 120),
    condenserFan: asText(d.fan, 120),
    lastGasAdded: asText(d.lastGas, 100),
    gasRefillsLast12Months: asText(d.gasRefills, 80),
    leakEvidence: asText(d.leakEvidence, 150),
    serviceHistory: asText(d.history, 600),
    notes: asText(d.notes, 1800),
    localScreening: asText(body.localFindings, 5000),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    let aiResponse: Response;
    try {
      aiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          instructions,
          input: JSON.stringify(technicalCase),
          max_output_tokens: MAX_OUTPUT_TOKENS,
          store: false,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await aiResponse.json().catch(() => ({}));

    if (!aiResponse.ok) {
      const errorType = (data as { error?: { type?: string } })?.error?.type || "unknown";
      console.error("OpenAI API error:", aiResponse.status, errorType);

      if (aiResponse.status === 401) {
        return jsonResponse({
          error: "Kunci OPENAI_API_KEY tidak diterima. Semak rahsia API di Supabase.",
        }, 502, origin);
      }
      if (aiResponse.status === 429) {
        return jsonResponse({
          error: "Had penggunaan API AI dicapai. Cuba lagi kemudian atau semak had/billing API.",
        }, 503, origin);
      }
      return jsonResponse({
        error: "Perkhidmatan AI tidak dapat menjana analisis sekarang. Semak tetapan dan penggunaan API.",
      }, 502, origin);
    }

    let analysis = typeof (data as { output_text?: unknown }).output_text === "string"
      ? (data as { output_text: string }).output_text
      : "";

    if (!analysis && Array.isArray((data as { output?: unknown[] }).output)) {
      analysis = ((data as { output: Array<Record<string, unknown>> }).output)
        .flatMap((item) =>
          item?.type === "message" && Array.isArray(item.content)
            ? (item.content as Array<Record<string, unknown>>)
              .filter((c) => c?.type === "output_text")
              .map((c) => typeof c.text === "string" ? c.text : "")
            : []
        )
        .join("\n");
    }

    if (!analysis.trim()) {
      console.error("OpenAI returned no output text.");
      return jsonResponse({
        error: "AI memberi respons kosong. Cuba lagi.",
      }, 502, origin);
    }

    return jsonResponse({
      analysis: analysis.slice(0, 14_000),
      model: MODEL,
    }, 200, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI request failed:", message.slice(0, 200));

    if (message.toLowerCase().includes("abort")) {
      return jsonResponse({
        error: "Analisis mengambil masa terlalu lama. Cuba semula.",
      }, 504, origin);
    }

    return jsonResponse({
      error: "Sambungan AI gagal sementara. Cuba semula selepas beberapa saat.",
    }, 502, origin);
  }
});
