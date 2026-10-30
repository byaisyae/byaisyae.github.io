import { C } from "../config";

export default function Hero() {
  return (
    <section
      id="top"
      className="glow relative pt-28 sm:pt-32 pb-16 sm:pb-20 px-5 text-center"
    >
      <p
        data-aos="fade-up"
        className="tracking-[.3em] sm:tracking-[.4em] text-[11px] sm:text-xs text-sk-300"
      >
        AISYAE DIGITAL INVITATION
      </p>
      <h1
        data-aos="fade-up"
        data-aos-delay="100"
        className="font-serif text-4xl sm:text-6xl text-white mt-5 leading-tight max-w-3xl mx-auto"
      >
        Satu Link untuk{" "}
        <span className="font-script text-5xl sm:text-7xl text-sk-300">
          Seribu Kebahagiaan
        </span>
      </h1>
      <p
        data-aos="fade-up"
        data-aos-delay="200"
        className="mt-6 max-w-2xl mx-auto text-sk-300/90 leading-relaxed"
      >
        Hari paling istimewa dalam hidup Anda layak dibuka dengan undangan yang
        berkesan. Elegan, personal untuk setiap tamu, dan siap dibagikan lewat
        WhatsApp hanya dalam hitungan detik.
      </p>
      <div
        data-aos="fade-up"
        data-aos-delay="300"
        className="mt-9 flex flex-col sm:flex-row sm:flex-wrap justify-center items-stretch sm:items-center gap-3 max-w-xs sm:max-w-none mx-auto"
      >
        <a
          href="#generator"
          className="px-7 py-3 text-center rounded-full bg-sk-300 text-n9 font-semibold hover:bg-white sm:hover:scale-105 transition"
        >
          Buat Link Tamu Sekarang
        </a>
        <a
          href={C.demo}
          target="_blank"
          rel="noopener"
          className="px-7 py-3 text-center rounded-full border border-sk-300/50 hover:bg-sk-300/10 transition"
        >
          Lihat Contoh Undangan
        </a>
      </div>
    </section>
  );
}
