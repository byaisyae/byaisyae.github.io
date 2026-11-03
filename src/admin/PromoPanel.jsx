import { useEffect, useState } from "react";
import { PROMO as FALLBACK } from "../config";
import { isPromoActive, normalizePromo, toInputDT } from "../utils/promo";
import { api } from "./api";
import { Field, Icon, Spinner, inputCls } from "./ui";

const isPrice = (v) => /^[0-9.,]{1,12}$/.test(v.trim());

// nilai awal form: dari server, atau (jika belum pernah disimpan) dari cadangan di config.js
const initial = (p) => {
  const src = p || { ...FALLBACK, enabled: true };
  return {
    enabled: src.enabled !== false,
    label: src.label || "",
    headline: src.headline || "",
    price: src.price || "",
    normal: src.normal || "",
    start: toInputDT(src.start),
    end: toInputDT(src.end),
  };
};

/** Status promo untuk ditampilkan: [teks, kelas warna] */
function statusOf(f, saved) {
  if (!saved) return ["Belum disimpan — situs memakai data cadangan", "bg-adm-fg/10 text-adm-fg"];
  if (!saved.enabled) return ["Dinonaktifkan", "bg-adm-fg text-white"];
  const n = normalizePromo(saved);
  if (isPromoActive(n)) return ["Sedang berjalan", "bg-emerald-100 text-emerald-700"];
  return Date.now() < n.startMs
    ? ["Terjadwal (belum mulai)", "bg-amber-100 text-amber-700"]
    : ["Sudah berakhir", "bg-adm-fg/10 text-adm-fg"];
}

/** Pengaturan promo musiman: bar di atas situs, popup, dan harga di katalog. Tersimpan di tab "Promo" Google Sheet. */
export default function PromoPanel({ promo, loading, token, onSaved, onExpired }) {
  const [f, setF] = useState(() => initial(promo));
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverErr, setServerErr] = useState("");

  // data dari server baru tiba / dimuat ulang → isi ulang form
  useEffect(() => {
    setF(initial(promo));
    setErrs({});
  }, [promo]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    const v = {};
    if (!f.label.trim()) v.label = "Wajib diisi";
    if (!f.headline.trim()) v.headline = "Wajib diisi";
    if (!f.price.trim()) v.price = "Wajib diisi";
    else if (!isPrice(f.price)) v.price = "Hanya angka, mis. 80.000";
    if (f.normal.trim() && !isPrice(f.normal)) v.normal = "Hanya angka, mis. 299.000";
    if (!f.start) v.start = "Wajib diisi";
    if (!f.end) v.end = "Wajib diisi";
    if (f.start && f.end && f.end <= f.start) v.end = "Harus setelah waktu mulai";
    return v;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrs(v);
    setServerErr("");
    if (Object.keys(v).length) return;
    setBusy(true);
    const out = await api.promoSave(token, {
      enabled: f.enabled,
      label: f.label.trim(),
      headline: f.headline.trim(),
      price: f.price.trim(),
      normal: f.normal.trim(),
      start: f.start,
      end: f.end,
    });
    setBusy(false);
    if (out.code === 401) return onExpired();
    if (!out.ok) {
      return setServerErr(
        out.error === "Aksi tidak dikenal."
          ? "Fitur promo belum aktif: tempel Code.gs terbaru lalu deploy versi baru di Apps Script."
          : out.error || "Gagal menyimpan.",
      );
    }
    onSaved(out.item);
  };

  if (loading) {
    return (
      <p className="text-adm-sec flex items-center gap-2">
        <Spinner /> Memuat…
      </p>
    );
  }

  const [statusText, statusCls] = statusOf(f, promo);
  const preview = normalizePromo({ ...f, id: "x", start: f.start || "2000-01-01T00:00", end: f.end || "2000-01-01T00:00" });

  return (
    <div className="grid lg:grid-cols-5 gap-6 items-start">
      <form onSubmit={submit} noValidate className="lg:col-span-3 bg-white rounded-3xl border border-adm-line p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h3 className="text-xl font-bold">Pengaturan Promo</h3>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${statusCls}`}>{statusText}</span>
        </div>
        <p className="text-sm text-adm-sec mb-7 max-w-xl leading-relaxed">
          Saat promo berjalan, situs menampilkan bar di atas halaman, popup sekali per kunjungan, dan harga promo di
          semua kategori katalog. Setelah waktu selesai lewat, semuanya kembali normal otomatis. Perubahan tampil di
          situs dalam ±2 menit.
        </p>

        <div className="space-y-5">
          <label className="inline-flex items-center gap-3 cursor-pointer text-sm font-medium">
            <input
              type="checkbox"
              checked={f.enabled}
              onChange={(e) => setF((s) => ({ ...s, enabled: e.target.checked }))}
              className="size-5 accent-adm-primary"
            />
            Promo aktif (hilangkan centang untuk mematikan promo kapan saja)
          </label>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Nama promo" hint='Mis. "Promo Akhir Tahun"' error={errs.label}>
              <input value={f.label} onChange={set("label")} maxLength={50} className={inputCls} placeholder="Promo Akhir Tahun" />
            </Field>
            <Field label="Judul promo" hint="Tampil besar di popup" error={errs.headline}>
              <input value={f.headline} onChange={set("headline")} maxLength={60} className={inputCls} placeholder="Semua Desain Undangan" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Harga promo (Rp)" hint="Contoh: 80.000" error={errs.price}>
              <input value={f.price} onChange={set("price")} inputMode="decimal" maxLength={12} className={inputCls} placeholder="80.000" />
            </Field>
            <Field label="Harga normal / coret (Rp, opsional)" hint="Contoh: 299.000" error={errs.normal}>
              <input value={f.normal} onChange={set("normal")} inputMode="decimal" maxLength={12} className={inputCls} placeholder="299.000" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Mulai (WIB)" error={errs.start}>
              <input type="datetime-local" value={f.start} onChange={set("start")} className={inputCls} />
            </Field>
            <Field label="Selesai (WIB)" error={errs.end}>
              <input type="datetime-local" value={f.end} onChange={set("end")} className={inputCls} />
            </Field>
          </div>
        </div>

        {serverErr && (
          <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl bg-adm-err/10 text-adm-err text-sm px-4 py-3">
            <Icon name="alert" className="size-4 mt-0.5 shrink-0" />
            {serverErr}
          </p>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-adm-primary text-white font-bold hover:bg-adm-hover transition-colors shadow-lg shadow-adm-primary/30 disabled:opacity-60 cursor-pointer"
          >
            {busy ? <Spinner /> : <Icon name="check" className="size-5" />}
            {busy ? "Menyimpan…" : "Simpan Promo"}
          </button>
        </div>
      </form>

      <aside className="lg:col-span-2 bg-white rounded-3xl border border-adm-line p-6 md:p-8">
        <h3 className="font-bold mb-1">Pratinjau</h3>
        <p className="text-xs text-adm-sec mb-5">Begini tampilan teks di situs (warna mengikuti situs).</p>

        <p className="text-[11px] font-semibold text-adm-sec mb-2">Bar di atas halaman</p>
        <div className="rounded-xl bg-sky-300 text-slate-900 text-xs font-semibold px-3 py-2.5 text-center leading-snug">
          🎉 {preview.label}: {preview.headline} <b>Rp {preview.price || "…"}</b>{" "}
          {preview.normal && <s className="font-normal opacity-60">Rp {preview.normal}</s>}
        </div>

        <p className="text-[11px] font-semibold text-adm-sec mt-6 mb-2">Popup</p>
        <div className="rounded-2xl bg-slate-900 text-center px-5 py-6">
          <p className="tracking-[.25em] text-[10px] text-sky-300 uppercase">{preview.label}</p>
          <p className="text-white text-xl font-bold mt-2 leading-tight">{preview.headline}</p>
          {preview.normal && <p className="mt-3 text-xs text-sky-200/70 line-through">Rp {preview.normal}</p>}
          <p className="text-3xl font-bold text-sky-300 leading-none mt-1">Rp {preview.price || "…"}</p>
          <p className="mt-3 text-xs text-sky-100/90">
            Berlaku sampai {preview.untilLabel || "…"}.
          </p>
        </div>
      </aside>
    </div>
  );
}
