import { useEffect, useMemo, useSyncExternalStore } from "react";
import { D as STATIC, CATS, KOLEKSI_API, withCatDefaults } from "../config";
import { applyPromo, isPromoActive, resolvePromo } from "./promo";

// Daftar desain yang tampil = data di config.js (D) + koleksi dari Google Sheet (dashboard admin,
// diambil lewat Apps Script ?action=list). Hasil disimpan 2 menit di sessionStorage agar cepat.
const KEY = "koleksi-remote:v3";
const TTL = 2 * 60 * 1000;

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** "2026-12-30" → "30 Desember 2026" (teks lain dikembalikan apa adanya). */
export const fmtDate = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || ""));
  return m
    ? `${+m[3]} ${BULAN[+m[2] - 1] || ""} ${m[1]}`.replace("  ", " ")
    : String(v || "").trim();
};

const str = (v) => (typeof v === "string" ? v.trim() : "");
const link = (v) => (/^https:\/\//i.test(str(v)) ? str(v) : undefined);

/** Baris dari sheet → objek desain (bentuk sama dengan item di config.js). */
export function toDesign(r) {
  const client = r.type === "client";
  const shots = [link(r.shot1), link(r.shot2)];
  return {
    id: str(r.id),
    n: str(r.name),
    d: fmtDate(r.date),
    tag: str(r.tag),
    url: link(r.url),
    img: link(r.img),
    ...(r.noText === true ? { noText: true } : {}), // cover berupa screenshot → sembunyikan teks di kartu
    ...(client
      ? { client: true, featured: r.featured === true }
      : { cat: str(r.cat) }),
    ...(!client && shots[0] && shots[1] ? { shots } : {}),
    // harga khusus tema ini (menimpa harga kategori; kosong = ikut kategori)
    ...(!client && str(r.was) && str(r.now)
      ? { price: { was: str(r.was), now: str(r.now) } }
      : {}),
  };
}

/** Kategori dari Sheet → objek kategori (bentuk sama dengan item di config.js). */
export function toCat(r) {
  const was = str(r.was);
  const now = str(r.now);
  return withCatDefaults({
    id: str(r.id),
    label: str(r.label),
    desc: str(r.desc),
    ...(was && now ? { price: { was, now } } : {}),
  });
}

// kategori bawaan di kode + kategori dari dashboard (id yang sama dengan bawaan diabaikan)
const mergeCats = (remote) => [
  ...CATS,
  ...(Array.isArray(remote) ? remote : [])
    .map(toCat)
    .filter((c) => c.id && c.label && !CATS.some((s) => s.id === c.id)),
];

/** Kunci unik tiap desain (dipakai sebagai React key). Link yang sama boleh dipakai beberapa entri. */
export const designKey = (d) => d.id || `${d.url}|${d.n}`;

// Entri dari dashboard dianggap duplikat data di config.js hanya jika JENIS (client / tema), LINK, dan NAMA-nya sama.
// (Link saja tidak cukup: client berbeda boleh memakai link undangan yang sama, mis. saat uji coba.
// Jenis juga dibandingkan agar tema di dashboard tidak hilang karena sama dengan koleksi client di config.js.)
const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();
const isDup = (d) =>
  STATIC.some(
    (s) =>
      Boolean(s.client) === Boolean(d.client) &&
      s.url === d.url &&
      norm(s.n) === norm(d.n),
  );

// tema hanya tampil jika kategorinya dikenal (bawaan atau dari dashboard & tidak disembunyikan)
const merge = (remote, remoteCats, remotePromo) => {
  const cats = mergeCats(remoteCats);
  const ok = (d) =>
    d.n && d.url && (d.client || cats.some((c) => c.id === d.cat));
  return {
    cats,
    promo: resolvePromo(remotePromo),
    list: [
      ...STATIC,
      ...remote
        .map(toDesign)
        .filter(ok)
        .filter((d) => !isDup(d)),
    ],
  };
};

// state dibuat objek baru setiap berubah (syarat useSyncExternalStore)
let state = {
  list: STATIC,
  cats: CATS,
  promo: resolvePromo(null),
  loading: Boolean(KOLEKSI_API.endpoint),
};
let started = false;
const subs = new Set();
const set = (patch) => {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
};

function fetchNow() {
  const sep = KOLEKSI_API.endpoint.includes("?") ? "&" : "?";
  return fetch(`${KOLEKSI_API.endpoint}${sep}action=list`)
    .then((r) => r.json())
    .then((out) => {
      if (!out.ok || !Array.isArray(out.items)) return set({ loading: false });
      set({ ...merge(out.items, out.categories, out.promo), loading: false });
      try {
        sessionStorage.setItem(
          KEY,
          JSON.stringify({
            t: Date.now(),
            items: out.items,
            categories: out.categories || [],
            promo: out.promo || null,
          }),
        );
      } catch {
        /* abaikan */
      }
    })
    .catch(() => set({ loading: false })); // gagal → tetap tampil data di config.js
}

function load() {
  if (started || !KOLEKSI_API.endpoint) return;
  started = true;
  try {
    const c = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (c && Array.isArray(c.items)) {
      set({ ...merge(c.items, c.categories, c.promo), loading: false }); // tampil dulu dari cache
      if (Date.now() - c.t < TTL) return;
    }
  } catch {
    /* abaikan */
  }
  fetchNow();
}

/** Ambil ulang dari server sekarang (dipakai dashboard admin setelah menyimpan). */
export function refreshDesigns() {
  if (!KOLEKSI_API.endpoint) return Promise.resolve();
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* abaikan */
  }
  started = true;
  return fetchNow();
}

const subscribe = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};

/** { list, loading } — desain gabungan config.js + dashboard admin. */
export function useDesignsState() {
  useEffect(load, []);
  return useSyncExternalStore(subscribe, () => state);
}

/** Daftar kategori tema: bawaan di kode + dari dashboard admin (harga promo dipasang bila promo berlaku). */
export function useCats() {
  const { cats, promo } = useDesignsState();
  return useMemo(() => cats.map((c) => applyPromo(c, promo)), [cats, promo]);
}

/** Promo yang berlaku sekarang: { ...promo, active }. Juga mengatur ruang untuk bar promo di atas header. */
export function usePromo() {
  const { promo } = useDesignsState();
  const active = isPromoActive(promo);
  useEffect(() => {
    document.documentElement.classList.toggle("has-bar", active);
  }, [active]);
  return { ...promo, active };
}

/** Daftar desain saja. */
export const useDesigns = () => useDesignsState().list;

/** Hitungan tema & client untuk kartu statistik. */
export const statsOf = (list) => ({
  themes: list.filter((x) => !x.client && x.cat).length,
  clients: list.filter((x) => x.client).length,
});
