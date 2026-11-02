import { useEffect, useMemo, useRef, useState } from "react";
import { C, CATS, D, TESTIMONI_FORM } from "../config";

const inputCls =
  "mt-1 w-full px-4 py-3 text-base rounded-xl bg-n8 border border-sk-300/30 outline-none focus:border-sk-300";
const MAX_COMMENT = 500;

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/** Perkecil foto di browser (sisi terpanjang ≤ px) → JPEG base64 tanpa prefix data-URL. */
function shrinkPhoto(file, px) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, px / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const dataUrl = c.toDataURL("image/jpeg", 0.82);
      resolve({ mime: "image/jpeg", data: dataUrl.split(",")[1], preview: dataUrl });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Foto tidak bisa dibaca. Coba foto lain (JPG/PNG)."));
    };
    img.src = url;
  });
}

function StarPicker({ value, onChange }) {
  return (
    <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} bintang`}
          onClick={() => onChange(value === i ? 0 : i)}
          className={`p-1 rounded-lg transition hover:scale-110 ${
            i <= value ? "text-sk-300" : "text-sk-300/25"
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor" aria-hidden="true">
            <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5l-5.4 3 1.2-6L3.3 9.3l6.1-.7L12 3z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function TestimoniFormPage() {
  const [f, setF] = useState({
    name: "",
    theme: "",
    comment: "",
    url: "",
    rating: 0,
    consent: false,
    website: "", // honeypot: harus tetap kosong
  });
  const [photo, setPhoto] = useState(null); // { mime, data, preview }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const idRef = useRef(newId()); // ID tetap per pengisian → kirim ulang tidak dobel
  const fileRef = useRef(null);

  useEffect(() => {
    document.title = "Form Testimoni | Aisyae Digital Invitation";
  }, []);

  // pilihan tema: kategori + tema undangan client yang sudah ada
  const themes = useMemo(
    () => [
      ...new Set([
        ...CATS.map((c) => c.label),
        ...D.filter((x) => x.client).map((x) => x.tag),
      ]),
    ],
    [],
  );

  const set = (k) => (e) =>
    setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    if (!file.type.startsWith("image/")) return setErr("File harus berupa foto.");
    if (file.size > 12 * 1024 * 1024) return setErr("Foto terlalu besar (maks. 12 MB).");
    try {
      setPhoto(await shrinkPhoto(file, TESTIMONI_FORM.photoMaxPx));
    } catch (x) {
      setErr(x.message);
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr("");
    if (!f.name.trim() || !f.theme || !f.comment.trim())
      return setErr("Nama, tema, dan testimoni wajib diisi.");
    if (!f.consent)
      return setErr("Mohon setujui izin penayangan testimoni terlebih dahulu.");
    if (!TESTIMONI_FORM.endpoint)
      return setErr("Form belum aktif. Mohon hubungi admin via WhatsApp.");

    setBusy(true);
    try {
      // text/plain = "simple request" → tanpa preflight CORS (Apps Script tidak menanganinya)
      const res = await fetch(TESTIMONI_FORM.endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          id: idRef.current,
          name: f.name.trim(),
          theme: f.theme,
          comment: f.comment.trim(),
          url: f.url.trim(),
          rating: f.rating,
          consent: f.consent,
          website: f.website,
          photo: photo ? { mime: photo.mime, data: photo.data } : null,
        }),
      });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || "Gagal mengirim.");
      setDone(true);
    } catch (x) {
      setErr(
        x instanceof TypeError
          ? "Koneksi bermasalah. Periksa internet Anda lalu coba kirim lagi."
          : x.message,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen glow">
      <header className="px-5 py-5 text-center">
        <a
          href={import.meta.env.BASE_URL}
          className="font-script text-4xl leading-none text-white"
        >
          saevitation
        </a>
      </header>

      <main className="px-5 pb-16 pt-4 sm:pt-8">
        <div className="max-w-xl mx-auto">
          {done ? (
            <div className="rounded-3xl border border-sk-300/25 bg-n9/70 px-6 py-12 text-center">
              <p className="font-script text-5xl text-sk-300">Terima Kasih</p>
              <p className="mt-4 text-sk-200/90 leading-relaxed">
                Testimoni Anda sudah kami terima. Semoga hari bahagia Anda
                selalu penuh berkah 🤍
              </p>
              <a
                href={import.meta.env.BASE_URL}
                className="inline-flex items-center justify-center h-12 px-7 mt-7 rounded-full bg-sk-300 text-n9 font-semibold hover:bg-white transition"
              >
                Kembali ke Beranda
              </a>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="tracking-[.3em] text-[11px] sm:text-xs text-sk-300">
                  FORM TESTIMONI
                </p>
                <h1 className="font-script text-5xl sm:text-6xl text-white mt-3 leading-tight">
                  Ceritakan Pengalaman Anda
                </h1>
                <p className="mt-3 text-sk-300/90 leading-relaxed">
                  Terima kasih sudah mempercayakan undangan digital pada kami.
                  Testimoni Anda sangat berarti untuk calon pengantin lainnya.
                </p>
              </div>

              <form
                onSubmit={submit}
                noValidate
                className="mt-8 space-y-5 rounded-3xl border border-sk-300/25 bg-n9/70 p-5 sm:p-7"
              >
                <label className="block text-sm">
                  Nama (mempelai) <span className="text-sk-300">*</span>
                  <input
                    className={inputCls}
                    value={f.name}
                    onChange={set("name")}
                    maxLength={80}
                    placeholder="mis. Rere & Jabal"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="block text-sm">
                  Tema yang dipilih <span className="text-sk-300">*</span>
                  <select
                    className={inputCls}
                    value={f.theme}
                    onChange={set("theme")}
                    required
                  >
                    <option value="">Pilih tema…</option>
                    {themes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </label>

                <label className="block text-sm">
                  Testimoni <span className="text-sk-300">*</span>
                  <textarea
                    className={`${inputCls} min-h-[8rem] resize-y`}
                    value={f.comment}
                    onChange={set("comment")}
                    maxLength={MAX_COMMENT}
                    placeholder="Bagaimana pengalaman Anda memakai undangan digital kami?"
                    required
                  />
                  <span className="block mt-1 text-right text-xs text-sk-300/70">
                    {f.comment.length}/{MAX_COMMENT}
                  </span>
                </label>

                <div className="text-sm">
                  Rating <span className="text-sk-300/70">(opsional)</span>
                  <StarPicker
                    value={f.rating}
                    onChange={(v) => setF((s) => ({ ...s, rating: v }))}
                  />
                </div>

                <div className="text-sm">
                  Foto <span className="text-sk-300/70">(opsional)</span>
                  <div className="mt-2 flex items-center gap-4">
                    {photo ? (
                      <img
                        src={photo.preview}
                        alt="Pratinjau foto"
                        className="w-20 h-20 rounded-full object-cover border border-sk-300/40"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="grid place-items-center w-20 h-20 rounded-full border border-dashed border-sk-300/40 text-sk-300/60 text-2xl"
                      >
                        📷
                      </span>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <label className="px-4 py-2 rounded-full border border-sk-300/50 hover:bg-sk-300/10 cursor-pointer transition">
                        {photo ? "Ganti foto" : "Pilih foto"}
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          onChange={onPhoto}
                          className="sr-only"
                        />
                      </label>
                      {photo && (
                        <button
                          type="button"
                          onClick={clearPhoto}
                          className="px-4 py-2 rounded-full text-sk-300/80 hover:text-white transition"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-sk-300/70">
                    Foto diperkecil otomatis. Boleh foto berdua atau foto
                    pernikahan.
                  </p>
                </div>

                <label className="block text-sm">
                  Link undangan Anda{" "}
                  <span className="text-sk-300/70">(opsional)</span>
                  <input
                    className={inputCls}
                    value={f.url}
                    onChange={set("url")}
                    inputMode="url"
                    maxLength={300}
                    placeholder="https://saevitation.com/wedding-..."
                  />
                </label>

                {/* honeypot: disembunyikan dari manusia, bot biasanya mengisinya */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                >
                  <label>
                    Website
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={f.website}
                      onChange={set("website")}
                    />
                  </label>
                </div>

                <label className="flex items-start gap-3 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    checked={f.consent}
                    onChange={set("consent")}
                    className="mt-1 w-5 h-5 shrink-0 accent-[#7fa8e0]"
                  />
                  <span>
                    Saya mengizinkan testimoni, nama, dan foto saya ditampilkan
                    di situs dan media promosi Aisyae Digital Invitation.{" "}
                    <span className="text-sk-300">*</span>
                  </span>
                </label>

                {err && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  >
                    {err}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-full bg-sk-300 text-n9 font-semibold hover:bg-white disabled:opacity-60 disabled:cursor-wait transition"
                >
                  {busy ? "Mengirim…" : "Kirim Testimoni"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-sk-300/70">
                Ada kendala? Hubungi kami di{" "}
                <a
                  className="underline"
                  href={`https://wa.me/${C.wa}`}
                  target="_blank"
                  rel="noopener"
                >
                  WhatsApp
                </a>
                .
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
