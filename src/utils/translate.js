/**
 * Terjemahan pesan Indonesia → Inggris / Arab lewat MyMemory (gratis, tanpa API key).
 * Placeholder {nama} dan {link} dilindungi: tidak dikirim ke layanan & tidak diubah.
 * Catatan: kuota gratis anonim terbatas per hari (±5.000 karakter per alamat IP).
 */
const API = "https://api.mymemory.translated.net/get";
const MAX = 400; // batas aman per permintaan (MyMemory maks ±500 byte)
const KEEP = /(\{nama\}|\{link\})/;
const EDGE =
  /^([\s\p{Extended_Pictographic}\uFE0F\u200D]*)([\s\S]*?)([\s\p{Extended_Pictographic}\uFE0F\u200D]*)$/u;

const decode = (s) => {
  const t = document.createElement("textarea");
  t.innerHTML = s;
  return t.value;
};

// pecah teks panjang per kalimat agar tiap permintaan ≤ MAX karakter
function chunks(text) {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
  const out = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && (cur + s).length > MAX) {
      out.push(cur);
      cur = s;
    } else cur += s;
  }
  if (cur) out.push(cur);
  return out.flatMap((c) =>
    c.length > MAX ? c.match(new RegExp(`[\\s\\S]{1,${MAX}}`, "g")) : [c],
  );
}

async function mm(text, target, signal) {
  const r = await fetch(
    `${API}?q=${encodeURIComponent(text)}&langpair=id|${target}`,
    { signal },
  );
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  if (String(j.responseStatus) !== "200")
    throw new Error(j.responseDetails || "layanan terjemahan menolak permintaan");
  const t = decode(j.responseData?.translatedText || "").trim();
  if (!t) throw new Error("hasil terjemahan kosong");
  return t;
}

/** target: "en" | "ar". Melempar Error jika gagal. */
export async function translateMessage(text, target) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    // 1) pecah per baris → per bagian (placeholder dipertahankan)
    const cores = new Set();
    const lines = text.split("\n").map((line) =>
      line.split(KEEP).map((part, i) => {
        if (i % 2 === 1) return { keep: part }; // {nama} / {link}
        const [, lead, core, trail] = part.match(EDGE);
        if (!/\p{L}/u.test(core)) return { keep: part }; // spasi/emoji/tanda baca saja
        cores.add(core);
        return { lead, core, trail };
      }),
    );

    // 2) terjemahkan tiap potongan unik
    const map = new Map();
    await Promise.all(
      [...cores].map(async (core) => {
        const parts = await Promise.all(
          chunks(core).map((c) => mm(c, target, ctrl.signal)),
        );
        map.set(core, parts.join(" "));
      }),
    );

    // 3) susun ulang
    return lines
      .map((parts) =>
        parts
          .map((p) => (p.keep !== undefined ? p.keep : p.lead + map.get(p.core) + p.trail))
          .join(""),
      )
      .join("\n");
  } catch (e) {
    throw new Error(e.name === "AbortError" ? "waktu habis" : e.message);
  } finally {
    clearTimeout(timer);
  }
}
