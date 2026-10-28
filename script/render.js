/* Render kartu keunggulan, langkah, dan koleksi desain */
$("#feat").innerHTML = F.map(
  ([i, t, p], n) =>
    `<div data-aos="zoom-in-up" class="rounded-2xl border border-sk-300/20 bg-n9/60 p-6 hover:border-sk-300/60 hover:-translate-y-1 transition" data-aos-delay="${(n % 4) * 100}"><div class="text-3xl">${i}</div><h3 class="font-serif text-lg text-white mt-3">${t}</h3><p class="text-sm mt-2 leading-relaxed text-sk-300/90">${p}</p></div>`,
).join("");
$("#steps").innerHTML = STEPS.map(
  ([n, t, p], i) =>
    `<div data-aos="flip-up" class="rounded-3xl border border-sk-300/20 p-8" data-aos-delay="${i * 120}"><div class="mx-auto w-12 h-12 rounded-full bg-sk-300 text-n9 grid place-items-center font-serif text-xl font-bold">${n}</div><h3 class="font-serif text-xl text-white mt-4">${t}</h3><p class="text-sm mt-2 text-sk-300/90 leading-relaxed">${p}</p></div>`,
).join("");

/* koleksi desain */
const AN = matchMedia("(max-width:767px)").matches
  ? ["fade-up", "fade-up", "fade-up"]
  : ["fade-right", "zoom-in", "fade-left"];
$("#dz").innerHTML =
  D.map((x, i) => {
    const [a, b] = x.n.split(" & ");
    return `<div data-aos="${AN[i % 3]}" data-aos-delay="${i * 120}" class="group w-full max-w-[17rem]">
 <div class="rounded-[2.2rem] p-2 bg-n7 border border-sk-300/30 shadow-2xl transition duration-500 group-hover:-translate-y-2 group-hover:shadow-sk-400/20">
  <div class="relative aspect-[9/16] overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-n8 to-n9 border border-sk-300/20 grid place-items-center text-center px-4">
   ${x.img ? `<img src="${x.img}" alt="${esc(x.n)}" loading="lazy" onerror="this.remove()" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"><div class="absolute inset-0 bg-gradient-to-b from-n9/70 via-n9/40 to-n9/85"></div>` : ""}
   <div class="relative"><p class="tracking-[.3em] text-[9px] text-sk-300">THE WEDDING OF</p><p class="font-script text-5xl text-white my-2 leading-tight">${esc(a)}<br><span class="text-3xl text-sk-300">&amp;</span><br>${esc(b)}</p>
   <p class="text-[10px] text-sk-300 mt-5">Kepada Yth.</p><p class="font-serif text-lg text-white">Tamu Spesial</p><span class="inline-block mt-4 px-5 py-1.5 rounded-full bg-sk-300 text-n9 text-xs font-medium">Buka Undangan</span></div>
  </div></div>
 <p class="mt-5 text-[10px] tracking-[.3em] text-sk-300">${x.tag.toUpperCase()}</p><h3 class="font-serif text-xl text-white">${esc(x.n)}</h3><p class="text-xs text-sk-300/80">${x.d}</p>
 <div class="mt-4 flex justify-center gap-2 text-sm"><a href="${x.url}?to=Tamu+Spesial" target="_blank" rel="noopener" class="px-4 py-2 rounded-full bg-sk-300 text-n9 font-medium hover:bg-white transition">Lihat Demo</a><a href="#generator" data-u="${x.url}" class="pk px-4 py-2 rounded-full border border-sk-300/50 hover:bg-sk-300/10 transition">Buat Link</a></div></div>`;
  }).join("") +
  `<div data-aos="${AN[D.length % 3]}" data-aos-delay="${D.length * 120}" class="w-full max-w-[17rem] self-start"><div class="rounded-[2.2rem] p-2 border-2 border-dashed border-sk-300/40"><div class="aspect-[9/16] rounded-[1.8rem] grid place-items-center text-center px-6"><div><p class="font-script text-5xl text-sk-300">Desain Custom</p><p class="text-sm mt-4 text-sk-300/90 leading-relaxed">Punya konsep impian? Warna, tema, hingga animasi bisa disesuaikan dengan kisah Anda. Diskusikan dan pesan undangan digital custom Anda sekarang.</p><a href="${WA(C.msgCustom)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 mt-5 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition"><svg class="w-4 h-4" fill="currentColor" aria-hidden="true"><use href="#i-wa"/></svg>Diskusikan</a></div></div></div></div>`;
$("#pick").innerHTML = D.map(
  (x) =>
    `<button data-u="${x.url}" class="pk px-4 py-2 rounded-full border border-sk-300/40 hover:bg-sk-300 hover:text-n9 transition">${esc(x.n)}</button>`,
).join("");
