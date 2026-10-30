import { C } from "../config";
import { WA } from "../utils/wa";
import WaIcon from "./WaIcon";

export default function Cta({ hideCollection = false }) {
  return (
    <section id="pesan" className="py-20 sm:py-24 px-5 text-center bg-n7/40">
      <div className="max-w-2xl mx-auto">
        <h2
          data-aos="fade-up"
          className="font-script text-5xl sm:text-6xl text-white"
        >
          Mulai Kisah Bahagia Anda
        </h2>
        <p data-aos="fade-up" className="mt-4 text-sk-300/90">
          Biarkan undangan Anda bercerita. Kami siapkan desainnya, Anda tinggal
          menyambut para tamu dengan senyuman.
        </p>
        <p data-aos="fade-up" className="mt-3 text-sk-300/90 leading-relaxed">
          Ingin memesan undangan pernikahan digital? Ceritakan konsep Anda lewat
          WhatsApp — kami bantu dari memilih desain, menyiapkan data, hingga
          link undangan siap dibagikan ke para tamu.
        </p>
        <div
          data-aos="fade-up"
          className="mt-8 flex flex-col sm:flex-row justify-center gap-3 max-w-xs sm:max-w-none mx-auto"
        >
          <a
            href={WA(C.msgOrder)}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-400 sm:hover:scale-105 transition"
          >
            <WaIcon /> Pesan Undangan Digital
          </a>
          {!hideCollection && (
            <a
              href={`${import.meta.env.BASE_URL}katalog/`}
              className="px-7 py-3 text-center rounded-full border border-sk-300/50 hover:bg-sk-300/10 transition"
            >
              Lihat Katalog Undangan
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
