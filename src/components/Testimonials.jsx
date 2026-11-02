import { useEffect, useRef, useState } from "react";
import AOS from "aos";
import { useTestimonials } from "../utils/useTestimonials";
import TestimonialCard from "./TestimonialCard";

const BASE = import.meta.env.BASE_URL;
const HOME_MAX = 5; // jumlah testimoni terbaru di beranda
const EVERY = 5000; // jeda geser otomatis (ms)

const mq = (q) => matchMedia(q).matches;
const colsNow = () => (mq("(min-width:1024px)") ? 3 : mq("(min-width:768px)") ? 2 : 1);

/** Jumlah kartu yang tampil sekaligus: 1 (HP), 2 (tablet), 3 (desktop). */
function useCols() {
  const [c, setC] = useState(colsNow);
  useEffect(() => {
    const qs = [matchMedia("(min-width:1024px)"), matchMedia("(min-width:768px)")];
    const f = () => setC(colsNow());
    qs.forEach((q) => q.addEventListener("change", f));
    return () => qs.forEach((q) => q.removeEventListener("change", f));
  }, []);
  return c;
}

const Arrow = ({ dir }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

/**
 * Carousel tanpa batas (loop): kartu pertama diduplikasi di ujung, lalu posisi
 * dikembalikan ke awal tanpa animasi setelah sampai di duplikat.
 * Geser otomatis; berhenti saat di-hover/fokus/disentuh; mendukung swipe & tombol.
 */
function Carousel({ items }) {
  const n = items.length;
  const cols = useCols();
  const loop = n > cols;
  const [i, setI] = useState(0);
  const [anim, setAnim] = useState(true);
  const [paused, setPaused] = useState(false);
  const drag = useRef(null);
  const still = useRef(mq("(prefers-reduced-motion: reduce)"));

  // ukuran tampilan/jumlah data berubah → kembali ke awal
  useEffect(() => {
    setAnim(false);
    setI(0);
  }, [cols, n]);

  const next = () => {
    if (!loop || i >= n) return; // i === n = sedang di duplikat, tunggu reset
    setAnim(true);
    setI(i + 1);
  };
  const prev = () => {
    if (!loop) return;
    if (i === 0) {
      // lompat (tanpa animasi) ke duplikat di ujung, lalu geser mundur satu
      setAnim(false);
      setI(n);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnim(true);
          setI(n - 1);
        }),
      );
    } else {
      setAnim(true);
      setI(i - 1);
    }
  };

  // geser otomatis
  useEffect(() => {
    if (!loop || paused || still.current) return;
    const t = setTimeout(next, EVERY);
    return () => clearTimeout(t);
  });

  const onEnd = (e) => {
    if (e.target !== e.currentTarget) return;
    if (i >= n) {
      setAnim(false);
      setI(i - n);
    }
  };

  const onDown = (e) => {
    drag.current = e.clientX;
    if (e.pointerType !== "mouse") setPaused(true);
  };
  const onUp = (e) => {
    if (drag.current == null) return;
    const dx = e.clientX - drag.current;
    drag.current = null;
    if (e.pointerType !== "mouse") setPaused(false);
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  };

  const slides = loop ? [...items, ...items.slice(0, cols)] : items;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimoni client"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative"
    >
      <div
        className="overflow-hidden py-1 [touch-action:pan-y]"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <div
          onTransitionEnd={onEnd}
          className={`flex ${loop ? "" : "justify-center"}`}
          style={{
            transform: loop ? `translateX(-${(i * 100) / cols}%)` : undefined,
            transition: anim && !still.current ? "transform 500ms ease" : "none",
          }}
        >
          {slides.map((t, k) => {
            const clone = k >= n;
            return (
              <div
                key={k}
                role="group"
                aria-roledescription="slide"
                aria-label={clone ? undefined : `${k + 1} dari ${n}`}
                aria-hidden={clone || undefined}
                {...(clone ? { inert: "" } : {})}
                className="px-2.5"
                style={{ flex: `0 0 ${100 / cols}%`, maxWidth: loop ? undefined : "26rem" }}
              >
                <TestimonialCard t={t} />
              </div>
            );
          })}
        </div>
      </div>

      {loop && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Testimoni sebelumnya"
            className="grid place-items-center w-10 h-10 rounded-full border border-sk-300/40 text-white hover:bg-sk-300/10 transition"
          >
            <Arrow dir={-1} />
          </button>
          <div className="flex gap-2">
            {items.map((_, k) => (
              <button
                key={k}
                type="button"
                aria-label={`Ke testimoni ${k + 1}`}
                aria-current={k === i % n}
                onClick={() => {
                  setAnim(true);
                  setI(k);
                }}
                className={`h-2 rounded-full transition-all ${
                  k === i % n ? "w-6 bg-sk-300" : "w-2 bg-sk-300/30 hover:bg-sk-300/60"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Testimoni berikutnya"
            className="grid place-items-center w-10 h-10 rounded-full border border-sk-300/40 text-white hover:bg-sk-300/10 transition"
          >
            <Arrow dir={1} />
          </button>
        </div>
      )}
    </div>
  );
}

/** Testimoni di beranda: 5 terbaru dalam carousel + tombol ke halaman semua testimoni. */
export default function Testimonials() {
  const all = useTestimonials();
  const list = all.slice(0, HOME_MAX);

  // kartu baru muncul setelah data dari Sheet dimuat → daftarkan ulang ke animasi AOS
  useEffect(() => {
    if (list.length && document.documentElement.classList.contains("aos-on"))
      AOS.refreshHard();
  }, [list.length]);

  if (!list.length) return null;

  return (
    <section id="testimoni" className="py-16 sm:py-20 px-5">
      <div className="max-w-6xl mx-auto text-center">
        <p
          data-aos="fade-up"
          className="tracking-[.3em] sm:tracking-[.4em] text-[11px] sm:text-xs text-sk-300"
        >
          TESTIMONI
        </p>
        <h2
          data-aos="fade-up"
          data-aos-delay="100"
          className="font-script text-5xl text-white mt-3"
        >
          Kata Mereka yang Sudah Percaya
        </h2>
        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="mt-3 text-sk-300/90 max-w-2xl mx-auto"
        >
          Cerita dari pasangan yang sudah memakai undangan digital kami di hari
          bahagia mereka.
        </p>

        <div data-aos="fade-up" className="mt-12">
          <Carousel items={list} />
        </div>

        <a
          href={`${BASE}testimoni/`}
          className="inline-flex items-center justify-center gap-2 h-12 px-7 mt-10 rounded-full border border-sk-300/50 text-white hover:bg-sk-300 hover:text-n9 font-medium transition"
        >
          Lihat Semua Testimoni
          {all.length > list.length && (
            <span className="text-sk-300/80">({all.length})</span>
          )}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
