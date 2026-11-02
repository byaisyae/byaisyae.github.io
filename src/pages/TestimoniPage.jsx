import { useEffect } from "react";
import AOS from "aos";
import { useTestimonialsState } from "../utils/useTestimonials";
import Header from "../components/Header";
import TestimonialCard from "../components/TestimonialCard";
import Cta from "../components/Cta";
import Footer from "../components/Footer";
import WaFloat from "../components/WaFloat";

const BASE = import.meta.env.BASE_URL;

/** Halaman publik: semua testimoni dari seluruh client. */
export default function TestimoniPage() {
  const { list, loading } = useTestimonialsState();

  useEffect(() => {
    document.title = "Testimoni Client | Aisyae Digital Invitation";
  }, []);

  useEffect(() => {
    if (list.length && document.documentElement.classList.contains("aos-on"))
      AOS.refreshHard();
  }, [list.length]);

  return (
    <>
      <Header />
      <section className="glow pt-[calc(7rem+var(--bar))] sm:pt-[calc(8rem+var(--bar))] pb-8 px-5 text-center">
        <p
          data-aos="fade-up"
          className="tracking-[.3em] sm:tracking-[.4em] text-[11px] sm:text-xs text-sk-300"
        >
          TESTIMONI
        </p>
        <h1
          data-aos="fade-up"
          data-aos-delay="100"
          className="font-script text-5xl sm:text-7xl text-white mt-3"
        >
          Kata Mereka yang Sudah Percaya
        </h1>
        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="mt-4 max-w-2xl mx-auto text-sk-300/90 leading-relaxed"
        >
          Cerita dari seluruh pasangan yang sudah memakai undangan digital kami
          di hari bahagia mereka.
        </p>
      </section>

      <main className="px-5 pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          {list.length ? (
            <div className="flex flex-wrap justify-center gap-5">
              {list.map((t, i) => (
                <div
                  key={t.name + i}
                  data-aos="fade-up"
                  data-aos-delay={(i % 3) * 100}
                  className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.85rem)]"
                >
                  <TestimonialCard t={t} />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto rounded-3xl border-2 border-dashed border-sk-300/30 px-6 py-10 text-center">
              <p className="text-sk-300/90">
                {loading
                  ? "Memuat testimoni…"
                  : "Testimoni akan segera hadir. Lihat dulu desain undangan kami."}
              </p>
              {!loading && (
                <a
                  href={`${BASE}katalog/`}
                  className="inline-flex items-center justify-center h-11 px-6 mt-5 rounded-full bg-sk-300 text-n9 font-semibold hover:bg-white transition"
                >
                  Lihat Katalog
                </a>
              )}
            </div>
          )}
        </div>
      </main>

      <Cta />
      <Footer />
      <WaFloat />
    </>
  );
}
