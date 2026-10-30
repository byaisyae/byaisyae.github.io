import { useEffect, useMemo, useState } from "react";
import { C, D } from "../config";
import { copyText } from "../utils/copy";
import { loadSaved, save } from "../utils/storage";

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
  const [names, setNames] = useState(
    () => loadSaved().names ?? "Aisyae Invitation\nMC Abuy",
  );
  const [msg, setMsg] = useState(() => loadSaved().msg || C.msg);
  const [allDone, setAllDone] = useState(false);

  // simpan pengaturan tiap berubah
  useEffect(() => {
    save({ base, names, msg });
  }, [base, names, msg]);

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
            <p className="text-sm mb-2">Pilih desain undangan</p>
            <div id="pick" className="flex flex-wrap gap-2 text-sm">
              {D.map((x) => (
                <button
                  key={x.url}
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
              placeholder="https://username.github.io/nama-undangan/"
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
          <details className="text-sm">
            <summary className="cursor-pointer text-sk-300">
              Ubah template pesan WhatsApp
            </summary>
            <textarea
              id="msg"
              rows={8}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="mt-2 w-full px-4 py-3 text-base rounded-xl bg-n8 border border-sk-300/30 outline-none focus:border-sk-300"
            />
            <p className="mt-1 text-xs text-sk-300/70">
              Gunakan <b>{"{nama}"}</b> dan <b>{"{link}"}</b> — keduanya
              otomatis diganti untuk tiap tamu.
            </p>
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
            https://byaisyae.github.io/wedding-rere-jabal/
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
