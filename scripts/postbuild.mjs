// GitHub Pages menampilkan 404.html untuk alamat yang tidak ada.
// Salin index.html → 404.html agar aplikasi React yang menampilkan halaman 404-nya.
import { copyFileSync } from "node:fs";

copyFileSync("dist/index.html", "dist/404.html");
console.log("✓ dist/404.html dibuat dari dist/index.html");
