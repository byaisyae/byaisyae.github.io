import { useEffect, useSyncExternalStore } from "react";
import { TESTIMONI_FORM, TESTIMONIALS, TESTIMONIALS_SAMPLE } from "../config";

// Testimoni yang tampil = data manual di config.js + data berstatus "Approved" dari Google Sheet
// (diambil lewat Apps Script ?action=approved). Disimpan 5 menit di sessionStorage agar cepat.
const KEY = "testimoni-approved:v1";
const TTL = 5 * 60 * 1000;
const MAX = 200;

// pratinjau contoh hanya saat dev dan belum ada data/endpoint sama sekali
const initial =
  TESTIMONIALS.length || TESTIMONI_FORM.endpoint
    ? TESTIMONIALS
    : import.meta.env.DEV
      ? TESTIMONIALS_SAMPLE
      : [];

// state dibuat objek baru setiap berubah (syarat useSyncExternalStore)
let state = { list: initial, loading: Boolean(TESTIMONI_FORM.endpoint) };
let started = false;
const subs = new Set();

const set = (patch) => {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
};

// rapikan data dari sheet: hanya teks, dan link/foto hanya https
const clean = (r) => {
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  const link = (v) => (/^https:\/\//i.test(str(v)) ? str(v) : undefined);
  const rating = Math.round(Number(r.rating)) || 0;
  return {
    name: str(r.name),
    comment: str(r.comment),
    theme: str(r.theme),
    photo: link(r.photo),
    url: link(r.url),
    rating: rating >= 1 && rating <= 5 ? rating : undefined,
  };
};

const merge = (remote) =>
  [
    ...TESTIMONIALS,
    // sheet berurutan dari lama → baru; tampilkan yang terbaru dulu
    ...remote.map(clean).filter((t) => t.name && t.comment).reverse(),
  ].slice(0, MAX);

function load() {
  if (started || !TESTIMONI_FORM.endpoint) return;
  started = true;
  try {
    const c = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (c && Date.now() - c.t < TTL) return set({ list: merge(c.items), loading: false });
  } catch {
    /* abaikan */
  }
  const sep = TESTIMONI_FORM.endpoint.includes("?") ? "&" : "?";
  fetch(`${TESTIMONI_FORM.endpoint}${sep}action=approved`)
    .then((r) => r.json())
    .then((out) => {
      if (!out.ok || !Array.isArray(out.items)) return set({ loading: false });
      set({ list: merge(out.items), loading: false });
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), items: out.items }));
      } catch {
        /* abaikan */
      }
    })
    .catch(() => set({ loading: false })); // gagal → tetap tampil data manual saja
}

const subscribe = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};

/** { list, loading } — testimoni (manual + Approved dari Google Sheet), terbaru dulu. */
export function useTestimonialsState() {
  useEffect(load, []);
  return useSyncExternalStore(subscribe, () => state);
}

/** Daftar testimoni saja. */
export const useTestimonials = () => useTestimonialsState().list;
