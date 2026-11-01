/** Satu item lipat (memakai <details> agar aksesibel tanpa JS): + berubah menjadi × saat terbuka. */
export default function AccordionItem({ title, defaultOpen = false, delay = 0, children }) {
  return (
    <details
      open={defaultOpen}
      data-aos="fade-up"
      data-aos-delay={delay}
      className="group rounded-2xl border border-sk-300/20 bg-n9/60 open:border-sk-300/40 transition"
    >
      <summary className="flex items-center gap-3 cursor-pointer list-none px-5 py-4 text-sm sm:text-base text-white select-none [&::-webkit-details-marker]:hidden">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 shrink-0 text-sk-300 transition-transform duration-200 group-open:rotate-45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="font-medium">{title}</span>
      </summary>
      <div className="px-5 pb-5 pl-12 text-sm leading-relaxed text-sk-200/90">
        {children}
      </div>
    </details>
  );
}
