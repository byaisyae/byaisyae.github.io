// Pasca-build:
//  1. Salin index.html → 404.html dan ke folder tiap halaman (status 200 saat dibuka langsung di GitHub Pages).
//  2. SEO: isi domain (__SITE__), title, description, canonical & og:url per halaman agar Google
//     langsung membaca metadata yang benar tanpa menunggu JavaScript.
//  3. Buat sitemap.xml + robots.txt dengan domain yang benar.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SITE = (process.env.VITE_SITE_URL || "https://saevitation.com").replace(
  /\/+$/,
  "",
);

// halaman publik (diindeks) — title/description sama dengan yang diatur di tiap halaman React
const PUBLIC = {
  "": { priority: "1.0" },
  katalog: {
    title:
      "Katalog Undangan Pernikahan Digital | Saevitation by Aisyae Digital Invitation",
    desc: "Lihat katalog tema undangan pernikahan digital Saevitation: Minimalist Elegant, Minimalist Aesthetic, Syar'i, dan koleksi undangan client.",
    priority: "0.9",
  },
  faq: {
    title: "F.A.Q — Pertanyaan Umum | Saevitation by Aisyae Digital Invitation",
    desc: "Pertanyaan yang sering diajukan seputar pemesanan undangan pernikahan digital Saevitation: proses, masa aktif, revisi, dan pembayaran.",
    priority: "0.6",
  },
  "add-on": {
    title:
      "Add On — Layanan Tambahan | Saevitation by Aisyae Digital Invitation",
    desc: "Layanan tambahan untuk undangan digital Saevitation: musik, video, galeri, RSVP, dan fitur lainnya.",
    priority: "0.6",
  },
  testimoni: {
    title: "Testimoni Client | Saevitation by Aisyae Digital Invitation",
    desc: "Testimoni client yang telah memakai undangan pernikahan digital Saevitation.",
    priority: "0.5",
  },
};
// halaman rahasia: jangan diindeks
const NOINDEX = ["form-testimoni", "super-admin-saevitation"];

const esc = (t) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const base = readFileSync("dist/index.html", "utf8").replaceAll(
  "__SITE__",
  SITE,
);

const write = (path, html) => {
  const dir = path.split("/").slice(0, -1).join("/");
  if (dir) mkdirSync(dir, { recursive: true });
  writeFileSync(path, html);
};

// beranda (domain sudah terisi)
write("dist/index.html", base);

// halaman publik
for (const [slug, m] of Object.entries(PUBLIC)) {
  if (!slug) continue;
  const url = `${SITE}/${slug}/`;
  let h = base
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${esc(m.desc)}$2`,
    )
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(
      /(<meta property="og:title" content=")[^"]*(")/,
      `$1${esc(m.title)}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${esc(m.desc)}$2`,
    );
  write(`dist/${slug}/index.html`, h);
}

// halaman rahasia → noindex, tanpa canonical
for (const p of NOINDEX) {
  const h = base
    .replace(
      /<meta name="robots"[^>]*>/,
      '<meta name="robots" content="noindex, nofollow" />',
    )
    .replace(/<link rel="canonical"[^>]*>\s*/, "");
  write(`dist/${p}/index.html`, h);
}

// 404 → noindex, tanpa canonical
write(
  "dist/404.html",
  base
    .replace(
      /<meta name="robots"[^>]*>/,
      '<meta name="robots" content="noindex" />',
    )
    .replace(/<link rel="canonical"[^>]*>\s*/, "")
    .replace(/<meta property="og:url"[^>]*>\s*/, ""),
);

// sitemap.xml + robots.txt
const today = new Date().toISOString().slice(0, 10);
const urls = Object.entries(PUBLIC)
  .map(
    ([slug, m]) =>
      `  <url>\n    <loc>${SITE}/${slug ? slug + "/" : ""}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${m.priority}</priority>\n  </url>`,
  )
  .join("\n");
write(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
write(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\n${NOINDEX.map((p) => `Disallow: /${p}/`).join("\n")}\n\nSitemap: ${SITE}/sitemap.xml\n`,
);

console.log(
  `✓ SEO & halaman statis dibuat untuk ${SITE} (sitemap, robots, 404, ${Object.keys(PUBLIC).length - 1 + NOINDEX.length} folder halaman)`,
);
