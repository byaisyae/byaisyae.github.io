import { useEffect } from "react";
import { C } from "../config";
import { WA } from "../utils/wa";
import Footer from "../components/Footer";
import WaIcon from "../components/WaIcon";

const HOME = import.meta.env.BASE_URL;

export default function NotFound() {
  useEffect(() => {
    document.title =
      "404 — Halaman Tidak Ditemukan | Aisyae Digital Invitation";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ minHeight: "100dvh" }}>
      <header className="border-b border-sk-300/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <a
            href={HOME}
            className="inline-flex items-center h-10 pt-1 font-script text-3xl leading-none text-white"
          >
            Aisyae
          </a>
        </div>
      </header>

      <main className="glow flex-1 grid place-items-center px-5 py-16 sm:py-20 text-center">
        <div className="max-w-xl w-full nf-rise">
          <p className="tracking-[.3em] sm:tracking-[.4em] text-[11px] sm:text-xs text-sk-300">
            HALAMAN TIDAK DITEMUKAN
          </p>
          <p
            className="font-script text-[7rem] sm:text-[10rem] leading-none text-sk-300 mt-2 select-none"
            aria-hidden="true"
          >
            404
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-white -mt-2 sm:-mt-4">
            Oops, Undangan Salah Alamat
          </h1>
          <p className="mt-5 text-sk-300/90 leading-relaxed">
            Halaman yang Anda cari tidak terdaftar atau sudah dipindahkan.
            Periksa kembali link-nya, atau kembali ke beranda untuk melihat
            koleksi undangan kami.
          </p>
          <p className="mt-5 text-xs text-sk-300/70">Alamat yang dibuka:</p>
          <code className="mt-1 inline-block max-w-full break-all px-3 py-1.5 rounded-lg bg-n8 border border-sk-300/20 text-xs text-sk-200">
            {location.pathname + location.search + location.hash}
          </code>

          <div className="mt-9 flex flex-col sm:flex-row sm:flex-wrap justify-center items-stretch sm:items-center gap-3 max-w-xs sm:max-w-none mx-auto">
            <a
              href={HOME}
              className="px-7 py-3 text-center rounded-full bg-sk-300 text-n9 font-semibold hover:bg-white sm:hover:scale-105 transition"
            >
              Kembali ke Beranda
            </a>
            <a
              href={`${HOME}katalog/`}
              className="px-7 py-3 text-center rounded-full border border-sk-300/50 hover:bg-sk-300/10 transition"
            >
              Lihat Koleksi
            </a>
            <a
              href={WA(C.msgHelp)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-400 sm:hover:scale-105 transition"
            >
              <WaIcon /> Hubungi Kami
            </a>
          </div>
        </div>
      </main>

      <Footer className="py-8" />
    </div>
  );
}
