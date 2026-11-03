/** Penyimpanan pengaturan generator di localStorage. */
export const STORAGE_KEY = "aisyae-gen";

export const loadSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (_) {
    return {};
  }
};

export const save = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
};

// Link lama yang sudah pindah domain. Pilihan generator yang tersimpan di browser pengunjung
// otomatis dialihkan ke link baru. Tambahkan pasangan baru di sini jika ada undangan yang pindah lagi.
const MOVED = {
  "https://isanmh.github.io/wedding": "https://saevitation.com/wedding-ihsan-ai/",
};

/** Link undangan tersimpan (sudah dialihkan bila pindah domain), atau "" jika belum ada. */
export const savedBase = () => {
  const b = String(loadSaved().base || "").trim();
  return MOVED[b.replace(/\/+$/, "")] || b;
};
