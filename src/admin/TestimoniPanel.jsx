import { fmtDate } from "../utils/useDesigns";
import { Icon, Spinner } from "./ui";

export const STATUS = {
  Pending: { label: "Menunggu", chip: "bg-adm-warn/30 text-adm-fg" },
  Approved: { label: "Disetujui", chip: "bg-adm-ok/10 text-adm-ok" },
  Rejected: { label: "Ditolak", chip: "bg-adm-err/10 text-adm-err" },
};

export const FILTERS = [
  { id: "Pending", label: "Menunggu" },
  { id: "Approved", label: "Disetujui" },
  { id: "Rejected", label: "Ditolak" },
  { id: "semua", label: "Semua" },
];

const initials = (name) =>
  String(name || "?")
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

function Stars({ n }) {
  return (
    <span className="inline-flex gap-0.5 text-adm-warn" role="img" aria-label={`Rating ${n} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" className={`size-4 ${i <= n ? "" : "opacity-25"}`} />
      ))}
    </span>
  );
}

function ActionBtn({ tone, icon, label, busy, disabled, onClick }) {
  const tones = {
    ok: "bg-adm-ok text-white hover:opacity-90",
    err: "ring-1 ring-adm-line text-adm-sec hover:text-adm-err hover:ring-adm-err/40",
    plain: "ring-1 ring-adm-line text-adm-sec hover:text-adm-primary hover:ring-adm-primary/40",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 h-10 rounded-full text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${tones[tone]}`}
    >
      {busy ? <Spinner /> : <Icon name={icon} className="size-4" />} {label}
    </button>
  );
}

function Row({ it, busy, onStatus, onDelete }) {
  const st = STATUS[it.status] || STATUS.Pending;
  return (
    <article className="bg-white rounded-2xl border border-adm-line p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
      <div className="shrink-0">
        {it.photo ? (
          <img
            src={it.photo}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-16 rounded-full object-cover bg-adm-muted"
          />
        ) : (
          <span className="size-16 rounded-full bg-adm-primary/10 text-adm-primary font-bold text-lg grid place-items-center">
            {initials(it.name)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-bold text-lg truncate max-w-full">{it.name}</h3>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${st.chip}`}>{st.label}</span>
          {!it.consent && (
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-adm-err/10 text-adm-err">
              Tanpa izin tampil
            </span>
          )}
        </div>
        <p className="text-sm text-adm-sec mt-1">
          Tema: <span className="font-medium text-adm-fg">{it.theme}</span> · {fmtDate(it.time)}
          {it.time.length > 10 ? ` ${it.time.slice(11)}` : ""}
        </p>
        {it.rating > 0 && (
          <div className="mt-2">
            <Stars n={it.rating} />
          </div>
        )}
        <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line break-words">“{it.comment}”</p>
        {it.url && (
          <a
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-adm-primary hover:underline"
          >
            <Icon name="external" className="size-4" /> Buka undangan
          </a>
        )}

        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-adm-line">
          {it.status !== "Approved" && (
            <ActionBtn
              tone="ok"
              icon="check"
              label="Setujui"
              busy={busy}
              disabled={!it.consent}
              onClick={() => onStatus(it, "Approved")}
            />
          )}
          {it.status === "Pending" && (
            <ActionBtn tone="err" icon="x" label="Tolak" busy={busy} onClick={() => onStatus(it, "Rejected")} />
          )}
          {it.status === "Approved" && (
            <ActionBtn
              tone="plain"
              icon="eyeOff"
              label="Batalkan persetujuan"
              busy={busy}
              onClick={() => onStatus(it, "Pending")}
            />
          )}
          {it.status === "Rejected" && (
            <ActionBtn tone="plain" icon="refresh" label="Kembalikan ke menunggu" busy={busy} onClick={() => onStatus(it, "Pending")} />
          )}
          <button
            type="button"
            onClick={() => onDelete(it)}
            title="Hapus"
            aria-label={`Hapus testimoni ${it.name}`}
            className="size-10 rounded-full ring-1 ring-adm-line flex items-center justify-center text-adm-sec hover:text-adm-err hover:ring-adm-err/40 transition-colors cursor-pointer sm:ml-auto"
          >
            <Icon name="trash" className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

/** Daftar moderasi testimoni: filter status + tombol Setujui / Tolak / Hapus. */
export default function TestimoniPanel({ items, loading, filter, setFilter, query, busyId, onStatus, onDelete }) {
  const count = (id) => (id === "semua" ? items.length : items.filter((i) => i.status === id).length);
  const shown = items
    .filter((i) => filter === "semua" || i.status === filter)
    .filter(
      (i) =>
        !query || [i.name, i.theme, i.comment].some((v) => String(v || "").toLowerCase().includes(query)),
    )
    .slice()
    .reverse(); // terbaru dulu

  return (
    <>
      <div className="overflow-x-auto mb-8">
        <div className="flex gap-3 min-w-max pb-2">
          {FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all cursor-pointer ${
                  on
                    ? "bg-adm-fg text-white shadow-sm"
                    : "bg-white ring-1 ring-adm-line text-adm-sec hover:ring-adm-primary hover:text-adm-primary"
                }`}
              >
                {f.label} ({count(f.id)})
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p className="text-adm-sec flex items-center gap-2">
          <Spinner /> Memuat…
        </p>
      ) : shown.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-adm-line p-10 text-center">
          <p className="font-bold text-lg">
            {query ? "Tidak ada yang cocok" : filter === "Pending" ? "Tidak ada yang menunggu" : "Belum ada testimoni"}
          </p>
          <p className="text-adm-sec text-sm mt-1">
            {query
              ? "Coba kata kunci lain."
              : "Testimoni dari form /form-testimoni/ akan muncul di sini untuk Anda tinjau."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {shown.map((it) => (
            <Row key={it.id} it={it} busy={busyId === it.id} onStatus={onStatus} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  );
}
