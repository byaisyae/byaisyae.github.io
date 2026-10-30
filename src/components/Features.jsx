import { F } from "../content";

export default function Features() {
  return (
    <section id="fitur" className="py-16 sm:py-20 px-5 bg-n8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 data-aos="fade-up" className="font-script text-5xl text-white">
          Mengapa Undangan Digital?
        </h2>
        <p data-aos="fade-up" className="mt-3 text-sk-300/90 max-w-2xl mx-auto">
          Lebih cepat, lebih hemat, dan jauh lebih berkesan. Semua yang
          dibutuhkan tamu ada dalam satu halaman.
        </p>
        <div
          id="feat"
          className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left"
        >
          {F.map(([icon, title, text], n) => (
            <div
              key={title}
              data-aos="zoom-in-up"
              data-aos-delay={(n % 4) * 100}
              className="rounded-2xl border border-sk-300/20 bg-n9/60 p-6 hover:border-sk-300/60 hover:-translate-y-1 transition"
            >
              <div className="text-3xl">{icon}</div>
              <h3 className="font-serif text-lg text-white mt-3">{title}</h3>
              <p className="text-sm mt-2 leading-relaxed text-sk-300/90">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
