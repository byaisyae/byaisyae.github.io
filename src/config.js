// Screenshot tampilan undangan untuk kartu katalog (cover + galeri)
import elegant01Cover from "./assets/catalog/elegant-01-cover.png";
import elegant01Gallery from "./assets/catalog/elegant-01-gallery.png";
import elegant02Cover from "./assets/catalog/elegant-02-cover.png";
import elegant02Gallery from "./assets/catalog/elegant-02-gallery.png";

/* ===== PENGATURAN — edit di sini ===== */
// Domain utama tempat undangan di-host. Opsional: atur lewat env VITE_SITE_URL saat build
// (lihat .env.example / README). Jika kosong, dipakai https://saevitation.com
export const SITE = (
  import.meta.env.VITE_SITE_URL || "https://saevitation.com"
).replace(/\/+$/, "");

export const C = {
  ig: "saevitation", // username Instagram (tanpa @), tampil di footer
  wa: "6282233505516", // nomor WhatsApp admin (format internasional, tanpa + atau 0 di depan)
  // pesan otomatis saat tombol WhatsApp diklik
  msgOrder: `Halo Aisyae Digital Invitation 👋\n\nSaya ingin memesan undangan pernikahan digital. Mohon info paket, harga, dan prosesnya ya.\n\nNama mempelai:\nTanggal acara:\nDesain yang diminati:\n\nTerima kasih 🙏`,
  msgCustom: `Halo Aisyae Digital Invitation 👋\n\nSaya ingin memesan undangan digital dengan desain custom. Berikut konsep yang saya inginkan (warna / tema / animasi):\n\nBisa kita diskusikan? Terima kasih 🙏`,
  msgHelp: `Halo Aisyae Digital Invitation 👋\n\nSaya membuka link undangan tetapi halamannya tidak ditemukan (404). Mohon bantuannya ya 🙏`,
  base: `${SITE}/wedding-rere-jabal/`,
  // template pesan generator link tamu, per bahasa (pakai {nama} dan {link})
  msgs: {
    id: `Assalamualaikum Wr. Wb.\n\nKepada Yth. {nama},\n\nDengan penuh rasa syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.\n\nBuka undangan digital kami di sini:\n{link}\n\nMerupakan kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu. Terima kasih 🙏`,
    en: `Assalamu'alaikum Wr. Wb.\n\nDear {nama},\n\nWith deep gratitude, we cordially invite you to attend our wedding celebration.\n\nPlease open our digital invitation here:\n{link}\n\nIt would be an honor for us if you could attend and give us your blessings. Thank you 🙏`,
    ar: `السلام عليكم ورحمة الله وبركاته\n\nإلى المكرَّم/ة {nama}،\n\nبكل الشكر والامتنان، يسرّنا أن ندعوكم لحضور حفل زفافنا.\n\nيمكنكم فتح دعوتنا الرقمية من هنا:\n{link}\n\nيشرّفنا حضوركم وتقديم دعواتكم الطيبة لنا. جزاكم الله خيرًا 🙏`,
  },
};

// Keunggulan yang tampil di setiap tema katalog. Per kategori bisa ditimpa lewat
// properti "features" di kategori itu; "note" = catatan kaki untuk tanda bintang (*).
export const FEATURES = {
  items: [
    "Masa Aktif Selamanya*",
    "Unlimited Share",
    "Jumlah Foto Maksimal 25",
    "Responsive di semua device",
  ],
  note: "*Selama layanan Saevitation masih beroperasi.",
};

// Kategori katalog — tambah/ubah kategori & pricelist di sini.
// "price" opsional: { was: harga coret, now: harga promo }
const BASE_CATS = [
  {
    id: "minimalist-elegant",
    label: "Minimalist Elegant",
    desc: "Tampilan bersih dengan tipografi elegan dan warna lembut yang timeless.",
    price: { was: "299.000", now: "149.000" },
  },
  {
    id: "minimalist-aesthetic",
    label: "Minimalist Aesthetic",
    desc: "Sentuhan estetik yang modern, manis, dan tetap sederhana.",
  },
  {
    id: "syari",
    label: "Syar'i",
    desc: "Desain santun bernuansa islami untuk pernikahan yang menjaga adab.",
  },
];

// Promo musiman: selama periode aktif, SEMUA desain tampil dengan harga promo di bawah.
// Ubah tanggal/harga di sini; setelah "end" lewat, harga otomatis kembali normal & popup hilang.
export const PROMO = {
  id: "promo-nov-des-2026", // ganti id untuk menampilkan ulang popup ke pengunjung lama
  start: "2026-11-01T00:00:00+07:00",
  end: "2026-12-31T23:59:59+07:00",
  price: "80.000",
  normal: "299.000", // harga normal yang dicoret
  untilLabel: "31 Desember 2026",
};
export const promoActive = (() => {
  const t = Date.now();
  return t >= Date.parse(PROMO.start) && t <= Date.parse(PROMO.end);
})();

// beri tahu CSS bahwa bar promo tampil (dipakai untuk offset konten di bawah header tetap)
if (promoActive && typeof document !== "undefined")
  document.documentElement.classList.add("has-bar");

export const CATS = BASE_CATS.map((c) => ({
  features: FEATURES,
  ...c,
  ...(promoActive ? { price: { was: PROMO.normal, now: PROMO.price } } : {}),
}));

// Bahasa pesan di generator link tamu
export const LANGS = [
  { id: "id", label: "Indonesia", dir: "ltr" },
  { id: "en", label: "English", dir: "ltr" },
  { id: "ar", label: "العربية", dir: "rtl" },
];

// Grup "koleksi client" di halaman katalog (desain dengan client: true)
export const CLIENT = {
  id: "client",
  label: "Koleksi Undangan Client",
  short: "Koleksi Client",
  desc: "Undangan yang pernah kami buat untuk client.",
};

// Koleksi desain — tambah desain baru di sini
//  client   : true = undangan milik client yang pernah memesan. Tampil di grup "Koleksi Undangan Client"
//             (dengan nama & tanggal nikah) dan jadi pilihan di generator link. Jangan isi cat.
//  cat      : id kategori tema di CATS (untuk desain tema/template, bukan client)
//  featured : true = tampil juga di bagian "Koleksi Undangan Kami" pada beranda
//  title    : (opsional) nama kartu di katalog; default "<Kategori> 01, 02, ..."
//  shots    : (opsional) [screenshot cover, screenshot halaman lain] untuk 2 ponsel di katalog;
//             jika kosong, ponsel digambar otomatis dari foto `img`
export const D = [
  {
    n: "Rere & Jabal",
    d: "30 Desember 2026",
    tag: "Navy Elegant",
    client: true,
    featured: true,
    url: `${SITE}/wedding-rere-jabal/`,
    img: `${SITE}/wedding-rere-jabal/img/4.jpg`,
  },
  {
    n: "Ihsan & Ai Liana",
    d: "11 Oktober 2026",
    tag: "Soft Blue Classic",
    client: true,
    featured: true,
    url: `${SITE}/wedding-ihsan-ai-liana/`,
    img: `${SITE}/wedding-ihsan-ai/img/grt/1.webp`,
  },
  {
    n: "Icha & Ridwan",
    d: "12 Desember 2026",
    tag: "Minimalist Elegant",
    client: true,
    url: `${SITE}/wedding-icha-ridwan/`,
    img: "https://images.unsplash.com/photo-1646325311277-0c35409fdd57?auto=format&fit=crop&q=75&w=900&h=1400", // ganti dengan foto cover asli client
  },
  {
    n: "Emily & Daniel",
    d: "16 Januari 2027",
    tag: "Minimalist Elegant",
    cat: "minimalist-elegant",
    shots: [elegant01Cover, elegant01Gallery],
    url: `${SITE}/minimalist-elegant-01/`,
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=75&w=900&h=1400",
  },
  {
    n: "Icha & Ridwan",
    d: "12 Desember 2026",
    tag: "Minimalist Elegant",
    cat: "minimalist-elegant",
    shots: [elegant02Cover, elegant02Gallery],
    url: `${SITE}/minimalist-elegant-02/`,
    img: "https://images.unsplash.com/photo-1517456215183-9a2c3a748d0c?auto=format&fit=crop&q=75&w=900&h=1400", // ganti dengan foto cover asli
  },
];

// Angka di kartu kecil pada hero. Default dihitung otomatis dari data `D` di atas.
// Jika jumlah sebenarnya lebih banyak daripada yang dipajang di katalog, ganti manual,
// mis. clients: 25
export const STATS = {
  themes: D.filter((x) => !x.client && x.cat).length, // tema/template tersedia
  clients: D.filter((x) => x.client).length, // undangan client yang telah dibuat
};
/* ===================================== */

// Testimoni client — tambah di sini. Bagian "Testimoni" otomatis muncul di beranda
// setelah ada minimal 1 data, dan tersembunyi jika kosong.
//  name    : nama client (mis. "Rere & Jabal")
//  comment : isi testimoni (pakai kata-kata asli client / dengan izin mereka)
//  theme   : nama tema yang dipilih (tampil sebagai label)
//  photo   : (opsional) foto client — nama file di public/testimoni/ (mis. "rere-jabal.webp")
//            atau URL lengkap. Jika kosong, tampil inisial nama.
//  url     : (opsional) link undangan client; label tema jadi bisa diklik
//  rating  : (opsional) 1–5; bintang hanya tampil jika diisi
export const TESTIMONIALS = [
  // Contoh format (hapus tanda komentar & ganti dengan data asli):
  // {
  //   name: "Rere & Jabal",
  //   comment: "Isi testimoni dari client...",
  //   theme: "Navy Elegant",
  //   photo: "rere-jabal.webp",
  //   url: `${SITE}/wedding-rere-jabal/`,
  //   rating: 5,
  // },
];

// Contoh PRATINJAU — hanya tampil saat `npm run dev`, tidak ikut ke build/produksi.
export const TESTIMONIALS_SAMPLE = [
  {
    name: "Nama Client",
    comment:
      "Contoh testimoni: prosesnya cepat, undangannya cantik, dan tamu kami banyak yang memuji.",
    theme: "Minimalist Elegant",
    rating: 5,
  },
  {
    name: "Nama Client Dua",
    comment: "Contoh testimoni kedua untuk melihat susunan kartu.",
    theme: "Navy Elegant",
    rating: 5,
  },
  {
    name: "Nama Client Tiga",
    comment: "Contoh testimoni ketiga. Ganti dengan komentar asli client.",
    theme: "Soft Blue Classic",
  },
  {
    name: "Nama Client Tiga",
    comment: "Contoh testimoni ketiga. Ganti dengan komentar asli client.",
    theme: "Soft Blue Classic",
  },
  {
    name: "Nama Client Tiga",
    comment: "Contoh testimoni ketiga. Ganti dengan komentar asli client.",
    theme: "Soft Blue Classic",
  },
  {
    name: "Nama Client Tiga",
    comment: "Contoh testimoni ketiga. Ganti dengan komentar asli client.",
    theme: "Soft Blue Classic",
  },
  {
    name: "Nama Client Tiga",
    comment: "Contoh testimoni ketiga. Ganti dengan komentar asli client.",
    theme: "Soft Blue Classic",
  },
  {
    name: "Nama Client Tiga",
    comment: "Contoh testimoni ketiga. Ganti dengan komentar asli client.",
    theme: "Soft Blue Classic",
  },
  {
    name: "Nama Client Tiga",
    comment: "Contoh testimoni ketiga. Ganti dengan komentar asli client.",
    theme: "Soft Blue Classic",
  },
];

// Form testimoni (halaman rahasia /form-testimoni/, tidak ditautkan dari mana pun).
// endpoint: URL Web App Google Apps Script (lihat apps-script/SETUP.md). Kosong = form belum aktif.
export const TESTIMONI_FORM = {
  endpoint:
    "https://script.google.com/macros/s/AKfycbyvkaBnJwiYsHhyOucF7NtcgYEVj5BJb_Aop1lChzv8Sbd0hwDFGg3gMT5p78tPMVtrBw/exec",
  photoMaxPx: 600, // foto diperkecil di browser sebelum dikirim
};
