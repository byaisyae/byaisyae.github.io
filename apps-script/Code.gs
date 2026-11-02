/**
 * Backend form testimoni Saevitation — Google Apps Script (terikat ke Google Sheet).
 * Cara pasang: lihat apps-script/SETUP.md
 *
 * Kolom sheet "Testimoni":
 *  Waktu | ID | Nama | Tema | Komentar | Rating | Link Undangan | Foto | Izin Tampil | Status
 * Setiap kiriman masuk dengan Status "Pending". Ubah ke "Approved" untuk menyetujui.
 */
const SHEET_NAME = "Testimoni";
const FOLDER_NAME = "Testimoni Saevitation (foto)";
const HEADERS = [
  "Waktu", "ID", "Nama", "Tema", "Komentar", "Rating",
  "Link Undangan", "Foto", "Izin Tampil", "Status",
];
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // batas foto setelah didekode
const OK_MIME = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Ambil tab "Testimoni"; jika belum ada, dibuat otomatis lengkap dengan header & dropdown Status. */
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Script ini belum terhubung ke Google Sheet. Buka Apps Script dari menu Extensions di dalam Sheet.");
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange(2, HEADERS.length, 999, 1).setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(["Pending", "Approved", "Rejected"], true)
        .build(),
    );
  }
  return sh;
}

/** Opsional: jalankan dari editor untuk menyiapkan sheet & folder foto + meminta izin akses lebih awal. */
function setup() {
  sheet_();
  folder_();
  Logger.log("Setup selesai. Lanjut: Deploy > New deployment > Web app.");
}

function folder_() {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty("FOLDER_ID");
  if (saved) {
    try { return DriveApp.getFolderById(saved); } catch (_) { /* dibuat ulang */ }
  }
  const f = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty("FOLDER_ID", f.getId());
  return f;
}

// cegah formula injection: sel yang diawali = + - @ dianggap teks
const safe_ = (v) => {
  v = String(v == null ? "" : v).trim();
  return /^[=+\-@]/.test(v) ? "'" + v : v;
};

const json_ = (o) =>
  ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: true }); // honeypot: bot mengisi kolom tersembunyi

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

    const sh = sheet_();

    // kiriman ulang dengan ID sama (mis. klik dua kali) tidak dicatat dua kali
    const last = sh.getLastRow();
    if (last > 1) {
      const ids = sh.getRange(2, 2, last - 1, 1).getValues().flat();
      if (ids.indexOf(id) !== -1) return json_({ ok: true, duplicate: true });
    }

    let photoUrl = "";
    if (d.photo && d.photo.data) {
      const ext = OK_MIME[d.photo.mime];
      if (!ext) throw new Error("Format foto tidak didukung.");
      const bytes = Utilities.base64Decode(d.photo.data);
      if (bytes.length > MAX_PHOTO_BYTES) throw new Error("Ukuran foto terlalu besar.");
      const blob = Utilities.newBlob(bytes, d.photo.mime, id + "." + ext);
      const file = folder_().createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      photoUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w400";
    }

    sh.appendRow([
      new Date(), id, safe_(name), safe_(theme), safe_(comment),
      rating || "", url, photoUrl, "Ya", "Pending",
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

/** Opsional: GET ?action=approved → daftar testimoni berstatus Approved (untuk ditampilkan di situs). */
function doGet(e) {
  if (!e || !e.parameter || e.parameter.action !== "approved") return json_({ ok: true });
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) return json_({ ok: true, items: [] });
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues();
  const items = rows
    .filter((r) => r[9] === "Approved" && r[8] === "Ya")
    .map((r) => ({
      name: r[2], theme: r[3], comment: r[4],
      rating: r[5] || undefined, url: r[6] || undefined, photo: r[7] || undefined,
    }));
  return json_({ ok: true, items });
}
