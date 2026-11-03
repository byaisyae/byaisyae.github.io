import { C } from "../config";

/** Link WhatsApp admin dengan pesan otomatis. */
export const WA = (m) =>
  "https://wa.me/" + C.wa + "?text=" + encodeURIComponent(m);

/** Link WhatsApp untuk memesan satu desain katalog (menyertakan harga jika kategorinya punya pricelist). */
export const orderDesign = (title, d, cat) => {
  const price = cat?.price
    ? `\nHarga promo: Rp ${cat.price.now} (normal Rp ${cat.price.was})`
    : "";
  return WA(
    `Halo Aisyae Digital Invitation 👋\n\nSaya tertarik memesan desain ${title}.${price}\nDemo: ${d.url}\n\nNama mempelai:\nTanggal acara:\n\nTerima kasih 🙏`,
  );
};

/** Link WhatsApp untuk klaim promo (dipakai popup promo). */
export const orderPromo = (promo) =>
  WA(
    `Halo Aisyae Digital Invitation 👋\n\nSaya ingin klaim promo undangan digital Rp ${promo.price} (s.d. ${promo.untilLabel}).\n\nNama mempelai:\nTanggal acara:\nDesain yang diminati:\n\nTerima kasih 🙏`,
  );
