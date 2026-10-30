import { useEffect, useRef, useState } from "react";
import { C } from "../config";
import { WA } from "../utils/wa";
import WaIcon from "./WaIcon";

const NAV = [
  ["#katalog", "Koleksi"],
  ["#fitur", "Keunggulan"],
  ["#cara", "Cara Kerja"],
  ["#generator", "Generator"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const hdRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (hdRef.current && !hdRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = matchMedia("(min-width:768px)");
    const onMq = (e) => {
      if (e.matches) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <a
          href="#top"
          className="inline-flex items-center h-10 pt-1 font-script text-3xl leading-none text-white"
        >
          Aisyae
        </a>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV.map(([href, label]) => (
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
            href="#generator"
            className="hidden sm:inline-flex items-center justify-center h-10 px-5 rounded-full bg-sk-300 text-n9 text-sm font-medium leading-none whitespace-nowrap hover:bg-white transition"
          >
            Buat Link Tamu
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
      </div>
      <div
        id="mm"
        onClick={(e) => {
          if (e.target.closest("a")) setOpen(false);
        }}
        className={`${open ? "" : "hidden"} md:hidden absolute inset-x-0 top-full border-b border-sk-300/15 bg-n9/95 backdrop-blur-md shadow-2xl shadow-black/40`}
      >
        <div className="grid gap-1 px-4 py-4 text-base">
          {NAV.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="flex items-center h-12 px-4 rounded-xl hover:bg-sk-300/10 active:bg-sk-300/15 hover:text-white transition"
            >
              {label}
            </a>
          ))}
          <a
            href="#generator"
            className="flex items-center justify-center h-12 mt-2 rounded-full bg-sk-300 text-n9 font-medium hover:bg-white transition sm:hidden"
          >
            Buat Link Tamu
          </a>
          <a
            href={WA(C.msgOrder)}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2 h-12 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition"
          >
            <WaIcon /> Pesan via WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
