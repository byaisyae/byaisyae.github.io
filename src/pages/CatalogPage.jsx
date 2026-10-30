import { useEffect, useMemo, useState } from "react";
import AOS from "aos";
import { C, D, CATS } from "../config";
import { AN } from "../utils/anim";
import { WA, orderDesign } from "../utils/wa";
import Header from "../components/Header";
import CatalogCard from "../components/CatalogCard";
import Cta from "../components/Cta";
import Footer from "../components/Footer";
import WaFloat from "../components/WaFloat";
import WaIcon from "../components/WaIcon";

const initialCat = () => {
  const k = new URLSearchParams(location.search).get("kategori");
  return CATS.some((c) => c.id === k) ? k : "semua";
};

export default function CatalogPage() {
  const [cat, setCat] = useState(initialCat);

  useEffect(() => {
    document.title = "Katalog Undangan Pernikahan Digital | Aisyae Digital Invitation";
  }, []);

  // grup per kategori (+ desain tanpa kategori di "Koleksi Lainnya")
  const groups = useMemo(() => {
    const g = CATS.map((c) => ({ ...c, items: D.filter((x) => x.cat === c.id) }));
    const rest = D.filter((x) => !CATS.some((c) => c.id === x.cat));
    if (rest.length)
      g.push({
        id: "lainnya",
        label: "Koleksi Lainnya",
        desc: "Desain pilihan dengan gaya lainnya.",
        items: rest,
      });
    return g;
  }, []);

  const shown =
    cat === "semua"
      ? groups.filter((g) => g.items.length)
      : groups.filter((g) => g.id === cat);

  const pick = (id) => {
    setCat(id);
    const u = new URL(location.href);
    id === "semua"
      ? u.searchParams.delete("kategori")
      : u.searchParams.set("kategori", id);
    history.replaceState(null, "", u);
  };

  // muat ulang animasi AOS untuk kartu yang baru dirender saat ganti kategori
  useEffect(() => {
    if (document.documentElement.classList.contains("aos-on"))
      AOS.refreshHard();
  }, [cat]);

  const pills = [
    { id: "semua", label: "Semua", n: D.length },
    ...CATS.map((c) => ({
      id: c.id,
      label: c.label,
      n: D.filter((x) => x.cat === c.id).length,
    })),
  ];

  return (
    <>
      <Header />
      <section className="glow pt-28 sm:pt-32 pb-8 px-5 text-center">
        <p
          data-aos="fade-up"
          className="tracking-[.3em] sm:tracking-[.4em] text-[11px] sm:text-xs text-sk-300"
        >
          KATALOG UNDANGAN
        </p>
        <h1
          data-aos="fade-up"
          data-aos-delay="100"
          className="font-script text-5xl sm:text-7xl text-white mt-3"
        >
          Pilih Desain Impian Anda
        </h1>
        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="mt-4 max-w-2xl mx-auto text-sk-300/90 leading-relaxed"
        >
          Jelajahi semua desain undangan digital kami berdasarkan kategori.
          Buka demonya, lihat harganya, lalu pesan langsung lewat WhatsApp.
        </p>
        <div
          role="tablist"
          aria-label="Kategori katalog"
          className="mt-8 flex flex-wrap justify-center gap-2 text-sm"
        >
          {pills.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={cat === p.id}
              onClick={() => pick(p.id)}
              className={`px-5 py-2 rounded-full border transition ${
                cat === p.id
                  ? "bg-sk-300 text-n9 border-sk-300 font-medium"
                  : "border-sk-300/40 hover:bg-sk-300/10"
              }`}
            >
              {p.label}{" "}
              <span className={cat === p.id ? "text-n9/70" : "text-sk-300/60"}>
                ({p.n})
              </span>
            </button>
          ))}
        </div>
      </section>

      <main className="relative isolate px-5 pb-16 sm:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_35%_at_20%_25%,rgba(127,168,224,0.14),transparent_70%),radial-gradient(50%_35%_at_85%_70%,rgba(18,48,92,0.7),transparent_70%)]"
        />
        <div className="max-w-6xl mx-auto space-y-16">
          {shown.map((g) => (
            <section key={g.id} aria-label={g.label}>
              <div className="text-center">
                <h2 className="font-serif text-2xl sm:text-3xl text-white">
                  {g.label}
                </h2>
                <p className="mt-2 text-sm text-sk-300/90 max-w-xl mx-auto">
                  {g.desc}
                </p>
              </div>

              {g.items.length ? (
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                  {g.items.map((x, i) => {
                    const title =
                      x.title ||
                      (CATS.some((c) => c.id === g.id)
                        ? `${g.label} ${String(i + 1).padStart(2, "0")}`
                        : x.tag);
                    return (
                      <CatalogCard
                        key={x.url}
                        design={x}
                        title={title}
                        index={i}
                        anim={AN[i % 3]}
                        price={g.price}
                        orderHref={orderDesign(title, x, g)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="mt-10 max-w-md mx-auto rounded-3xl border-2 border-dashed border-sk-300/30 px-6 py-10 text-center">
                  <p className="font-script text-4xl text-sk-300">Segera Hadir</p>
                  <p className="mt-3 text-sm text-sk-300/90 leading-relaxed">
                    Desain kategori {g.label} sedang kami siapkan. Ingin
                    request desain tertentu? Diskusikan langsung dengan kami.
                  </p>
                  <a
                    href={WA(
                      `Halo Aisyae Digital Invitation 👋\n\nSaya tertarik dengan kategori ${g.label}. Kapan desainnya tersedia? Terima kasih 🙏`,
                    )}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 mt-5 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition"
                  >
                    <WaIcon className="w-4 h-4" /> Tanya via WhatsApp
                  </a>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      <Cta hideCollection />
      <Footer />
      <WaFloat />
    </>
  );
}
