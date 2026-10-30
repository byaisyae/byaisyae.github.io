// GitHub Pages menampilkan 404.html untuk alamat yang tidak ada.
// Salin index.html → 404.html agar aplikasi React yang menampilkan halaman 404-nya,
// dan → katalog/index.html agar /katalog/ tampil normal (status 200) saat dibuka langsung.
import { copyFileSync, mkdirSync } from "node:fs";

copyFileSync("dist/index.html", "dist/404.html");
mkdirSync("dist/katalog", { recursive: true });
copyFileSync("dist/index.html", "dist/katalog/index.html");
console.log("✓ dist/404.html dan dist/katalog/index.html dibuat");
