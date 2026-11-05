# Setup Backend Saevitation (satu Google Apps Script)

**Satu script, satu Google Sheet, satu URL** untuk dua fitur:
- **Form testimoni** → https://saevitation.com/form-testimoni/ (tab `Testimoni`)
- **Dashboard admin koleksi & tema** → https://saevitation.com/super-admin-saevitation/ (tab `Koleksi`)

## A. Pasang dari awal
1. Buat Google Sheet baru, mis. **"Saevitation Data"**.
2. **Extensions → Apps Script**. Hapus isi default, tempel seluruh isi `Code.gs`, simpan.
   (Buka lewat Extensions dari dalam Sheet, bukan dari script.google.com.)
3. Pilih fungsi **`setup`** → **Run** → beri izin (Sheet & Drive). Jika muncul "Google hasn't verified this app":
   **Advanced → Go to … → Allow** (normal, script ini milik Anda).
   `setup` membuat tab `Testimoni` & `Koleksi` serta dua folder gambar di Drive.
4. **Project Settings (roda gigi) → Script Properties → Add script property**:
   | Property | Isi |
   | --- | --- |
   | `ADMIN_PASSWORD` | password kuat (min. 12 karakter) — **wajib** untuk dashboard |
   | `ADMIN_USER` | *(opsional)* username, default `admin` |
5. **Deploy → New deployment → ikon roda gigi → Web app** · Execute as: **Me** · Who has access: **Anyone** → **Deploy**.
   Salin **Web app URL** (berakhiran `/exec`).
6. Uji: buka `URL?action=list` → `{"ok":true,"items":[]}` dan `URL?action=approved` → `{"ok":true,"items":[]}`.

## B. Jika testimoni sudah berjalan (pakai script lama)
Tidak perlu Sheet/URL baru — data dan URL lama tetap:
1. Buka Apps Script dari Sheet testimoni Anda, **tempel `Code.gs` baru menggantikan yang lama**, simpan.
2. Jalankan **`setup`** (menambah tab `Koleksi`; tab `Testimoni` & isinya tidak disentuh; folder foto lama tetap dipakai).
3. Tambahkan Script Properties `ADMIN_PASSWORD` (langkah A.4).
4. **Deploy → Manage deployments → ikon pensil → Version: New version → Deploy.** URL tidak berubah.

## C. Hubungkan ke situs
- **GitHub Actions (disarankan):** repo → *Settings → Secrets and variables → Actions → Variables → New repository variable*
  `VITE_APPS_SCRIPT_URL` = URL `/exec`. Jalankan ulang workflow deploy.
  (Nama lama `VITE_KOLEKSI_API_URL` tetap didukung.)
- Atau tulis langsung di `src/config.js` pada `TESTIMONI_FORM.endpoint` dan `KOLEKSI_API.endpoint`.
- Lokal: salin `.env.example` → `.env`, isi `VITE_APPS_SCRIPT_URL`, jalankan `npm run dev`.

## Cara pakai
**Kategori tema:** menu **Kategori Tema** di dashboard → **Tambah Kategori** (nama, ID otomatis, deskripsi, harga opsional,
tampil/sembunyi). Kategori tersimpan di tab `Kategori` (dibuat otomatis) dan langsung tersedia di katalog, dropdown form tema,
dan form testimoni, tanpa mengubah kode. Kategori bawaan di `src/config.js` tetap ada dan hanya-baca di dashboard. Kategori yang
masih dipakai tema tidak bisa dihapus (cukup disembunyikan). Urutan di situs mengikuti urutan baris di tab `Kategori`.

**Testimoni:** klien mengisi form → baris baru berstatus `Pending` di tab `Testimoni`. Moderasi lewat **dashboard admin →
menu Testimoni**: filter Menunggu / Disetujui / Ditolak, tombol **Setujui**, **Tolak**, **Batalkan persetujuan**, dan **Hapus**
(lencana merah di menu = jumlah yang menunggu). Yang `Approved` tampil di beranda (5 terbaru) dan halaman `/testimoni/`.
Perubahan terlihat dalam ±5 menit (cache browser). Mengubah kolom **Status** langsung di Sheet tetap bisa. Testimoni tanpa
izin tampil tidak bisa disetujui. Foto di Drive tidak ikut terhapus saat testimoni dihapus.

**Dashboard admin:** masuk di `/super-admin-saevitation/` dengan `ADMIN_USER` & `ADMIN_PASSWORD`. Tambah / ubah / sembunyikan /
hapus **Koleksi Client** dan **Tema**, termasuk unggah foto (disimpan di Drive, akses: siapa pun dengan link). Hasilnya tampil di
katalog, generator link, dan angka hero tanpa build ulang (cache ±2 menit). Data bawaan di `src/config.js` (`D`) tetap tampil; untuk
mengubah nama/harga tema bawaan dari dashboard, tambahkan tema yang **sama persis** (kategori, link demo, dan nama contoh yang sama)
lalu isi "Nama tema": entri dari Sheet akan menggantikan entri bawaan di posisi yang sama. Kolom **Nama Tema** di tab `Koleksi` (khusus baris `tema`) menentukan judul kartu di katalog; kosong = otomatis "Kategori 01, 02, …". Bisa diisi lewat dashboard (field "Nama tema") atau langsung di Sheet.

Kolom **Tampil** / **Unggulan** / **Tanpa Teks** di tab `Koleksi` juga bisa diedit langsung (`Ya` / `Tidak`).
Centang **"Gambar cover sudah berisi tulisan (screenshot)"** di form koleksi jika cover yang diunggah screenshot undangan: teks
di kartu (nama, "Kepada Yth.", tombol) disembunyikan agar gambar terlihat utuh. Di data bawaan `config.js`, tambahkan `noText: true`.
Kolom `Tanpa Teks` ditambahkan otomatis ke tab `Koleksi` lama saat script baru dipakai (tidak perlu mengubah Sheet manual).

## Keamanan
- Dashboard: semua aksi tulis (simpan, hapus, unggah) wajib token hasil login (maks. 6 jam, disimpan di `sessionStorage`).
  **Keluar** mencabut token. Username & password hanya di Script Properties.
- 5× salah login → login dikunci 10 menit. Kunci ini **global** (Apps Script tidak melihat IP): penebak bisa mengunci Anda
  sementara; tunggu 10 menit.
- Ganti password: ubah `ADMIN_PASSWORD`, lalu jalankan fungsi **`logoutEverywhere`** untuk mengeluarkan semua sesi aktif.
- Alamat `/super-admin-saevitation/` dan `/form-testimoni/` tidak ditautkan dan diberi `noindex`, tetapi alamat tersembunyi
  bukan pengamanan. Dashboard dilindungi login; form testimoni terbuka untuk siapa pun yang tahu alamatnya (moderasi `Pending`
  mencegah tampil otomatis).

## Catatan & troubleshooting
- Menu Testimoni di dashboard menampilkan "belum aktif" → `Code.gs` terbaru belum di-deploy (versi baru).
- Setiap kali `Code.gs` diubah: **Deploy → Manage deployments → Edit → Version: New version → Deploy**.
- "Password admin belum diatur" → langkah A.4. "Tidak dapat terhubung ke server" → akses deployment harus **Anyone**, URL harus
  berakhiran `/exec`, dan situs sudah dibuild ulang setelah mengisi variable.
- "Script ini belum terhubung ke Google Sheet" → buka Apps Script lewat **Extensions → Apps Script** dari dalam Sheet.
- Foto tidak muncul → jalankan `setup` dan beri izin Drive.
- **Foto yang diunggah dari dashboard tidak masuk ke folder "Koleksi Saevitation (gambar)":**
  1. Tempel `Code.gs` terbaru, lalu **Deploy → Manage deployments → pensil → New version → Deploy** (tanpa ini kode lama yang jalan).
  2. Di editor pilih fungsi **`cekFolder`** → Run → buka *Execution log*. Di situ terlihat folder mana yang dipakai script (`AKTIF`),
     apakah ada beberapa folder bernama sama, dan akun yang menjalankan script. Foto selalu tersimpan di Drive **akun pemilik
     script** (Execute as: **Me**), bukan akun yang sedang membuka dashboard.
  3. Kalau folder yang Anda maksud berbeda dari yang `AKTIF`: Project Settings → Script Properties → ubah `KOLEKSI_FOLDER_ID`
     menjadi ID folder yang benar (bagian setelah `/folders/` pada URL folder Drive).
  Versi baru `Code.gs` otomatis memakai folder bernama sama yang sudah ada dan mengabaikan folder di Sampah. Foto lama yang
  terlanjur masuk folder lain tidak dipindah otomatis; pindahkan manual di Drive (link fotonya tetap berfungsi).

## D. Promo musiman (tanpa ubah kode)
Menu **Promo** di dashboard mengatur bar promo di atas situs, popup, dan harga promo di semua kategori katalog:
nama promo, judul, harga promo, harga normal (coret), serta waktu mulai & selesai (WIB). Centang/hilangkan
**Promo aktif** untuk menyalakan atau mematikan kapan saja. Setelah waktu selesai lewat, situs kembali normal otomatis.

- Data tersimpan di tab `Promo` (dibuat otomatis) pada Google Sheet.
- **Wajib tempel `Code.gs` terbaru lalu Deploy → Manage deployments → pensil → New version → Deploy** agar menu ini berfungsi.
- Selama promo belum pernah disimpan dari dashboard, situs memakai data cadangan `PROMO` di `src/config.js`.
  Setelah disimpan dari dashboard, dashboard yang berlaku.

## E. Harga per tema
Di form **Tambah/Edit Tema** ada kolom *Harga coret* dan *Harga* khusus tema itu. Jika diisi, kartu tema di katalog memakai harga
tersebut; jika kosong, ikut harga kategori. Selama promo berjalan (menu Promo), harga promo tetap menggantikan keduanya.
Prioritas: **promo > harga tema > harga kategori**. Dua kolom baru (`Harga Coret`, `Harga`) otomatis ditambahkan ke tab `Koleksi`
saat Code.gs terbaru di-deploy. Perlu **New version** deploy seperti biasa.
