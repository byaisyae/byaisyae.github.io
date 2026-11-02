import { useRef } from "react";
import banner from "../assets/banner.webp";
import { STATS, CATS } from "../config";
import { useCountUp } from "../utils/useCountUp";

// harga promo terendah dari kategori yang punya pricelist (untuk microcopy CTA)
const PRICE = CATS.find((c) => c.price)?.price.now;

/** Kartu kecil di atas gambar: angka menghitung naik + melayang pelan. */
function StatCard({ value, label, className, float, delay, depth = 1 }) {
  const n = useCountUp(value, { delay });
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={delay}
      className={`absolute z-10 ${className}`}
    >
      {/* lapisan parallax: bergerak mengikuti mouse, makin besar depth makin jauh geraknya */}
      <div className="hv-card" style={{ "--d": depth }}>
        <div
          className={`${float} rounded-lg sm:rounded-xl border border-white/10 bg-n9/75 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 lg:px-4 lg:py-3 shadow-xl shadow-black/40`}
        >
          <p className="font-serif text-base sm:text-xl lg:text-2xl font-bold leading-none text-sk-300">
            {n}
          </p>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] lg:text-xs leading-snug text-sk-200/80 max-w-[6.5rem] sm:max-w-[8.5rem] lg:max-w-none">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Gambar banner + kartu: miring/bergeser mengikuti mouse saat di-hover. */
function HeroVisual() {
  const ref = useRef(null);
  const raf = useRef(0);
  const still = useRef(
    typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const set = (el, v) => {
    for (const k in v) el.style.setProperty(k, v[k]);
  };

  const onMove = (e) => {
    if (still.current || (e.pointerType && e.pointerType !== "mouse")) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      set(el, {
        "--mx": ((clientX - r.left) / r.width - 0.5).toFixed(3),
        "--my": ((clientY - r.top) / r.height - 0.5).toFixed(3),
      });
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    if (ref.current) set(ref.current, { "--mx": 0, "--my": 0 });
  };

  return (
    <div
      data-aos="zoom-in"
      data-aos-delay="200"
      className="order-first lg:order-last w-full max-w-xl mx-auto lg:max-w-none"
    >
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="hv relative"
      >
        <img
          src={banner}
          width="1400"
          height="992"
          decoding="async"
          alt="Contoh undangan pernikahan digital di laptop, tablet, dan ponsel"
          className="hv-img relative w-full h-auto select-none"
        />
        <StatCard
          value={STATS.themes}
          label="Tema tersedia"
          className="top-[1%] left-[1%] sm:top-[3%] sm:left-[2%] lg:top-0 lg:left-0"
          float="float-a"
          delay={600}
          depth={1}
        />
        <StatCard
          value={STATS.clients}
          label="Undangan client telah dibuat"
          className="bottom-[1%] right-[1%] sm:bottom-[3%] sm:right-[2%] lg:bottom-1 lg:right-0"
          float="float-b"
          delay={800}
          depth={1.5}
        />
      </div>
    </div>
  );
}

export default function Hero() {
  const secRef = useRef(null);
  const raf = useRef(0);
  const still = useRef(
    typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // cahaya mengikuti kursor di seluruh background hero
  const onMove = (e) => {
    if (still.current || (e.pointerType && e.pointerType !== "mouse")) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = secRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--gx", `${clientX - r.left}px`);
      el.style.setProperty("--gy", `${clientY - r.top}px`);
      el.style.setProperty("--glow", 1);
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    secRef.current?.style.setProperty("--glow", 0);
  };

  return (
    <section
      id="top"
      ref={secRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="hg glow relative pt-[calc(7rem+var(--bar))] sm:pt-[calc(8rem+var(--bar))] pb-16 sm:pb-20 px-5"
    >
      <div
        aria-hidden="true"
        className="hv-glow pointer-events-none absolute inset-0"
      />
      <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 items-center gap-12 lg:gap-8">
        {/* teks: tengah di layar kecil, rata kiri di layar lebar */}
        <div className="text-center lg:text-left">
          <p
            data-aos="fade-up"
            className="tracking-[.3em] sm:tracking-[.4em] text-[11px] sm:text-xs text-sk-300"
          >
            AISYAE DIGITAL INVITATION
          </p>
          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="font-serif text-4xl sm:text-6xl lg:text-5xl xl:text-6xl text-white mt-5 leading-tight"
          >
            Satu Link untuk{" "}
            <span className="font-script text-5xl sm:text-7xl lg:text-6xl xl:text-7xl text-sk-300">
              Seribu Kebahagiaan
            </span>
          </h1>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mt-6 max-w-2xl mx-auto lg:mx-0 text-sk-300/90 leading-relaxed"
          >
            Hari paling istimewa dalam hidup Anda layak dibuka dengan undangan
            yang berkesan. Elegan, personal untuk setiap tamu, dan siap
            dibagikan lewat WhatsApp hanya dalam hitungan detik.
          </p>
          <div
            data-aos="fade-up"
            data-aos-delay="300"
            className="mt-9 flex flex-col sm:flex-row sm:flex-wrap justify-center lg:justify-start items-stretch sm:items-center gap-3 max-w-xs sm:max-w-none mx-auto lg:mx-0"
          >
            <a
              href={`${import.meta.env.BASE_URL}katalog/`}
              className="px-7 py-3 text-center rounded-full bg-sk-300 text-n9 font-semibold hover:bg-white sm:hover:scale-105 transition"
            >
              Lihat Desain &amp; Harga
            </a>
            <a
              href="#generator"
              className="px-7 py-3 text-center rounded-full border border-sk-300/50 hover:bg-sk-300/10 transition"
            >
              Buat Link Tamu
            </a>
          </div>
          {/* microcopy penghilang keraguan di bawah tombol */}
          <p
            data-aos="fade-up"
            data-aos-delay="400"
            className="mt-4 text-xs sm:text-sm text-sk-300/80 leading-relaxed"
          >
            {PRICE ? `Mulai Rp ${PRICE} • ` : ""}Preview maks. 2 hari kerja •
            Revisi teks tanpa batas • Pesan langsung via WhatsApp
          </p>
        </div>

        {/* gambar: di atas teks pada layar kecil/tablet, di kanan pada layar lebar */}
        <HeroVisual />
      </div>
    </section>
  );
}
