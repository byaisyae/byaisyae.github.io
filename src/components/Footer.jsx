import { C, SITE } from "../config";

const IG_URL = `https://www.instagram.com/${C.ig}`;
const HOST = new URL(SITE).host; // mis. saevitation.com

const iconCls = "w-5 h-5";

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconCls}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconCls}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

const linkCls = "hover:text-white transition";
const iconLinkCls =
  "inline-flex items-center justify-center w-10 h-10 rounded-full border border-sk-300/30 text-sk-300 hover:bg-sk-300 hover:text-n9 transition";

export default function Footer({ className = "pt-8 pb-24 sm:pb-8" }) {
  return (
    <footer
      className={`${className} text-center text-xs text-sk-300/70 border-t border-sk-300/10`}
    >
      <p>
        &copy; {new Date().getFullYear()} Aisyae Digital Invitation — Dibuat
        dengan cinta.
      </p>

      <div className="mt-6 space-y-1 text-sm italic text-sk-300/90">
        <p>
          Designed with love by :{" "}
          <a href={SITE} target="_blank" rel="noopener" className={linkCls}>
            {HOST}
          </a>
        </p>
        <p>
          Our Instagram :{" "}
          <a href={IG_URL} target="_blank" rel="noopener" className={linkCls}>
            @{C.ig}
          </a>
        </p>
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <a
          href={SITE}
          target="_blank"
          rel="noopener"
          aria-label={`Website ${HOST}`}
          className={iconLinkCls}
        >
          <GlobeIcon />
        </a>
        <a
          href={IG_URL}
          target="_blank"
          rel="noopener"
          aria-label={`Instagram @${C.ig}`}
          className={iconLinkCls}
        >
          <InstagramIcon />
        </a>
      </div>
    </footer>
  );
}
