import { useEffect, useMemo, useRef, useState } from "react";
import { C, LANGS, SITE } from "../config";
import { designKey, useDesigns } from "../utils/useDesigns";
import { copyText } from "../utils/copy";
import { loadSaved, save } from "../utils/storage";
import { translateMessage } from "../utils/translate";

const phone = (p) => (p || "").replace(/\D/g, "").replace(/^0/, "62");

/** Satu baris hasil: salin link / salin pesan / kirim WhatsApp. */
function ResultRow({ r }) {
  const [done, setDone] = useState(null); // "l" | "m" | null

  const copy = (kind) =>
    copyText(kind === "l" ? r.link : r.m, () => {
      setDone(kind);
      setTimeout(() => setDone(null), 1500);
    });

  return (
    <div className="rounded-2xl border border-sk-300/25 bg-n9/70 p-4">
      <p className="font-medium text-white">{r.n}</p>
      <p className="text-xs text-sk-300 break-all my-2">{r.link}</p>
      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={() => copy("l")}
          className="px-4 py-2 rounded-full bg-sk-300 text-n9 font-medium"
        >
          {done === "l" ? "Tersalin ✓" : "Salin Link"}
        </button>
        <button
          type="button"
          onClick={() => copy("m")}
          className="px-4 py-2 rounded-full border border-sk-300/50 hover:bg-sk-300/10"
        >
          {done === "m" ? "Tersalin ✓" : "Salin Pesan"}
        </button>
        <a
          href={r.wa}
          target="_blank"
          rel="noopener"
          className="px-4 py-2 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-400"
        >
          Kirim WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function Generator({ base, setBase }) {
  const D = useDesigns();
  const [names, setNames] = useState(
    () => loadSaved().names ?? "Aisyae Invitation\nMC Abuy",
  );
  // bahasa pesan + template per bahasa (tersimpan; `msg` lama dipindah ke bahasa Indonesia)
  const [lang, setLang] = useState(() => {
    const l = loadSaved().lang;
    return LANGS.some((x) => x.id === l) ? l : "id";
  });
  const [msgs, setMsgs] = useState(() => {
    const s = loadSaved();
    return { ...C.msgs, ...(s.msg ? { id: s.msg } : {}), ...(s.msgs || {}) };
  });
  // meta terjemahan per bahasa: src = pesan Indonesia yang jadi sumber terjemahan terakhir,
  // manual = true jika pengguna mengedit sendiri pesan bahasa itu
  const [meta, setMeta] = useState(() => {
    const s = loadSaved();
    const m = {};
    for (const l of ["en", "ar"]) {
      m[l] = s.meta?.[l] || {
        src: C.msgs.id,
        manual: !!s.msgs?.[l] && s.msgs[l] !== C.msgs[l], // diedit manual di versi lama
      };
    }
    return m;
  });
  const [allDone, setAllDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const reqRef = useRef(0);

  const msg = msgs[lang];
  const curLang = LANGS.find((x) => x.id === lang);
  const setMsg = (v) => {
    setMsgs((m) => ({ ...m, [lang]: v }));
    if (lang !== "id") setMeta((m) => ({ ...m, [lang]: { ...m[lang], manual: true } }));
  };

  // Terjemahkan pesan Indonesia (termasuk yang sudah Anda ubah) ke bahasa l.
  // force = true menimpa pesan yang sudah diedit manual.
  const translateTo = async (l, force = false) => {
    const idText = msgs.id;
    const m = meta[l];
    if (!force && (m.manual || m.src === idText)) return; // tidak perlu diterjemahkan ulang
    const my = ++reqRef.current;
    setErr("");
    if (idText === C.msgs.id) {
      // pesan Indonesia masih bawaan → pakai template bawaan bahasa itu
      setBusy(false);
      setMsgs((x) => ({ ...x, [l]: C.msgs[l] }));
      setMeta((x) => ({ ...x, [l]: { src: idText, manual: false } }));
      return;
    }
    setBusy(true);
    try {
      const t = await translateMessage(idText, l);
      if (my !== reqRef.current) return;
      setMsgs((x) => ({ ...x, [l]: t }));
      setMeta((x) => ({ ...x, [l]: { src: idText, manual: false } }));
    } catch (e) {
      if (my === reqRef.current) setErr(e.message);
    } finally {
      if (my === reqRef.current) setBusy(false);
    }
  };

  const selectLang = (l) => {
    setLang(l);
    setErr("");
    if (l !== "id") translateTo(l);
  };

  // simpan pengaturan tiap berubah
  useEffect(() => {
    save({ base, names, lang, msgs, meta });
  }, [base, names, lang, msgs, meta]);

  const { valid, rows } = useMemo(() => {
    let parsed = null;
    try {
      parsed = new URL(base.trim());
    } catch (_) {}
    if (!parsed) return { valid: false, rows: [] };
    const rows = names
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [n, p] = l.split("|").map((x) => x.trim());
        const u = new URL(parsed);
        u.searchParams.set("to", n);
        const link = u.toString();
        const m = msg.replaceAll("{nama}", n).replaceAll("{link}", link);
        return {
          n,
          link,
          m,
          wa: `https://wa.me/${phone(p)}?text=${encodeURIComponent(m)}`,
        };
      });
    return { valid: true, rows };
  }, [base, names, msg]);

  const copyAll = () =>
    copyText(rows.map((r) => `${r.n}: ${r.link}`).join("\n"), () => {
      setAllDone(true);
      setTimeout(() => setAllDone(false), 1500);
    });

  const inputCls =
    "mt-1 w-full px-4 py-3 text-base rounded-xl bg-n8 border border-sk-300/30 outline-none focus:border-sk-300";

  return (
    <section
      id="generator"
      className="py-16 sm:py-20 px-5 bg-gradient-to-b from-n8 to-n9"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 data-aos="fade-up" className="font-script text-5xl text-white">
            Generator Link Tamu
          </h2>
          <p data-aos="fade-up" className="mt-3 text-sk-300/90">
            Masukkan nama tamu, link personal langsung jadi. Tinggal salin dan
            bagikan ke WhatsApp.
          </p>
        </div>
        <div
          data-aos="fade-up"
          className="mt-10 rounded-3xl border border-sk-300/25 bg-n9/70 p-5 sm:p-8 space-y-5"
        >
          <div>
            <p className="text-sm mb-2">Pilih undangan client</p>
            <div id="pick" className="flex flex-wrap gap-2 text-sm">
              {D.filter((x) => x.client).map((x) => (
                <button
                  key={designKey(x)}
                  type="button"
                  onClick={() => setBase(x.url)}
                  className="px-4 py-2 rounded-full border border-sk-300/40 hover:bg-sk-300 hover:text-n9 transition"
                >
                  {x.n}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm">
            Link undangan
            <input
              id="base"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className={inputCls}
              placeholder={`${SITE}/nama-undangan/`}
              inputMode="url"
              autoCapitalize="off"
              autoComplete="off"
            />
          </label>
          <label className="block text-sm">
            Daftar nama tamu{" "}
            <span className="text-sk-300/70">
              (satu nama per baris — opsional:{" "}
              <code className="text-sk-200">Nama|08123456789</code> agar
              langsung membuka chat tamu)
            </span>
            <textarea
              id="names"
              rows={5}
              value={names}
              onChange={(e) => setNames(e.target.value)}
              className={inputCls}
            />
          </label>
          <div className="text-sm">
            <p className="mb-2">
              Bahasa pesan WhatsApp{" "}
              <span className="text-sk-300/70">
                (pesan otomatis diterjemahkan ke bahasa pilihan)
              </span>
            </p>
            <div role="tablist" aria-label="Bahasa pesan" className="flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  aria-selected={lang === l.id}
                  onClick={() => selectLang(l.id)}
                  className={`px-4 py-2 rounded-full border transition ${
                    lang === l.id
                      ? "bg-sk-300 text-n9 border-sk-300 font-medium"
                      : "border-sk-300/40 hover:bg-sk-300/10"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            {lang !== "id" && (
              <div className="mt-3 text-xs space-y-1">
                {busy && <p className="text-sk-300">Menerjemahkan pesan Indonesia…</p>}
                {err && (
                  <p className="text-red-300">
                    Gagal menerjemahkan ({err}). Pesan sebelumnya tetap dipakai.
                  </p>
                )}
                {!busy &&
                  !err &&
                  !meta[lang].manual &&
                  meta[lang].src === msgs.id &&
                  msgs.id !== C.msgs.id && (
                    <p className="text-sk-300/80">
                      Diterjemahkan otomatis dari pesan Indonesia Anda — cek
                      kembali sebelum dikirim.
                    </p>
                  )}
                {!busy && meta[lang].manual && meta[lang].src !== msgs.id && (
                  <p className="text-sk-300/80">
                    Pesan ini Anda edit manual, jadi tidak ikut berubah saat
                    pesan Indonesia diubah.
                  </p>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => translateTo(lang, true)}
                  className="px-3 py-1.5 rounded-full border border-sk-300/50 hover:bg-sk-300 hover:text-n9 transition disabled:opacity-50"
                >
                  Terjemahkan ulang dari pesan Indonesia
                </button>
                <p className="text-sk-300/60">
                  Teks pesan (tanpa nama tamu &amp; link) dikirim ke layanan
                  MyMemory untuk diterjemahkan.
                </p>
              </div>
            )}
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-sk-300">
              Ubah template pesan ({curLang.label})
            </summary>
            <textarea
              id="msg"
              rows={8}
              dir={curLang.dir}
              lang={lang}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="mt-2 w-full px-4 py-3 text-base rounded-xl bg-n8 border border-sk-300/30 outline-none focus:border-sk-300"
            />
            <p className="mt-1 text-xs text-sk-300/70">
              Gunakan <b>{"{nama}"}</b> dan <b>{"{link}"}</b> — keduanya
              otomatis diganti untuk tiap tamu. Template tiap bahasa disimpan
              terpisah.
            </p>
            <button
              type="button"
              onClick={() => {
                setMsgs((m) => ({ ...m, [lang]: C.msgs[lang] }));
                if (lang !== "id")
                  setMeta((m) => ({ ...m, [lang]: { src: msgs.id, manual: false } }));
              }}
              className="mt-2 text-xs underline text-sk-300 hover:text-white"
            >
              Kembalikan template bawaan
            </button>
          </details>
        </div>
        <div className="flex items-center justify-between mt-8 mb-3">
          <h3 className="font-serif text-xl text-white">
            Hasil{" "}
            <span id="cnt" className="text-sm text-sk-300">
              {rows.length ? `(${rows.length} tamu)` : ""}
            </span>
          </h3>
          <button
            id="all"
            type="button"
            onClick={copyAll}
            className="text-sm px-4 py-1.5 rounded-full border border-sk-300/50 hover:bg-sk-300 hover:text-n9 transition"
          >
            {allDone ? "Tersalin ✓" : "Salin Semua Link"}
          </button>
        </div>
        {!valid && (
          <p id="err" className="text-red-300 text-sm mb-3">
            Link undangan belum valid. Contoh:
            {SITE}/wedding-rere-jabal/
          </p>
        )}
        <div id="out" className="space-y-3">
          {rows.length ? (
            rows.map((r, i) => <ResultRow key={`${i}-${r.n}`} r={r} />)
          ) : (
            <p className="text-center text-sm text-sk-300/70 py-6">
              Belum ada nama tamu.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
