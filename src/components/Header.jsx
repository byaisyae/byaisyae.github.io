import { useEffect, useRef, useState } from "react";
import { C, PROMO, promoActive } from "../config";
import { WA, orderPromo } from "../utils/wa";
import WaIcon from "./WaIcon";

const BASE = import.meta.env.BASE_URL;
// href absolut ke beranda agar menu juga berfungsi dari halaman katalog
const NAV_BEFORE = [
  [`${BASE}#katalog`, "Koleksi"],
  [`${BASE}katalog/`, "Katalog"],
];
const NAV_AFTER = [[`${BASE}#generator`, "Generator"]];

// Dropdown: gabungan "Keunggulan" dan "Cara Kerja"
const MENU = {
  label: "Layanan Kami",
  items: [
    {
      href: `${BASE}#fitur`,
      title: "Keunggulan",
      desc: "Nama tamu personal, peta & detail acara, RSVP, galeri, dan musik latar dalam satu link.",
      icon: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5l-5.4 3 1.2-6L3.3 9.3l6.1-.7L12 3z",
    },
    {
      href: `${BASE}#cara`,
      title: "Cara Kerja",
      desc: "Pilih desain, kirim data & foto, lalu bagikan link ke tamu hanya dalam 3 langkah.",
      icon: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
    },
    {
      href: `${BASE}faq/`,
      title: "F.A.Q",
      desc: "Jawaban seputar pemesanan, lama pengerjaan, revisi, masa aktif, dan refund.",
      icon: "M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 115 0c0 1.6-2.5 2-2.5 3.5M12 17h.01",
    },
    {
      href: `${BASE}add-on/`,
      title: "Add On",
      desc: "Layanan tambahan: pengerjaan prioritas, ganti background, font, dan tone.",
      icon: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 8v8M8 12h8",
    },
  ],
};

const Chevron = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Satu baris di dropdown: kotak ikon + judul + deskripsi. */
const MenuItem = ({ item, onClick }) => (
  <a
    href={item.href}
    onClick={onClick}
    className="flex items-start gap-4 p-3 rounded-xl hover:bg-sk-300/10 transition"
  >
    <span className="grid place-items-center w-10 h-10 shrink-0 rounded-lg bg-sk-300/15 text-sk-300">
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={item.icon} />
      </svg>
    </span>
    <span className="block text-left">
      <span className="block font-semibold text-sk-300">{item.title}</span>
      <span className="block mt-1 text-xs leading-relaxed text-sk-200/80">
        {item.desc}
      </span>
    </span>
  </a>
);

export default function Header() {
  const [open, setOpen] = useState(false); // menu mobile
  const [dd, setDd] = useState(false); // dropdown desktop
  const [mdd, setMdd] = useState(false); // dropdown di menu mobile
  const hdRef = useRef(null);
  const ddTimer = useRef(null);

  // dropdown desktop terbuka saat di-hover; ditutup dengan jeda singkat agar tidak berkedip
  const openDd = () => {
    clearTimeout(ddTimer.current);
    setDd(true);
  };
  const closeDd = () => {
    clearTimeout(ddTimer.current);
    ddTimer.current = setTimeout(() => setDd(false), 150);
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (hdRef.current && !hdRef.current.contains(e.target)) setOpen(false);
      if (!e.target.closest("[data-dd]")) setDd(false); // klik di luar dropdown
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDd(false);
      }
    };
    const mq = matchMedia("(min-width:768px)");
    const onMq = () => {
      setOpen(false);
      setDd(false);
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      clearTimeout(ddTimer.current);
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  return (
    <header
      id="hd"
      ref={hdRef}
      className="fixed top-0 inset-x-0 z-40 bg-n9/85 backdrop-blur-md border-b border-sk-300/15"
    >
      {promoActive && (
        <a
          href={orderPromo()}
          target="_blank"
          rel="noopener"
          className="flex items-center justify-center gap-2 h-9 px-3 bg-sk-300 text-n9 text-[11px] sm:text-sm font-semibold leading-none hover:bg-white transition"
        >
          <span aria-hidden="true">🎉</span>
          <span className="truncate">
            <span className="hidden sm:inline">
              Promo Nov–Des: semua desain undangan{" "}
            </span>
            <span className="sm:hidden">Promo s.d. 31 Des: semua desain </span>
            <span className="font-bold">Rp {PROMO.price}</span>{" "}
            <s className="font-normal opacity-60">Rp {PROMO.normal}</s>
          </span>
          <span className="hidden sm:inline underline underline-offset-2">
            Klaim sekarang →
          </span>
        </a>
      )}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <a
          href={BASE}
          className="inline-flex items-center h-10 pt-1 font-script text-3xl leading-none text-white"
        >
          saevitation
        </a>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV_BEFORE.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="inline-flex items-center h-10 px-4 rounded-full hover:bg-sk-300/10 hover:text-white transition"
            >
              {label}
            </a>
          ))}
          <button
            type="button"
            data-dd
            aria-haspopup="true"
            aria-expanded={dd}
            aria-controls="dd-menu"
            onMouseEnter={openDd}
            onMouseLeave={closeDd}
            onClick={openDd}
            className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full transition ${
              dd
                ? "bg-sk-300/10 text-sk-300"
                : "hover:bg-sk-300/10 hover:text-white"
            }`}
          >
            {MENU.label}
            <Chevron open={dd} />
          </button>
          {NAV_AFTER.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="inline-flex items-center h-10 px-4 rounded-full hover:bg-sk-300/10 hover:text-white transition"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={WA(C.msgOrder)}
            target="_blank"
            rel="noopener"
            className="hidden sm:inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-emerald-500 text-white text-sm font-medium leading-none whitespace-nowrap hover:bg-emerald-400 transition"
          >
            <WaIcon className="w-4 h-4" /> Pesan Sekarang
          </a>
          <button
            id="mnu"
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-controls="mm"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-sk-300/40 text-white hover:bg-sk-300/10 transition"
          >
            {open ? (
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
        {dd && (
          <div
            data-dd
            onMouseEnter={openDd}
            onMouseLeave={closeDd}
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[34rem] max-w-[calc(100vw-2rem)]"
          >
            <div
              id="dd-menu"
              className="dd-in grid grid-cols-2 gap-1 p-3 rounded-2xl border border-sk-300/20 bg-n9/95 backdrop-blur-md shadow-2xl shadow-black/50"
            >
              {MENU.items.map((it) => (
                <MenuItem key={it.href} item={it} onClick={() => setDd(false)} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div
        id="mm"
        onClick={(e) => {
          if (e.target.closest("a")) setOpen(false);
        }}
        className={`${open ? "" : "hidden"} md:hidden absolute inset-x-0 top-full border-b border-sk-300/15 bg-n9/95 backdrop-blur-md shadow-2xl shadow-black/40`}
      >
        <div className="grid gap-1 px-4 py-4 text-base">
          {NAV_BEFORE.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="flex items-center h-12 px-4 rounded-xl hover:bg-sk-300/10 active:bg-sk-300/15 hover:text-white transition"
            >
              {label}
            </a>
          ))}
          <button
            type="button"
            aria-expanded={mdd}
            onClick={() => setMdd((o) => !o)}
            className="flex items-center justify-between w-full h-12 px-4 rounded-xl hover:bg-sk-300/10 active:bg-sk-300/15 hover:text-white transition"
          >
            {MENU.label}
            <Chevron open={mdd} />
          </button>
          {mdd && (
            <div className="grid gap-1 pl-2">
              {MENU.items.map((it) => (
                <MenuItem key={it.href} item={it} />
              ))}
            </div>
          )}
          {NAV_AFTER.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="flex items-center h-12 px-4 rounded-xl hover:bg-sk-300/10 active:bg-sk-300/15 hover:text-white transition"
            >
              {label}
            </a>
          ))}
          <a
            href={WA(C.msgOrder)}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2 h-12 mt-2 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition"
          >
            <WaIcon /> Pesan Sekarang
          </a>
          <a
            href={`${BASE}#generator`}
            className="flex items-center justify-center h-12 rounded-full border border-sk-300/50 hover:bg-sk-300/10 transition"
          >
            Buat Link Tamu
          </a>
        </div>
      </div>
    </header>
  );
}
