import { KOLEKSI_API } from "../config";

export const hasApi = Boolean(KOLEKSI_API.endpoint);

// Apps Script Web App: kirim JSON sebagai teks biasa (tanpa header khusus) agar tidak memicu preflight CORS.
async function post(body) {
  if (!hasApi) return { ok: false, error: "URL Apps Script belum diatur." };
  try {
    const r = await fetch(KOLEKSI_API.endpoint, { method: "POST", body: JSON.stringify(body) });
    return await r.json();
  } catch {
    return {
      ok: false,
      error: "Tidak dapat terhubung ke server. Periksa koneksi internet atau URL Apps Script.",
    };
  }
}

export const api = {
  login: (user, password) => post({ action: "login", user, password }),
  logout: (token) => post({ action: "logout", token }),
  list: (token) => post({ action: "adminList", token }),
  save: (token, item) => post({ action: "save", token, item }),
  remove: (token, id) => post({ action: "remove", token, id }),
  upload: (token, img) => post({ action: "upload", token, ...img }),
  catSave: (token, item) => post({ action: "catSave", token, item }),
  catRemove: (token, id) => post({ action: "catRemove", token, id }),
  testiList: (token) => post({ action: "testiList", token }),
  testiStatus: (token, id, status) => post({ action: "testiStatus", token, id, status }),
  testiRemove: (token, id) => post({ action: "testiRemove", token, id }),
};
