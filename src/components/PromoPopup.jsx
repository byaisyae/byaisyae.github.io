import { useEffect, useRef, useState } from "react";
import { usePromo } from "../utils/useDesigns";
import { orderPromo } from "../utils/wa";
import WaIcon from "./WaIcon";

// sudah ditutup di sesi ini? (storage bisa diblokir browser → anggap belum)
const seen = (id) => {
  try {
    return sessionStorage.getItem(`promo-seen:${id}`) === "1";
  } catch {
    return false;
  }
};

/** Popup promo: muncul sekali per sesi, hanya selama periode promo aktif. */
export default function PromoPopup() {
  const promo = usePromo();
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  // tampil setelah jeda singkat agar tidak menutupi hero saat halaman baru dibuka
  useEffect(() => {
    if (!promo.active || seen(promo.id)) return;
    const t = setTimeout(() => setOpen(true), 1800);
    return () => clearTimeout(t);
  }, [promo.active, promo.id]);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(`promo-seen:${promo.id}`, "1");
    } catch {
      /* abaikan */
    }
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // kunci scroll saat popup terbuka
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !promo.active) return null;

  return (
    <div
      className="pop-bg fixed inset-0 z-[60] grid place-items-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        className="pop-card relative w-full max-w-sm rounded-3xl border border-sk-300/25 bg-n9 px-6 pt-9 pb-7 text-center shadow-2xl shadow-black/60"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Tutup promo"
          className="absolute top-3 right-3 grid place-items-center w-10 h-10 rounded-full text-sk-200/80 hover:bg-sk-300/10 hover:text-white transition"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <p className="tracking-[.3em] text-[11px] text-sk-300 uppercase">
          {promo.label}
        </p>
        <h2
          id="promo-title"
          className="font-script text-4xl sm:text-5xl text-white mt-3 leading-tight"
        >
          {promo.headline}
        </h2>

        {promo.normal && (
          <p className="mt-4 text-sm text-sk-300/70 line-through">
            Rp {promo.normal}
          </p>
        )}
        <p className="font-serif text-5xl sm:text-6xl font-bold text-sk-300 leading-none mt-1">
          Rp {promo.price}
        </p>
        <p className="mt-3 text-sm text-sk-200/90">
          Berlaku sampai {promo.untilLabel}. Preview maks. 2 hari kerja, revisi
          teks tanpa batas.
        </p>

        <div className="mt-6 grid gap-3">
          <a
            href={orderPromo(promo)}
            target="_blank"
            rel="noopener"
            onClick={close}
            className="inline-flex items-center justify-center gap-2 h-12 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition"
          >
            <WaIcon /> Klaim Promo via WhatsApp
          </a>
          <a
            href={`${import.meta.env.BASE_URL}katalog/`}
            onClick={close}
            className="inline-flex items-center justify-center h-12 rounded-full border border-sk-300/50 hover:bg-sk-300/10 transition"
          >
            Lihat Desain
          </a>
        </div>
      </div>
    </div>
  );
}
