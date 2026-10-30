import { useState } from "react";

/** Satu kartu desain di koleksi (mockup ponsel + tombol demo / buat link). */
export default function DesignCard({ design: x, index, anim, onPick }) {
  const [imgOk, setImgOk] = useState(true);
  const [a, b] = x.n.split(" & ");

  return (
    <div
      data-aos={anim}
      data-aos-delay={index * 120}
      className="group w-full max-w-[17rem]"
    >
      <div className="rounded-[2.2rem] p-2 bg-n7 border border-sk-300/30 shadow-2xl transition duration-500 group-hover:-translate-y-2 group-hover:shadow-sk-400/20">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-n8 to-n9 border border-sk-300/20 grid place-items-center text-center px-4">
          {x.img && imgOk && (
            <>
              <img
                src={x.img}
                alt={x.n}
                loading="lazy"
                onError={() => setImgOk(false)}
                className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-n9/70 via-n9/40 to-n9/85" />
            </>
          )}
          <div className="relative">
            <p className="tracking-[.3em] text-[9px] text-sk-300">
              THE WEDDING OF
            </p>
            <p className="font-script text-5xl text-white my-2 leading-tight">
              {a}
              <br />
              <span className="text-3xl text-sk-300">&amp;</span>
              <br />
              {b}
            </p>
            <p className="text-[10px] text-sk-300 mt-5">Kepada Yth.</p>
            <p className="font-serif text-lg text-white">Tamu Spesial</p>
            <span className="inline-block mt-4 px-5 py-1.5 rounded-full bg-sk-300 text-n9 text-xs font-medium">
              Buka Undangan
            </span>
          </div>
        </div>
      </div>
      <p className="mt-5 text-[10px] tracking-[.3em] text-sk-300">
        {x.tag.toUpperCase()}
      </p>
      <h3 className="font-serif text-xl text-white">{x.n}</h3>
      <p className="text-xs text-sk-300/80">{x.d}</p>
      <div className="mt-4 flex justify-center gap-2 text-sm">
        <a
          href={`${x.url}?to=Tamu+Spesial`}
          target="_blank"
          rel="noopener"
          className="px-4 py-2 rounded-full bg-sk-300 text-n9 font-medium hover:bg-white transition"
        >
          Lihat Demo
        </a>
        <a
          href="#generator"
          onClick={() => onPick(x.url)}
          className="px-4 py-2 rounded-full border border-sk-300/50 hover:bg-sk-300/10 transition"
        >
          Buat Link
        </a>
      </div>
    </div>
  );
}
