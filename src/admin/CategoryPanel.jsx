import { Icon, Spinner } from "./ui";

function CatCard({ c, count, busy, onEdit, onToggle, onDelete }) {
  const builtin = c.builtin;
  return (
    <div className="bg-white rounded-2xl border border-adm-line p-6 flex flex-col">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-adm-primary/10 text-adm-primary">
          {count} tema
        </span>
        {builtin && (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-adm-fg/10 text-adm-fg">Bawaan kode</span>
        )}
        {!builtin && !c.visible && (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-adm-fg text-white">Tersembunyi</span>
        )}
      </div>
      <h3 className="font-bold text-lg">{c.label}</h3>
      <p className="text-xs text-adm-sec mt-0.5 break-all">ID: {c.id}</p>
      {c.desc && <p className="text-sm text-adm-sec mt-3 leading-relaxed">{c.desc}</p>}
      {c.now && (
        <p className="text-sm mt-3">
          <span className="text-adm-sec line-through mr-2">Rp {c.was}</span>
          <span className="font-bold">Rp {c.now}</span>
        </p>
      )}

      <div className="mt-auto pt-5">
        {builtin ? (
          <p className="text-xs text-adm-sec pt-4 border-t border-adm-line">
            Kategori ini tertulis di <code>src/config.js</code> dan hanya bisa diubah lewat kode.
          </p>
        ) : (
          <div className="flex items-center gap-2 pt-4 border-t border-adm-line">
            <button
              type="button"
              onClick={() => onEdit(c)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-adm-primary/10 text-adm-primary text-sm font-semibold hover:bg-adm-primary hover:text-white transition-colors cursor-pointer"
            >
              <Icon name="pencil" className="size-4" /> Edit
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggle(c)}
              title={c.visible ? "Sembunyikan dari situs" : "Tampilkan di situs"}
              aria-label={c.visible ? "Sembunyikan dari situs" : "Tampilkan di situs"}
              className="size-10 rounded-full ring-1 ring-adm-line flex items-center justify-center text-adm-sec hover:text-adm-primary hover:ring-adm-primary/40 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {busy ? <Spinner /> : <Icon name={c.visible ? "eye" : "eyeOff"} className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => onDelete(c)}
              title="Hapus"
              aria-label={`Hapus kategori ${c.label}`}
              className="size-10 rounded-full ring-1 ring-adm-line flex items-center justify-center text-adm-sec hover:text-adm-err hover:ring-adm-err/40 transition-colors cursor-pointer"
            >
              <Icon name="trash" className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Daftar kategori tema: bawaan kode (hanya baca) + kategori dari Google Sheet (bisa diubah). */
export default function CategoryPanel({ cats, countOf, loading, query, busyId, onAdd, onEdit, onToggle, onDelete }) {
  const shown = cats.filter((c) => !query || [c.label, c.id, c.desc].some((v) => String(v || "").toLowerCase().includes(query)));

  if (loading) {
    return (
      <p className="text-adm-sec flex items-center gap-2">
        <Spinner /> Memuat…
      </p>
    );
  }
  return (
    <>
      <p className="text-sm text-adm-sec mb-6 max-w-2xl">
        Kategori yang ditambahkan di sini langsung muncul di katalog, pilihan form tema, dan form testimoni tanpa
        mengubah kode. Urutan di situs mengikuti urutan baris di tab <b>Kategori</b> pada Google Sheet.
      </p>
      {shown.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-adm-line p-10 text-center">
          <p className="font-bold text-lg">{query ? "Tidak ada yang cocok" : "Belum ada kategori"}</p>
          {!query && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-7 py-3 mt-5 rounded-full bg-adm-primary text-white font-semibold hover:bg-adm-hover transition-colors cursor-pointer"
            >
              <Icon name="plus" className="size-5" /> Tambah Kategori
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {shown.map((c) => (
            <CatCard
              key={c.id}
              c={c}
              count={countOf(c.id)}
              busy={busyId === c.id}
              onEdit={onEdit}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}
