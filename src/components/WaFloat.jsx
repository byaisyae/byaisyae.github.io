import { C } from "../config";
import { WA } from "../utils/wa";
import WaIcon from "./WaIcon";

/** Tombol WhatsApp mengambang di pojok kanan bawah. */
export default function WaFloat() {
  return (
    <a
      id="waFloat"
      href={WA(C.msgOrder)}
      target="_blank"
      rel="noopener"
      aria-label="Chat WhatsApp untuk memesan undangan digital"
      className="group fixed z-50 right-4 sm:right-6 flex items-center gap-3"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <span className="hidden sm:block rounded-full bg-n9 border border-sk-300/30 px-4 py-2 text-sm text-white shadow-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition">
        Pesan Undangan Digital
      </span>
      <span className="relative flex w-14 h-14">
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-50 animate-ping motion-reduce:animate-none" />
        <span className="relative inline-flex w-14 h-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/40 group-hover:scale-110 group-active:scale-95 transition">
          <WaIcon className="w-8 h-8" />
        </span>
      </span>
    </a>
  );
}
