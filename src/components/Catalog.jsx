import { C, D } from "../config";
import { AN } from "../utils/anim";
import { WA } from "../utils/wa";
import DesignCard from "./DesignCard";
import WaIcon from "./WaIcon";

const FEATURED = D.filter((x) => x.featured);
const CATALOG = `${import.meta.env.BASE_URL}katalog/`;

export default function Catalog({ onPick }) {
  return (
    <section id="katalog" className="py-16 sm:py-20 px-5">
      <div className="max-w-6xl mx-auto text-center">
        <p data-aos="fade-up" className="tracking-[.4em] text-xs text-sk-300">
          DIGITAL INVITATION
        </p>
        <h2
          data-aos="fade-up"
          data-aos-delay="100"
          className="font-script text-5xl sm:text-6xl text-white mt-3"
        >
          Koleksi Undangan Kami
        </h2>
        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="mt-4 max-w-2xl mx-auto text-sk-300/90 leading-relaxed"
        >
          Lihat langsung undangan yang sudah jadi. Buka, geser, dan rasakan
          sendiri pengalaman yang akan diterima para tamu Anda.
        </p>
        <div
          id="dz"
          className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 justify-items-center"
        >
          {FEATURED.map((x, i) => (
            <DesignCard
              key={x.url}
              design={x}
              index={i}
              anim={AN[i % 3]}
              onPick={onPick}
            />
          ))}

          {/* kartu desain custom */}
          <div
            data-aos={AN[FEATURED.length % 3]}
            data-aos-delay={FEATURED.length * 120}
            className="w-full max-w-[17rem] self-start"
          >
            <div className="rounded-[2.2rem] p-2 border-2 border-dashed border-sk-300/40">
              <div className="aspect-[9/16] rounded-[1.8rem] grid place-items-center text-center px-6">
                <div>
                  <p className="font-script text-5xl text-sk-300">
                    Desain Custom
                  </p>
                  <p className="text-sm mt-4 text-sk-300/90 leading-relaxed">
                    Punya konsep impian? Warna, tema, hingga animasi bisa
                    disesuaikan dengan kisah Anda. Diskusikan dan pesan undangan
                    digital custom Anda sekarang.
                  </p>
                  <a
                    href={WA(C.msgCustom)}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 mt-5 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition"
                  >
                    <WaIcon className="w-4 h-4" />
                    Diskusikan
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div data-aos="fade-up" className="mt-14">
          <a
            href={CATALOG}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-sk-300/50 text-white hover:bg-sk-300 hover:text-n9 transition"
          >
            Lihat Semua Koleksi <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
