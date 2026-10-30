import { useState } from "react";

/** Mockup ponsel mungil. */
function Phone({ className = "", children }) {
  return (
    <div
      className={`w-[6.4rem] sm:w-[6.8rem] shrink-0 rounded-[1.3rem] p-1 bg-n7 border border-sk-300/30 shadow-xl transition duration-500 ${className}`}
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-[1rem] bg-gradient-to-b from-n8 to-n9">
        {children}
      </div>
    </div>
  );
}

/** Screenshot undangan memenuhi layar ponsel. */
const Shot = ({ src }) => (
  <img
    src={src}
    alt=""
    loading="lazy"
    className="absolute inset-0 w-full h-full object-cover object-top"
  />
);

/** Kartu katalog transparan: dua ponsel (cover + halaman dalam), judul, harga, tombol. */
export default function CatalogCard({ design: x, title, price, orderHref, index, anim }) {
  const [imgOk, setImgOk] = useState(true);
  const shots = x.shots?.length >= 2 ? x.shots : null;
  const [a, b] = x.n.split(" & ");
  const [day, ...rest] = x.d.split(" ");
  const photo = (src, pos) =>
    src &&
    imgOk && (
      <>
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setImgOk(false)}
          style={{ objectPosition: pos }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-n9/70 via-n9/45 to-n9/85" />
      </>
    );

  return (
    <div
      data-aos={anim}
      data-aos-delay={index * 120}
      className="group w-full rounded-3xl border border-sk-300/25 bg-white/[0.04] backdrop-blur-sm px-5 py-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:border-sk-300/50 transition"
    >
      {/* dua ponsel: cover & halaman dalam */}
      <div className="flex justify-center items-start">
        <Phone className="-translate-y-1.5 group-hover:scale-105">
          {shots ? <Shot src={shots[0]} /> : photo(x.img, "center")}
          {!shots && (
          <div className="absolute inset-0 grid place-items-center text-center px-1">
            <div>
              <p className="tracking-[.2em] text-[4px] text-sk-300">
                THE WEDDING OF
              </p>
              <p className="font-script text-[1.45rem] text-white leading-[1.05] my-1">
                {a}
                <br />
                <span className="text-base text-sk-300">&amp;</span>
                <br />
                {b}
              </p>
              <p className="text-[5px] text-sk-300">Kepada Yth.</p>
              <p className="font-serif text-[9px] text-white">Tamu Spesial</p>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-sk-300 text-n9 text-[5px] font-medium">
                Buka Undangan
              </span>
            </div>
          </div>
          )}
        </Phone>
        <Phone className="-ml-4 mt-7 translate-y-1 group-hover:scale-105">
          {shots ? <Shot src={shots[1]} /> : photo(x.img, "75% 25%")}
          {!shots && (
          <div className="absolute inset-0 grid place-items-center text-center px-1">
            <div>
              <p className="tracking-[.2em] text-[4px] text-sk-300">
                SAVE THE DATE
              </p>
              <p className="font-serif text-3xl text-white leading-none mt-1">
                {day}
              </p>
              <p className="text-[7px] text-sk-200 mt-0.5">{rest.join(" ")}</p>
              <div className="mx-auto my-2 h-px w-8 bg-sk-300/50" />
              <p className="text-[5px] text-sk-300">Akad &amp; Resepsi</p>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full border border-sk-300/70 text-sk-200 text-[5px]">
                Lihat Lokasi
              </span>
            </div>
          </div>
          )}
        </Phone>
      </div>

      <h3 className="font-serif text-xl text-white mt-8">{title}</h3>
      {price && (
        <div className="mt-3">
          <p className="text-sm text-sk-300/70 line-through decoration-red-400">
            Rp {price.was}
          </p>
          <p className="font-serif text-2xl text-white leading-tight">
            Rp {price.now}
          </p>
        </div>
      )}
      <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <a
          href={`${x.url}?to=Tamu+Spesial`}
          target="_blank"
          rel="noopener"
          className="px-2 py-2.5 whitespace-nowrap rounded-full bg-sk-300 text-n9 font-medium hover:bg-white transition"
        >
          Live Preview
        </a>
        <a
          href={orderHref}
          target="_blank"
          rel="noopener"
          className="px-2 py-2.5 whitespace-nowrap rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition"
        >
          Pesan Sekarang
        </a>
      </div>
    </div>
  );
}
