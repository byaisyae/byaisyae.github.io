// GitHub Pages menampilkan 404.html untuk alamat yang tidak ada.
// Salin index.html → 404.html agar aplikasi React yang menampilkan halaman 404-nya,
// dan ke folder tiap halaman (katalog, faq, add-on) agar dibuka normal (status 200) saat diakses langsung.
import { copyFileSync, mkdirSync } from "node:fs";

const PAGES = ["katalog", "faq", "add-on"];

copyFileSync("dist/index.html", "dist/404.html");
for (const p of PAGES) {
  mkdirSync(`dist/${p}`, { recursive: true });
  copyFileSync("dist/index.html", `dist/${p}/index.html`);
}
console.log(`✓ dist/404.html dan ${PAGES.map((p) => `dist/${p}/index.html`).join(", ")} dibuat`);
