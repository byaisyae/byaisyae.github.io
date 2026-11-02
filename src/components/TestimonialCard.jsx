const BASE = import.meta.env.BASE_URL;

const photoSrc = (p) => (/^(https?:)?\/\//.test(p) ? p : `${BASE}testimoni/${p}`);

const initials = (name) =>
  name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

function Stars({ n }) {
  return (
    <div
      className="flex gap-0.5 text-sk-300"
      role="img"
      aria-label={`Rating ${n} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`w-4 h-4 ${i <= n ? "" : "opacity-25"}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5l-5.4 3 1.2-6L3.3 9.3l6.1-.7L12 3z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ t }) {
  const box =
    "w-14 h-14 shrink-0 rounded-full border border-sk-300/40 overflow-hidden";
  return t.photo ? (
    <img
      src={photoSrc(t.photo)}
      alt={`Foto ${t.name}`}
      width="56"
      height="56"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={`${box} object-cover`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`${box} grid place-items-center bg-sk-300/15 font-serif text-lg text-sk-300`}
    >
      {initials(t.name)}
    </span>
  );
}

/** Satu kartu testimoni: bintang, komentar, foto, nama, dan tema yang dipilih. */
export default function TestimonialCard({ t }) {
  const pill =
    "inline-block mt-1 rounded-full bg-sk-300/15 px-2.5 py-0.5 text-xs text-sk-300";
  return (
    <figure className="h-full flex flex-col rounded-2xl border border-sk-300/20 bg-n9/60 p-6 text-left hover:border-sk-300/60 transition">
      {t.rating ? <Stars n={t.rating} /> : null}
      <blockquote
        className={`${t.rating ? "mt-3" : ""} flex-1 text-sm sm:text-base leading-relaxed text-sk-200/90`}
      >
        “{t.comment}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar t={t} />
        <span className="min-w-0">
          <span className="block font-serif text-white truncate">{t.name}</span>
          {t.url ? (
            <a
              href={t.url}
              target="_blank"
              rel="noopener"
              className={`${pill} hover:bg-sk-300/25 transition`}
            >
              Tema: {t.theme} ↗
            </a>
          ) : (
            <span className={pill}>Tema: {t.theme}</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
