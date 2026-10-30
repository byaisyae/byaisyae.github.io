# Aisyae Digital Invitation — React + Vite

Konversi dari situs HTML/JS statis ke **React 18 + Vite 5 + Tailwind CSS 3** (kelas Tailwind, warna, dan font sama persis dengan versi sebelumnya).

## Menjalankan

```bash
npm install
npm run dev       # pengembangan  → http://localhost:5173
npm run build     # produksi      → folder dist/ (+ dist/404.html otomatis)
npm run preview   # cek hasil build
```

## Mengubah konten

| Yang diubah | File |
| --- | --- |
| Nomor WA admin, pesan otomatis, daftar desain (`D`) | `src/config.js` |
| Daftar keunggulan & langkah | `src/content.js` |
| Warna & font | `tailwind.config.js` |
| Gaya kustom (animasi, glow) | `src/index.css` |

## Deploy ke GitHub Pages (GitHub Actions)

Situs ini untuk `https://byaisyae.github.io/` (repo bernama `byaisyae.github.io`), jadi `base: "/"` di `vite.config.js` sudah benar.

1. Push seluruh isi folder ini ke branch `main` repo `byaisyae.github.io`.
2. Di GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Setiap push ke `main`, workflow `.github/workflows/deploy.yml` otomatis build dan deploy. Bisa juga dijalankan manual dari tab **Actions**.

Jika nanti dipindah ke repo biasa (`username.github.io/nama-repo/`), ubah `base` menjadi `"/nama-repo/"`.
`npm run build` otomatis membuat `dist/404.html` agar alamat yang tidak ada menampilkan halaman 404 buatan sendiri.

## Struktur

```
src/
  main.jsx  App.jsx  index.css  config.js  content.js
  pages/        Home.jsx, NotFound.jsx
  components/   Header, Hero, Catalog, DesignCard, Features, Steps,
                Generator, Cta, Footer, WaFloat, WaIcon
  utils/        wa.js, copy.js, storage.js
```
