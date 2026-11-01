import { FAQ } from "../content";
import AccordionItem from "./Accordion";

export default function Faq() {
  return (
    <section id="faq" className="py-16 sm:py-20 px-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <p data-aos="fade-up" className="tracking-[.4em] text-xs text-sk-300">
            F.A.Q
          </p>
          <h2
            data-aos="fade-up"
            data-aos-delay="100"
            className="font-script text-5xl sm:text-6xl text-white mt-3"
          >
            Pertanyaan Umum
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQ.map((f, i) => (
            <AccordionItem key={f.q} title={f.q} delay={(i % 4) * 60}>
              {Array.isArray(f.a) ? (
                <ul className="list-disc space-y-1.5 pl-4 marker:text-sk-300">
                  {f.a.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : (
                <p>{f.a}</p>
              )}
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
}
