import { C } from "../config";

/** Link WhatsApp admin dengan pesan otomatis. */
export const WA = (m) =>
  "https://wa.me/" + C.wa + "?text=" + encodeURIComponent(m);
