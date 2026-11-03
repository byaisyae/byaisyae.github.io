/**
 * Backend Saevitation — SATU script untuk semuanya (Google Apps Script, terikat ke Google Sheet):
 *   1. Form testimoni     → tab "Testimoni" (kiriman publik, status Pending → Approved)
 *   2. Dashboard admin    → tab "Koleksi"   (koleksi client & tema; wajib login)
 * Cara pasang: lihat SETUP.md di folder ini.
 *
 * Satu URL Web App dipakai bersama. Perutean:
 *   POST tanpa "action"          → kirim testimoni (kompatibel dengan form yang sudah ada)
 *   POST action login / adminList / save / remove / upload / logout / verify → dashboard admin
 *   POST action testiList / testiStatus / testiRemove → moderasi testimoni (wajib login admin)
 *   POST action catSave / catRemove → kategori tema (wajib login admin; daftar ikut di adminList)
 *   POST action promoSave        → pengaturan promo (wajib login admin; datanya ikut di adminList)
 *   GET  ?action=approved        → testimoni yang disetujui (publik)
 *   GET  ?action=list            → koleksi yang Tampil = Ya + kategori tema yang Tampil = Ya + promo (publik)
 *
 * Keamanan dashboard: username & password di Script Properties (ADMIN_USER, ADMIN_PASSWORD), aksi tulis
 * wajib token hasil login, 5x salah login → dikunci 10 menit (global, Apps Script tidak melihat IP).
 */

/* ============ Pengaturan ============ */
const TESTI_SHEET = "Testimoni";
const TESTI_FOLDER = "Testimoni Saevitation (foto)";
const TESTI_HEADERS = [
  "Waktu", "ID", "Nama", "Tema", "Komentar", "Rating",
  "Link Undangan", "Foto", "Izin Tampil", "Status",
];
const TESTI_MAX_PHOTO = 2 * 1024 * 1024; // batas foto testimoni setelah didekode

const KOLEKSI_SHEET = "Koleksi";
const KOLEKSI_FOLDER = "Koleksi Saevitation (gambar)";
const KOLEKSI_HEADERS = [
  "ID", "Jenis", "Nama", "Tanggal", "Tag", "Kategori", "URL",
  "Foto Cover", "Foto 1", "Foto 2", "Unggulan", "Tampil", "Dibuat", "Diubah", "Tanpa Teks",
  "Harga Coret", "Harga",
];
const KAT_SHEET = "Kategori";
const KAT_HEADERS = ["ID", "Nama", "Deskripsi", "Harga Coret", "Harga", "Tampil", "Dibuat", "Diubah"];
const PROMO_SHEET = "Promo";
const PROMO_HEADERS = ["Aktif", "ID", "Label", "Judul", "Harga Promo", "Harga Normal", "Mulai", "Selesai", "Diubah"];
const TOKEN_TTL = 6 * 60 * 60; // detik (batas maksimum CacheService)
const MAX_FAILS = 5;
const LOCK_SECONDS = 10 * 60;
const MAX_IMG_BYTES = 3 * 1024 * 1024; // batas gambar koleksi setelah didekode
const OK_MIME = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/* ============ Penyiapan ============ */

/** Jalankan sekali dari editor: menyiapkan kedua tab & kedua folder, sekaligus meminta izin akses. */
function setup() {
  testiSheet_();
  testiFolder_();
  koleksiSheet_();
  koleksiFolder_();
  katSheet_();
  promoSheet_();
  if (!PropertiesService.getScriptProperties().getProperty("ADMIN_PASSWORD")) {
    Logger.log("PERINGATAN: ADMIN_PASSWORD belum diatur. Project Settings → Script Properties → tambahkan ADMIN_PASSWORD (dan opsional ADMIN_USER).");
  }
  Logger.log("Setup selesai. Lanjut: Deploy > New deployment > Web app.");
}

function spreadsheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Script ini belum terhubung ke Google Sheet. Buka Apps Script dari menu Extensions di dalam Sheet.");
  return ss;
}

/** Tab "Testimoni"; dibuat otomatis (header + dropdown Status) bila belum ada. */
function testiSheet_() {
  const ss = spreadsheet_();
  let sh = ss.getSheetByName(TESTI_SHEET);
  if (!sh) {
    sh = ss.insertSheet(TESTI_SHEET);
    sh.getRange(1, 1, 1, TESTI_HEADERS.length).setValues([TESTI_HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange(2, TESTI_HEADERS.length, 999, 1).setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(["Pending", "Approved", "Rejected"], true)
        .build(),
    );
  }
  return sh;
}

/** Tab "Koleksi"; dibuat otomatis (header + dropdown) bila belum ada. Sheet lama otomatis ditambah kolom baru. */
function koleksiSheet_() {
  const ss = spreadsheet_();
  let sh = ss.getSheetByName(KOLEKSI_SHEET);
  const yesNo = () => SpreadsheetApp.newDataValidation().requireValueInList(["Ya", "Tidak"], true).build();
  if (!sh) {
    sh = ss.insertSheet(KOLEKSI_SHEET);
    sh.getRange(1, 1, 1, KOLEKSI_HEADERS.length).setValues([KOLEKSI_HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange(2, 1, 999, KOLEKSI_HEADERS.length).setNumberFormat("@"); // semua kolom berupa teks
    sh.getRange(2, 2, 999, 1).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(["client", "tema"], true).build(),
    );
    sh.getRange(2, 11, 999, 2).setDataValidation(yesNo());
    sh.getRange(2, 15, 999, 1).setDataValidation(yesNo());
  } else {
    // migrasi sheet lama: tambah kolom baru (kolom 15 "Tanpa Teks", 16-17 harga per tema) bila belum ada
    const n = KOLEKSI_HEADERS.length;
    if (sh.getMaxColumns() < n) sh.insertColumnsAfter(sh.getMaxColumns(), n - sh.getMaxColumns());
    for (let c = 15; c <= n; c++) {
      if (str_(sh.getRange(1, c).getValue())) continue;
      sh.getRange(1, c).setValue(KOLEKSI_HEADERS[c - 1]).setFontWeight("bold");
      const col = sh.getRange(2, c, 999, 1).setNumberFormat("@");
      if (c === 15) col.setDataValidation(yesNo());
    }
  }
  return sh;
}

/** Tab "Kategori" (kategori tema katalog); dibuat otomatis bila belum ada. */
function katSheet_() {
  const ss = spreadsheet_();
  let sh = ss.getSheetByName(KAT_SHEET);
  if (!sh) {
    sh = ss.insertSheet(KAT_SHEET);
    sh.getRange(1, 1, 1, KAT_HEADERS.length).setValues([KAT_HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange(2, 1, 999, KAT_HEADERS.length).setNumberFormat("@");
    sh.getRange(2, 6, 999, 1).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(["Ya", "Tidak"], true).build(),
    );
  }
  return sh;
}

/** Tab "Promo" (satu baris pengaturan promo); dibuat otomatis bila belum ada. */
function promoSheet_() {
  const ss = spreadsheet_();
  let sh = ss.getSheetByName(PROMO_SHEET);
  if (!sh) {
    sh = ss.insertSheet(PROMO_SHEET);
    sh.getRange(1, 1, 1, PROMO_HEADERS.length).setValues([PROMO_HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange(2, 1, 2, PROMO_HEADERS.length).setNumberFormat("@");
    sh.getRange(2, 1, 1, 1).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(["Ya", "Tidak"], true).build(),
    );
  }
  return sh;
}

/**
 * Folder gambar di Drive. Urutan pencarian:
 *  1) ID tersimpan di Script Properties (propKey), selama folder itu ada DAN tidak di Sampah;
 *  2) folder bernama `name` yang sudah ada di Drive akun pemilik script (bukan yang di Sampah);
 *  3) baru buat folder baru.
 * Folder yang ditemukan lewat nama otomatis disimpan ke Script Properties agar seterusnya konsisten.
 * Sebelumnya hanya langkah 1 + 3: folder buatan manual / folder yang terhapus ke Sampah tidak pernah dipakai,
 * sehingga foto masuk ke folder lain.
 */
function folder_(propKey, name) {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty(propKey);
  if (saved) {
    try {
      const f = DriveApp.getFolderById(saved);
      if (!f.isTrashed()) return f;
    } catch (_) { /* ID salah / tidak bisa diakses → cari berdasarkan nama */ }
  }
  const it = DriveApp.getFoldersByName(name);
  while (it.hasNext()) {
    const f = it.next();
    if (!f.isTrashed()) {
      props.setProperty(propKey, f.getId());
      return f;
    }
  }
  const f = DriveApp.createFolder(name);
  props.setProperty(propKey, f.getId());
  return f;
}
// FOLDER_ID dipertahankan untuk testimoni agar script testimoni lama tetap memakai folder yang sama
function testiFolder_() { return folder_("FOLDER_ID", TESTI_FOLDER); }
function koleksiFolder_() { return folder_("KOLEKSI_FOLDER_ID", KOLEKSI_FOLDER); }

/**
 * Diagnosa folder gambar: jalankan dari editor (pilih `cekFolder` → Run), lalu buka View → Logs / Execution log.
 * Menampilkan folder yang sedang dipakai script, semua folder dengan nama sama, dan akun pemilik script.
 */
function cekFolder() {
  Logger.log("Script berjalan sebagai: " + Session.getEffectiveUser().getEmail());
  [["KOLEKSI_FOLDER_ID", KOLEKSI_FOLDER], ["FOLDER_ID", TESTI_FOLDER]].forEach(function (x) {
    const active = folder_(x[0], x[1]);
    Logger.log("== " + x[1] + " ==");
    Logger.log("DIPAKAI SCRIPT → " + active.getUrl() + " (id: " + active.getId() + ")");
    const it = DriveApp.getFoldersByName(x[1]);
    while (it.hasNext()) {
      const f = it.next();
      let n = 0;
      const fi = f.getFiles();
      while (fi.hasNext()) { fi.next(); n++; }
      Logger.log("  folder bernama sama: " + f.getUrl() + " | file: " + n + " | sampah: " + f.isTrashed() + (f.getId() === active.getId() ? " | ← AKTIF" : ""));
    }
  });
}

/* ============ Util bersama ============ */

const json_ = (o) =>
  ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);

const tz_ = () => Session.getScriptTimeZone();

const errMsg_ = (err) => String(err && err.message ? err.message : err);

function str_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, tz_(), "yyyy-MM-dd");
  return String(v == null ? "" : v).trim();
}

/** Perbandingan string yang tidak berhenti di karakter pertama yang beda. */
function eq_(a, b) {
  a = String(a);
  b = String(b);
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function hash_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s)
    .map((b) => ("0" + (b & 255).toString(16)).slice(-2))
    .join("");
}

function locked_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/* ============ 1. Testimoni (publik) ============ */

// cegah formula injection: sel yang diawali = + - @ dianggap teks
const safe_ = (v) => {
  v = String(v == null ? "" : v).trim();
  return /^[=+\-@]/.test(v) ? "'" + v : v;
};

function testimoniSubmit_(d) {
  try {
    return locked_(() => {
      if (d.website) return { ok: true }; // honeypot: bot mengisi kolom tersembunyi

      const name = String(d.name || "").trim();
      const comment = String(d.comment || "").trim();
      const theme = String(d.theme || "").trim();
      const id = String(d.id || "").trim().slice(0, 64);
      if (!name || !comment || !theme || !id) throw new Error("Data belum lengkap.");
      if (name.length > 80 || comment.length > 600 || theme.length > 80)
        throw new Error("Teks terlalu panjang.");
      if (d.consent !== true) throw new Error("Izin tampil belum disetujui.");
      const rating = Math.min(5, Math.max(0, parseInt(d.rating, 10) || 0));
      let url = String(d.url || "").trim().slice(0, 300);
      if (url && !/^https?:\/\//i.test(url)) url = "";

      const sh = testiSheet_();

      // kiriman ulang dengan ID sama (mis. klik dua kali) tidak dicatat dua kali
      const last = sh.getLastRow();
      if (last > 1) {
        const ids = sh.getRange(2, 2, last - 1, 1).getValues().flat();
        if (ids.indexOf(id) !== -1) return { ok: true, duplicate: true };
      }

      let photoUrl = "";
      if (d.photo && d.photo.data) {
        const ext = OK_MIME[d.photo.mime];
        if (!ext) throw new Error("Format foto tidak didukung.");
        const bytes = Utilities.base64Decode(d.photo.data);
        if (bytes.length > TESTI_MAX_PHOTO) throw new Error("Ukuran foto terlalu besar.");
        const blob = Utilities.newBlob(bytes, d.photo.mime, id + "." + ext);
        const file = testiFolder_().createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        photoUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w400";
      }

      sh.appendRow([
        new Date(), id, safe_(name), safe_(theme), safe_(comment),
        rating || "", url, photoUrl, "Ya", "Pending",
      ]);
      return { ok: true };
    });
  } catch (err) {
    return { ok: false, error: errMsg_(err) };
  }
}

/** GET ?action=approved → testimoni berstatus Approved & Izin Tampil = Ya. */
function testimoniApproved_() {
  const sh = spreadsheet_().getSheetByName(TESTI_SHEET);
  if (!sh || sh.getLastRow() < 2) return { ok: true, items: [] };
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, TESTI_HEADERS.length).getValues();
  const items = rows
    .filter((r) => r[9] === "Approved" && r[8] === "Ya")
    .map((r) => ({
      name: r[2], theme: r[3], comment: r[4],
      rating: r[5] || undefined, url: r[6] || undefined, photo: r[7] || undefined,
    }));
  return { ok: true, items };
}

/* ============ 1b. Testimoni: moderasi (admin) ============ */

const TESTI_STATUS = ["Pending", "Approved", "Rejected"];

function testiRow2item_(r) {
  const t = r[0] instanceof Date ? Utilities.formatDate(r[0], tz_(), "yyyy-MM-dd HH:mm") : str_(r[0]);
  const st = str_(r[9]);
  return {
    id: str_(r[1]), time: t, name: str_(r[2]), theme: str_(r[3]), comment: str_(r[4]),
    rating: Number(r[5]) || 0, url: str_(r[6]), photo: str_(r[7]),
    consent: str_(r[8]) === "Ya",
    status: TESTI_STATUS.indexOf(st) === -1 ? "Pending" : st,
  };
}

/** Semua kiriman testimoni (semua status) untuk dashboard. */
function testiAll_() {
  const sh = testiSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh
    .getRange(2, 1, last - 1, TESTI_HEADERS.length)
    .getValues()
    .map(testiRow2item_)
    .filter((it) => it.id);
}

function testiFindRow_(sh, id) {
  const last = sh.getLastRow();
  const ids = last > 1 ? sh.getRange(2, 2, last - 1, 1).getValues().map((r) => str_(r[0])) : [];
  const idx = ids.indexOf(String(id || ""));
  if (idx === -1) throw new Error("Testimoni tidak ditemukan (mungkin sudah dihapus).");
  return idx + 2;
}

/** Ubah status: Pending / Approved / Rejected. Approved hanya jika klien memberi izin tampil. */
function testiSetStatus_(id, status) {
  status = String(status || "");
  if (TESTI_STATUS.indexOf(status) === -1) throw new Error("Status tidak valid.");
  return locked_(() => {
    const sh = testiSheet_();
    const row = testiFindRow_(sh, id);
    const cur = testiRow2item_(sh.getRange(row, 1, 1, TESTI_HEADERS.length).getValues()[0]);
    if (status === "Approved" && !cur.consent)
      throw new Error("Klien belum memberi izin tampil, testimoni tidak bisa disetujui.");
    sh.getRange(row, 10).setValue(status);
    cur.status = status;
    return { ok: true, item: cur };
  });
}

function testiRemove_(id) {
  return locked_(() => {
    const sh = testiSheet_();
    sh.deleteRow(testiFindRow_(sh, id));
    return { ok: true };
  });
}

/* ============ 2. Dashboard admin: login & sesi ============ */

/** Kunci cache token. SESSION_EPOCH berubah → semua token lama otomatis tidak berlaku. */
function tokKey_(token) {
  const epoch = PropertiesService.getScriptProperties().getProperty("SESSION_EPOCH") || "0";
  return "t:" + epoch + ":" + hash_(token);
}

/** Jalankan dari editor untuk mengeluarkan SEMUA sesi admin sekaligus (mis. setelah ganti password). */
function logoutEverywhere() {
  PropertiesService.getScriptProperties().setProperty("SESSION_EPOCH", String(Date.now()));
  Logger.log("Semua sesi admin sudah dicabut.");
}

function login_(d) {
  const cache = CacheService.getScriptCache();
  if (Number(cache.get("fails") || 0) >= MAX_FAILS) {
    return { ok: false, error: "Terlalu banyak percobaan gagal. Coba lagi dalam beberapa menit." };
  }
  const props = PropertiesService.getScriptProperties();
  const pass = props.getProperty("ADMIN_PASSWORD");
  if (!pass) return { ok: false, error: "Password admin belum diatur di Script Properties (lihat SETUP.md)." };
  const user = props.getProperty("ADMIN_USER") || "admin";

  const okUser = eq_(String(d.user || "").trim().toLowerCase(), user.toLowerCase());
  const okPass = eq_(String(d.password || ""), pass);
  if (!(okUser && okPass)) {
    cache.put("fails", String(Number(cache.get("fails") || 0) + 1), LOCK_SECONDS);
    Utilities.sleep(1000); // perlambat tebakan beruntun
    return { ok: false, error: "Username atau password salah." };
  }
  cache.remove("fails");
  const token = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  cache.put(tokKey_(token), "1", TOKEN_TTL);
  return { ok: true, token, expires: Date.now() + TOKEN_TTL * 1000 };
}

function isAdmin_(token) {
  if (!token || typeof token !== "string" || token.length < 40) return false;
  return CacheService.getScriptCache().get(tokKey_(token)) === "1";
}

/* ============ 2. Dashboard admin: koleksi ============ */

function row2item_(r) {
  return {
    id: str_(r[0]), type: str_(r[1]), name: str_(r[2]), date: str_(r[3]),
    tag: str_(r[4]), cat: str_(r[5]), url: str_(r[6]),
    img: str_(r[7]), shot1: str_(r[8]), shot2: str_(r[9]),
    featured: str_(r[10]) === "Ya", visible: str_(r[11]) !== "Tidak",
    created: str_(r[12]), updated: str_(r[13]),
    noText: str_(r[14]) === "Ya",
    was: str_(r[15]), now: str_(r[16]),
  };
}

function koleksiAll_() {
  const sh = koleksiSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh
    .getRange(2, 1, last - 1, KOLEKSI_HEADERS.length)
    .getValues()
    .map(row2item_)
    .filter((it) => it.id && (it.type === "client" || it.type === "tema"));
}

function clean_(it) {
  it = it || {};
  const txt = (v, max, label, req) => {
    v = String(v == null ? "" : v).trim();
    if (req && !v) throw new Error(label + " wajib diisi.");
    if (v.length > max) throw new Error(label + " terlalu panjang.");
    if (/^[=+\-@]/.test(v)) throw new Error(label + " tidak boleh diawali = + - atau @.");
    return v;
  };
  const link = (v, label) => {
    v = String(v == null ? "" : v).trim();
    if (!v) return "";
    if (!/^https:\/\/\S+$/i.test(v) || v.length > 600) throw new Error(label + " harus berupa link https://");
    return v;
  };

  const type = String(it.type);
  if (type !== "client" && type !== "tema") throw new Error("Jenis tidak valid.");

  const out = {
    type,
    name: txt(it.name, 80, "Nama", true),
    date: String(it.date || "").trim(),
    tag: txt(it.tag, 60, "Tag", true),
    cat: "",
    url: link(it.url, "Link undangan"),
    img: link(it.img, "Foto cover"),
    shot1: link(it.shot1, "Screenshot 1"),
    shot2: link(it.shot2, "Screenshot 2"),
    featured: it.featured === true,
    visible: it.visible !== false,
    noText: it.noText === true,
    was: "",
    now: "",
  };
  if (!out.url) throw new Error("Link undangan wajib diisi.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(out.date) || isNaN(new Date(out.date).getTime()))
    throw new Error("Tanggal tidak valid.");

  if (type === "tema") {
    const cat = String(it.cat || "").trim();
    if (!/^[a-z0-9-]{1,40}$/.test(cat)) throw new Error("Kategori tidak valid.");
    out.cat = cat;
    out.featured = false;
    // harga khusus tema ini (opsional; kosong = ikut harga kategori)
    const price = (v, label) => {
      v = String(v == null ? "" : v).trim();
      if (v && !/^[0-9.,]{1,12}$/.test(v)) throw new Error(label + " hanya boleh angka, mis. 149.000");
      return v;
    };
    out.was = price(it.was, "Harga coret");
    out.now = price(it.now, "Harga");
    if (!!out.was !== !!out.now) throw new Error("Isi harga coret dan harga sekaligus, atau kosongkan keduanya.");
  }
  // screenshot berlaku untuk tema DAN client: dua-duanya terisi (kartu 2 ponsel tanpa tulisan) atau kosong
  if (!!out.shot1 !== !!out.shot2) throw new Error("Isi kedua screenshot atau kosongkan keduanya.");
  return out;
}

function koleksiSave_(raw) {
  const it = clean_(raw);
  return locked_(() => {
    const sh = koleksiSheet_();
    const now = Utilities.formatDate(new Date(), tz_(), "yyyy-MM-dd HH:mm");
    let row;
    let created = now;
    if (raw.id) {
      const last = sh.getLastRow();
      const ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map((r) => str_(r[0])) : [];
      const idx = ids.indexOf(String(raw.id));
      if (idx === -1) throw new Error("Data tidak ditemukan (mungkin sudah dihapus).");
      row = idx + 2;
      it.id = String(raw.id);
      created = str_(sh.getRange(row, 13).getValue()) || now;
    } else {
      it.id = Utilities.getUuid().replace(/-/g, "").slice(0, 8);
      row = Math.max(sh.getLastRow(), 1) + 1;
    }
    const range = sh.getRange(row, 1, 1, KOLEKSI_HEADERS.length);
    range.setNumberFormat("@");
    range.setValues([[
      it.id, it.type, it.name, it.date, it.tag, it.cat, it.url,
      it.img, it.shot1, it.shot2,
      it.featured ? "Ya" : "Tidak", it.visible ? "Ya" : "Tidak", created, now,
      it.noText ? "Ya" : "Tidak", it.was, it.now,
    ]]);
    it.created = created;
    it.updated = now;
    return { ok: true, item: it };
  });
}

function koleksiRemove_(id) {
  id = String(id || "");
  if (!id) throw new Error("ID kosong.");
  return locked_(() => {
    const sh = koleksiSheet_();
    const last = sh.getLastRow();
    const ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map((r) => str_(r[0])) : [];
    const idx = ids.indexOf(id);
    if (idx === -1) throw new Error("Data tidak ditemukan (mungkin sudah dihapus).");
    sh.deleteRow(idx + 2);
    return { ok: true };
  });
}

function koleksiUpload_(d) {
  const ext = OK_MIME[d.mime];
  if (!ext) throw new Error("Format gambar tidak didukung (JPG, PNG, atau WebP).");
  const bytes = Utilities.base64Decode(String(d.data || ""));
  if (!bytes.length || bytes.length > MAX_IMG_BYTES) throw new Error("Ukuran gambar harus di bawah 3 MB.");
  const id = Utilities.getUuid().replace(/-/g, "").slice(0, 10);
  const file = koleksiFolder_().createFile(Utilities.newBlob(bytes, d.mime, id + "." + ext));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { ok: true, url: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000", folder: koleksiFolder_().getUrl() };
}

/* ============ 2. Dashboard admin: kategori tema ============ */

function row2kat_(r) {
  return {
    id: str_(r[0]), label: str_(r[1]), desc: str_(r[2]),
    was: str_(r[3]), now: str_(r[4]), visible: str_(r[5]) !== "Tidak",
    created: str_(r[6]), updated: str_(r[7]),
  };
}

function katAll_() {
  const sh = katSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh
    .getRange(2, 1, last - 1, KAT_HEADERS.length)
    .getValues()
    .map(row2kat_)
    .filter((c) => c.id && c.label);
}

function cleanKat_(it) {
  it = it || {};
  const txt = (v, max, label, req) => {
    v = String(v == null ? "" : v).trim();
    if (req && !v) throw new Error(label + " wajib diisi.");
    if (v.length > max) throw new Error(label + " terlalu panjang.");
    if (/^[=+\-@]/.test(v)) throw new Error(label + " tidak boleh diawali = + - atau @.");
    return v;
  };
  const price = (v, label) => {
    v = String(v == null ? "" : v).trim();
    if (v && !/^[0-9.,]{1,12}$/.test(v)) throw new Error(label + " hanya boleh angka, mis. 149.000");
    return v;
  };
  const out = {
    id: String(it.id || "").trim(),
    label: txt(it.label, 60, "Nama kategori", true),
    desc: txt(it.desc, 200, "Deskripsi", false),
    was: price(it.was, "Harga coret"),
    now: price(it.now, "Harga"),
    visible: it.visible !== false,
  };
  if (!/^[a-z0-9-]{1,40}$/.test(out.id)) throw new Error("ID kategori hanya huruf kecil, angka, dan tanda -.");
  if (!!out.was !== !!out.now) throw new Error("Isi harga coret dan harga sekaligus, atau kosongkan keduanya.");
  return out;
}

function katSave_(raw) {
  const it = cleanKat_(raw);
  const isNew = !raw.isEdit;
  return locked_(() => {
    const sh = katSheet_();
    const all = katAll_();
    const now = Utilities.formatDate(new Date(), tz_(), "yyyy-MM-dd HH:mm");
    const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
    if (all.some((c) => c.id !== it.id && same(c.label, it.label)))
      throw new Error("Nama kategori sudah dipakai.");

    let row;
    let created = now;
    const ids = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map((r) => str_(r[0])) : [];
    const idx = ids.indexOf(it.id);
    if (isNew) {
      if (idx !== -1) throw new Error("ID kategori sudah dipakai.");
      row = Math.max(sh.getLastRow(), 1) + 1;
    } else {
      if (idx === -1) throw new Error("Kategori tidak ditemukan (mungkin sudah dihapus).");
      row = idx + 2;
      created = str_(sh.getRange(row, 7).getValue()) || now;
    }
    const range = sh.getRange(row, 1, 1, KAT_HEADERS.length);
    range.setNumberFormat("@");
    range.setValues([[it.id, it.label, it.desc, it.was, it.now, it.visible ? "Ya" : "Tidak", created, now]]);
    it.created = created;
    it.updated = now;
    return { ok: true, item: it };
  });
}

function katRemove_(id) {
  id = String(id || "");
  if (!id) throw new Error("ID kosong.");
  return locked_(() => {
    const used = koleksiAll_().filter((x) => x.type === "tema" && x.cat === id).length;
    if (used) throw new Error("Kategori masih dipakai " + used + " tema. Pindahkan atau hapus tema itu dulu, atau cukup sembunyikan kategorinya.");
    const sh = katSheet_();
    const last = sh.getLastRow();
    const ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map((r) => str_(r[0])) : [];
    const idx = ids.indexOf(id);
    if (idx === -1) throw new Error("Kategori tidak ditemukan (mungkin sudah dihapus).");
    sh.deleteRow(idx + 2);
    return { ok: true };
  });
}

/* ============ 2. Dashboard admin: promo ============ */

/** Pengaturan promo dari tab Promo, atau null bila belum pernah disimpan (situs memakai cadangan di config.js). */
function promoGet_() {
  const sh = spreadsheet_().getSheetByName(PROMO_SHEET);
  if (!sh || sh.getLastRow() < 2) return null;
  const r = sh.getRange(2, 1, 1, PROMO_HEADERS.length).getValues()[0];
  if (!str_(r[1])) return null;
  const dt = (v) => {
    if (v instanceof Date) return Utilities.formatDate(v, tz_(), "yyyy-MM-dd'T'HH:mm");
    return str_(v);
  };
  return {
    enabled: str_(r[0]) === "Ya", id: str_(r[1]), label: str_(r[2]), headline: str_(r[3]),
    price: str_(r[4]), normal: str_(r[5]), start: dt(r[6]), end: dt(r[7]), updated: str_(r[8]),
  };
}

function cleanPromo_(it) {
  it = it || {};
  const txt = (v, max, label, req) => {
    v = String(v == null ? "" : v).trim();
    if (req && !v) throw new Error(label + " wajib diisi.");
    if (v.length > max) throw new Error(label + " terlalu panjang.");
    if (/^[=+\-@]/.test(v)) throw new Error(label + " tidak boleh diawali = + - atau @.");
    return v;
  };
  const price = (v, label, req) => {
    v = String(v == null ? "" : v).trim();
    if (req && !v) throw new Error(label + " wajib diisi.");
    if (v && !/^[0-9.,]{1,12}$/.test(v)) throw new Error(label + " hanya boleh angka, mis. 80.000");
    return v;
  };
  const dt = (v, label) => {
    v = String(v || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) || isNaN(new Date(v + ":00+07:00").getTime()))
      throw new Error(label + " tidak valid.");
    return v;
  };
  const out = {
    enabled: it.enabled === true,
    label: txt(it.label, 50, "Nama promo", true),
    headline: txt(it.headline, 60, "Judul promo", true),
    price: price(it.price, "Harga promo", true),
    normal: price(it.normal, "Harga normal", false),
    start: dt(it.start, "Waktu mulai"),
    end: dt(it.end, "Waktu selesai"),
  };
  if (out.end <= out.start) throw new Error("Waktu selesai harus setelah waktu mulai.");
  // ID otomatis: berubah bila isi promo berubah, sehingga popup tampil lagi ke pengunjung lama
  out.id = "p" + hash_([out.label, out.headline, out.price, out.normal, out.start, out.end].join("|")).slice(0, 10);
  return out;
}

function promoSave_(raw) {
  const it = cleanPromo_(raw);
  return locked_(() => {
    const sh = promoSheet_();
    const now = Utilities.formatDate(new Date(), tz_(), "yyyy-MM-dd HH:mm");
    const range = sh.getRange(2, 1, 1, PROMO_HEADERS.length);
    range.setNumberFormat("@");
    range.setValues([[
      it.enabled ? "Ya" : "Tidak", it.id, it.label, it.headline, it.price, it.normal, it.start, it.end, now,
    ]]);
    it.updated = now;
    return { ok: true, item: it };
  });
}

function adminPost_(d) {
  try {
    if (d.action === "login") return login_(d);

    if (!isAdmin_(d.token)) {
      return { ok: false, code: 401, error: "Sesi berakhir. Silakan masuk lagi." };
    }

    switch (d.action) {
      case "verify":
        return { ok: true };
      case "logout":
        CacheService.getScriptCache().remove(tokKey_(d.token));
        return { ok: true };
      case "adminList":
        return { ok: true, items: koleksiAll_(), categories: katAll_(), promo: promoGet_() };
      case "catSave":
        return katSave_(d.item);
      case "catRemove":
        return katRemove_(d.id);
      case "promoSave":
        return promoSave_(d.item);
      case "save":
        return koleksiSave_(d.item);
      case "remove":
        return koleksiRemove_(d.id);
      case "upload":
        return koleksiUpload_(d);
      case "testiList":
        return { ok: true, items: testiAll_() };
      case "testiStatus":
        return testiSetStatus_(d.id, d.status);
      case "testiRemove":
        return testiRemove_(d.id);
      default:
        return { ok: false, error: "Aksi tidak dikenal." };
    }
  } catch (err) {
    return { ok: false, error: errMsg_(err) };
  }
}

/** GET ?action=list → koleksi yang Tampil = Ya (dipakai situs untuk katalog). */
function koleksiPublic_() {
  try {
    const items = koleksiAll_()
      .filter((it) => it.visible)
      .map((it) => ({
        id: it.id, type: it.type, name: it.name, date: it.date, tag: it.tag, cat: it.cat,
        url: it.url, img: it.img, shot1: it.shot1, shot2: it.shot2, featured: it.featured,
        noText: it.noText, was: it.was, now: it.now,
      }));
    const categories = katAll_()
      .filter((c) => c.visible)
      .map((c) => ({ id: c.id, label: c.label, desc: c.desc, was: c.was, now: c.now }));
    const p = promoGet_();
    const promo = p
      ? { enabled: p.enabled, id: p.id, label: p.label, headline: p.headline, price: p.price, normal: p.normal, start: p.start, end: p.end }
      : null;
    return { ok: true, items, categories, promo };
  } catch (err) {
    return { ok: false, error: errMsg_(err) };
  }
}

/* ============ Endpoint ============ */

function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "Permintaan tidak valid." });
  }
  if (!d || typeof d !== "object") return json_({ ok: false, error: "Permintaan tidak valid." });

  // kiriman form testimoni tidak punya "action" (kompatibel dengan form yang sudah ada)
  if (!d.action || d.action === "testimoni") return json_(testimoniSubmit_(d));
  return json_(adminPost_(d));
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  try {
    if (action === "approved") return json_(testimoniApproved_());
    if (action === "list") return json_(koleksiPublic_());
  } catch (err) {
    return json_({ ok: false, error: errMsg_(err) });
  }
  return json_({ ok: true });
}
