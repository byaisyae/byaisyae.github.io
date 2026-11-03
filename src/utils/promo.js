import { PROMO as FALLBACK } from "../config";

// Promo diatur dari dashboard admin (menu "Promo") dan dibaca situs lewat Apps Script (?action=list).
// Selama promo belum pernah disimpan dari dashboard, dipakai data cadangan PROMO di config.js.
// Semua waktu dianggap WIB (UTC+07:00).

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "2026-12-31T23:59" / "2026-12-31T23:59:59+07:00" → milidetik (WIB). `end` = sampai akhir menit itu. */
const toMs = (v, isEnd) => {
  const s = String(v || "").trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return Date.parse(`${s}:${isEnd ? "59" : "00"}+07:00`);
  return Date.parse(s);
};

/** "2026-12-31..." → { long: "31 Desember 2026", short: "31 Des" } */
const dateLabels = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || ""));
  if (!m) return { long: "", short: "" };
  const bln = BULAN[+m[2] - 1] || "";
  return { long: `${+m[3]} ${bln} ${m[1]}`, short: `${+m[3]} ${bln.slice(0, 3)}` };
};

const t = (v) => (typeof v === "string" ? v.trim() : "");

/** Bentuk seragam promo (dari server atau dari config.js). */
export function normalizePromo(r, fallbackEnabled = true) {
  const until = dateLabels(r.end);
  return {
    enabled: r.enabled === undefined ? fallbackEnabled : r.enabled === true,
    id: t(r.id) || "promo",
    label: t(r.label) || "Promo",
    headline: t(r.headline) || "Semua Desain Undangan",
    price: t(r.price),
    normal: t(r.normal),
    startMs: toMs(r.start, false),
    endMs: toMs(r.end, true),
    untilLabel: until.long,
    untilShort: until.short,
  };
}

/** Promo yang berlaku: dari server bila sudah diatur di dashboard, jika belum → cadangan di config.js. */
export const resolvePromo = (remote) =>
  remote && typeof remote === "object" ? normalizePromo(remote, false) : normalizePromo(FALLBACK, true);

/** Promo sedang berjalan? (aktif + di dalam periode + harga terisi) */
export const isPromoActive = (p, now = Date.now()) =>
  Boolean(p && p.enabled && p.price && now >= p.startMs && now <= p.endMs);

/** Pasang harga promo ke kategori selama promo berlaku. */
export const applyPromo = (cat, p) =>
  isPromoActive(p) && p.normal ? { ...cat, price: { was: p.normal, now: p.price } } : cat;

/** "yyyy-MM-ddTHH:mm" untuk input datetime-local ← nilai dari server */
export const toInputDT = (v) => {
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(String(v || ""));
  return m ? `${m[1]}T${m[2]}` : "";
};
