import { useEffect, useMemo, useState } from "react";
import AOS from "aos";
import { CLIENT } from "../config";
import { designKey, useCats, useDesigns } from "../utils/useDesigns";
import { AN } from "../utils/anim";
import { WA, orderDesign } from "../utils/wa";
import Header from "../components/Header";
import CatalogCard from "../components/CatalogCard";
import Cta from "../components/Cta";
import Footer from "../components/Footer";
import WaFloat from "../components/WaFloat";
import WaIcon from "../components/WaIcon";

// jumlah kartu yang tampil per grup; tombol "Muat Lebih Banyak" menambah sebanyak ini
const PAGE = 6;

// kategori dari alamat (?kategori=...); divalidasi setelah daftar kategori dimuat
const initialCat = () => new URLSearchParams(location.search).get("kategori") || "semua";

export default function CatalogPage() {
  const D = useDesigns();
  const CATS = useCats(); // bawaan di kode + dari dashboard admin
  const [catRaw, setCat] = useState(initialCat);
  const cat = [...CATS, CLIENT].some((c) => c.id === catRaw) ? catRaw : "semua";
  const [visible, setVisible] = useState({}); // id grup → jumlah kartu yang ditampilkan
  const countOf = (id) => visible[id] ?? PAGE;
  const loadMore = (id) =>
    setVisible((v) => ({ ...v, [id]: (v[id] ?? PAGE) + PAGE }));

  useEffect(() => {
    document.title = "Katalog Undangan Pernikahan Digital | Aisyae Digital Invitation";
  }, []);

  // grup tema per kategori + grup koleksi client (desain dengan client: true)
  const groups = useMemo(
    () => [
      ...CATS.map((c) => ({
        ...c,
        items: D.filter((x) => !x.client && x.cat === c.id),
      })),
      { ...CLIENT, items: D.filter((x) => x.client) },
    ],
    [D, CATS],
  );

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
  }, [cat, visible]);

  const pills = [
    {
      id: "semua",
      label: "Semua",
      n: groups.reduce((t, g) => t + g.items.length, 0),
    },
    ...groups.map((g) => ({ id: g.id, label: g.short || g.label, n: g.items.length })),
  ];

  return (
    <>
      <Header />
      <section className="glow pt-[calc(7rem+var(--bar))] sm:pt-[calc(8rem+var(--bar))] pb-8 px-5 text-center">
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
                {g.features && (
                  <>
                    <ul className="mt-5 inline-grid gap-2 text-left text-sm sm:text-base text-white">
                      {g.features.items.map((f) => (
                        <li key={f} className="flex items-center gap-2.5">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-4 h-4 shrink-0 text-sk-300"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {g.features.note && (
                      <p className="mt-2 text-xs text-sk-300/70">
                        {g.features.note}
                      </p>
                    )}
                  </>
                )}
              </div>

              {g.items.length ? (
                <>
                <div className="mt-10 flex flex-wrap justify-center gap-6">
                  {g.items.slice(0, countOf(g.id)).map((x, i) => {
                    const title =
                      x.title ||
                      (x.client
                        ? x.tag
                        : `${g.label} ${String(i + 1).padStart(2, "0")}`);
                    // pesan WA untuk koleksi client menyebut undangan contoh yang dimaksud
                    const orderTitle = x.client
                      ? `${x.tag} (seperti undangan ${x.n})`
                      : title;
                    return (
                      <div
                        key={designKey(x)}
                        className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                      >
                        <CatalogCard
                          design={x}
                          title={title}
                          index={i % PAGE}
                          anim={AN[i % 3]}
                          price={g.price}
                          orderHref={orderDesign(orderTitle, x, g)}
                        />
                      </div>
                    );
                  })}
                </div>
                {g.items.length > countOf(g.id) && (
                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => loadMore(g.id)}
                      className="px-8 py-3 rounded-full border border-sk-300/50 text-white hover:bg-sk-300 hover:text-n9 transition"
                    >
                      Muat Lebih Banyak{" "}
                      <span className="text-sk-300/70">
                        ({g.items.length - countOf(g.id)} lagi)
                      </span>
                    </button>
                  </div>
                )}
                </>
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
