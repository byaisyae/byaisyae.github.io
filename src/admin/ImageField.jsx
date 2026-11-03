import { useRef, useState } from "react";
import { api } from "./api";
import { Icon, Spinner, inputCls } from "./ui";

const MAX_SIDE = 1400; // sisi terpanjang setelah diperkecil (px)

/** Perkecil gambar di browser → WebP (cadangan JPEG) → base64, agar unggahan ringan & cepat. */
async function prepare(file) {
  if (!/^image\/(jpeg|png|webp|gif|avif)$/i.test(file.type))
    throw new Error("File harus berupa gambar (JPG, PNG, atau WebP).");
  if (file.size > 20 * 1024 * 1024) throw new Error("File terlalu besar (maks. 20 MB).");
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(bmp.width * k));
  c.height = Math.max(1, Math.round(bmp.height * k));
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  let blob = await new Promise((r) => c.toBlob(r, "image/webp", 0.85));
  if (!blob || blob.type !== "image/webp") blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.85));
  if (!blob) throw new Error("Gagal memproses gambar.");
  const data = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result).split(",")[1]);
    fr.onerror = () => rej(new Error("Gagal membaca gambar."));
    fr.readAsDataURL(blob);
  });
  return { mime: blob.type, data };
}

/** Kolom gambar: unggah dari perangkat (disimpan di Google Drive) atau tempel link https. */
export default function ImageField({ label, hint, value, onChange, token, onExpired, error }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const img = await prepare(file);
      const out = await api.upload(token, img);
      if (out.code === 401) return onExpired();
      if (!out.ok) throw new Error(out.error || "Gagal mengunggah.");
      onChange(out.url);
    } catch (err) {
      setMsg(err.message || "Gagal mengunggah.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <div className="flex gap-4 items-start">
        <div className="size-24 shrink-0 rounded-xl bg-adm-muted overflow-hidden grid place-items-center text-adm-sec">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icon name="image" className="size-8" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-adm-fg text-white text-sm font-medium hover:bg-adm-primary transition-colors disabled:opacity-60 cursor-pointer"
            >
              {busy ? <Spinner /> : <Icon name="upload" className="size-4" />}
              {busy ? "Mengunggah…" : value ? "Ganti foto" : "Unggah foto"}
            </button>
            {value && !busy && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-4 py-2 rounded-full ring-1 ring-adm-line text-sm font-medium text-adm-sec hover:text-adm-err hover:ring-adm-err/40 transition-colors cursor-pointer"
              >
                Hapus
              </button>
            )}
          </div>
          <input
            type="text"
            inputMode="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…atau tempel link https://"
            className={inputCls}
          />
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" onChange={pick} className="hidden" />
      {msg ? (
        <span className="block mt-1 text-xs text-adm-err">{msg}</span>
      ) : error ? (
        <span className="block mt-1 text-xs text-adm-err">{error}</span>
      ) : hint ? (
        <span className="block mt-1 text-xs text-adm-sec">{hint}</span>
      ) : null}
    </div>
  );
}
