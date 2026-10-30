import { STEPS } from "../content";

export default function Steps() {
  return (
    <section id="cara" className="py-16 sm:py-20 px-5">
      <div className="max-w-5xl mx-auto text-center">
        <h2 data-aos="fade-up" className="font-script text-5xl text-white">
          Semudah 3 Langkah
        </h2>
        <div id="steps" className="mt-12 grid md:grid-cols-3 gap-6">
          {STEPS.map(([n, title, text], i) => (
            <div
              key={n}
              data-aos="flip-up"
              data-aos-delay={i * 120}
              className="rounded-3xl border border-sk-300/20 p-8"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-sk-300 text-n9 grid place-items-center font-serif text-xl font-bold">
                {n}
              </div>
              <h3 className="font-serif text-xl text-white mt-4">{title}</h3>
              <p className="text-sm mt-2 text-sk-300/90 leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
