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
| Nomor WA admin, pesan otomatis | `src/config.js` (`C`) |
| Kategori & pricelist katalog | `src/config.js` (`CATS`) |
| Desain tema di katalog (`/katalog/`) | `src/config.js` (`D`) — isi `cat` (kategori tema) |
| Koleksi client (nama & tanggal nikah) | `src/config.js` (`D`) — isi `client: true` (tanpa `cat`); otomatis jadi pilihan di generator link. `featured: true` = tampil juga di beranda |
| Template pesan WA per bahasa (ID/EN/AR) | `src/config.js` (`C.msgs`) |
| Daftar keunggulan & langkah | `src/content.js` |
| Warna & font | `tailwind.config.js` |
| Gaya kustom (animasi, glow) | `src/index.css` |

## Deploy ke GitHub Pages (GitHub Actions)

Situs ini berjalan di domain kustom `https://saevitation.com/`, jadi `base: "/"` di `vite.config.js` sudah benar.

1. Push seluruh isi folder ini ke branch `main`.
2. Di GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Di **Settings → Pages → Custom domain** isi `saevitation.com`, lalu centang **Enforce HTTPS** setelah DNS aktif.
4. Setiap push ke `main`, workflow `.github/workflows/deploy.yml` otomatis build dan deploy. Bisa juga dijalankan manual dari tab **Actions**.

Jika nanti dipindah ke sub-folder (`domain.com/nama-folder/`), ubah `base` menjadi `"/nama-folder/"`.
`npm run build` otomatis membuat `dist/404.html` dan `dist/katalog/index.html` agar alamat yang tidak ada menampilkan halaman 404 buatan sendiri dan `/katalog/` terbuka normal.

## Katalog: muat lebih banyak

Halaman `/katalog/` menampilkan 6 kartu per grup (kategori / koleksi client); tombol **Muat Lebih Banyak** menambah 6 kartu berikutnya. Ubah jumlahnya lewat konstanta `PAGE` di `src/pages/CatalogPage.jsx`. Gambar kartu dimuat malas (`loading="lazy"`).

## Terjemahan pesan di generator

Tab bahasa **English / العربية** di generator menerjemahkan pesan Indonesia (termasuk yang sudah Anda ubah) lewat [MyMemory](https://mymemory.translated.net/) — gratis, tanpa API key, kuota anonim ±5.000 karakter per hari per alamat IP.
Jika pesan Indonesia masih bawaan, dipakai template bawaan (`C.msgs` di `src/config.js`) tanpa memanggil layanan. `{nama}` dan `{link}` tidak ikut dikirim/diubah. Pesan hasil terjemahan yang Anda edit manual tidak akan ditimpa otomatis; gunakan tombol "Terjemahkan ulang".

## Domain lewat ENV (opsional)

Domain tempat undangan di-host dibaca dari `VITE_SITE_URL` saat build. Jika tidak diisi, default `https://saevitation.com`.

- **Lokal:** salin `.env.example` menjadi `.env`, lalu isi `VITE_SITE_URL=https://domain-anda.com`.
- **GitHub Actions:** di repo buka **Settings → Secrets and variables → Actions → Variables → New repository variable**, nama `VITE_SITE_URL`, isi domainnya. Workflow sudah meneruskannya saat `npm run build`. Jalankan ulang workflow setelah mengubah variable.

Nilai ini ditanam saat build (GitHub Pages hanya menyajikan file statis), dan bersifat publik, jadi pakai **Variables**, bukan Secrets.

## Struktur

```
src/
  main.jsx  App.jsx  index.css  config.js  content.js
  pages/        Home.jsx, CatalogPage.jsx, NotFound.jsx
  components/   Header, Hero, Catalog, DesignCard, Features, Steps,
                Generator, Cta, Footer, WaFloat, WaIcon
  utils/        wa.js, copy.js, storage.js
```
