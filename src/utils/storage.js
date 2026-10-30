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
