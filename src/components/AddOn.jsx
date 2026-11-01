import { ADDONS } from "../content";
import AccordionItem from "./Accordion";

export default function AddOn() {
  return (
    <section id="addon" className="py-16 sm:py-20 px-5 bg-n8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <p data-aos="fade-up" className="tracking-[.4em] text-xs text-sk-300">
            ADD ON
          </p>
          <h2
            data-aos="fade-up"
            data-aos-delay="100"
            className="font-script text-5xl sm:text-6xl text-white mt-3"
          >
            Layanan Tambahan
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mt-4 text-sk-300/90"
          >
            Butuh lebih cepat atau tampilan yang lebih personal? Pilih tambahan
            sesuai kebutuhan Anda.
          </p>
        </div>
        <div className="mt-10 space-y-3">
          {ADDONS.map((g, i) => (
            <AccordionItem key={g.title} title={g.title} defaultOpen delay={i * 80}>
              <ul>
                {g.items.map((it) => (
                  <li
                    key={it.name}
                    className="flex items-baseline justify-between gap-4 border-t border-sk-300/10 py-2.5 first:border-t-0"
                  >
                    <span>{it.name}</span>
                    <span className="shrink-0 font-medium text-sk-300">
                      +Rp {it.price}
                    </span>
                  </li>
                ))}
              </ul>
              {g.note && (
                <p className="mt-2 text-xs text-sk-300/70">*{g.note}</p>
              )}
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
}
