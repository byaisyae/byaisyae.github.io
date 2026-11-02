# Setup Form Testimoni (Google Sheet + Apps Script)

1. Buat Google Sheet baru, mis. **"Testimoni Saevitation"**.
2. Menu **Extensions → Apps Script**. Hapus isi default, tempel seluruh isi `Code.gs`, lalu simpan.
3. (Disarankan) Pilih fungsi **`setup`** di dropdown, klik **Run**, dan beri izin (Google meminta akses Sheet & Drive).
   Ini membuat sheet `Testimoni` (header + dropdown Status) dan folder foto di Drive Anda.
4. **Deploy → New deployment → ikon roda gigi → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik **Deploy**, lalu salin **Web app URL** (berakhiran `/exec`).
5. Tempel URL itu ke `src/config.js`:
   ```js
   export const TESTIMONI_FORM = { endpoint: "https://script.google.com/macros/s/XXXX/exec", ... };
   ```
6. `npm run build` lalu deploy situs. Form ada di **https://saevitation.com/form-testimoni/**.
7. Uji: isi form sendiri → cek baris baru di sheet dengan Status `Pending`.

Catatan:
- Setiap kali `Code.gs` diubah, buat **New version** di Manage deployments agar perubahan aktif.
- Moderasi: ubah kolom **Status** menjadi `Approved` / `Rejected`.
- Foto disimpan di folder Drive "Testimoni Saevitation (foto)" (akses: siapa pun dengan link).
- `GET <URL>?action=approved` mengembalikan JSON testimoni berstatus Approved (untuk dipasang di situs nanti).

Troubleshooting:
- `Sheet belum disiapkan` → pakai versi terbaru `Code.gs` (tab `Testimoni` dibuat otomatis), lalu **Deploy → Manage deployments → Edit → Version: New version → Deploy**.
- `Script ini belum terhubung ke Google Sheet` → Apps Script harus dibuka lewat **Extensions → Apps Script** dari dalam Sheet, bukan dari script.google.com.

Menampilkan di situs:
- Beranda otomatis menampilkan testimoni berstatus **Approved** (dan Izin Tampil = Ya) dari Sheet, terbaru dulu (maks. 12).
- Data di-cache 5 menit di browser, jadi perubahan Status bisa butuh beberapa menit untuk terlihat.
- Cek manual: buka `<Web app URL>?action=approved` di browser, hasilnya harus JSON berisi `items`.
