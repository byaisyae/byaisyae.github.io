// Screenshot tampilan undangan untuk kartu katalog (cover + galeri)
import elegant01Cover from "./assets/catalog/elegant-01-cover.png";
import elegant01Gallery from "./assets/catalog/elegant-01-gallery.png";
import elegant02Cover from "./assets/catalog/elegant-02-cover.png";
import elegant02Gallery from "./assets/catalog/elegant-02-gallery.png";

/* ===== PENGATURAN — edit di sini ===== */
export const C = {
  wa: "6282233505516", // nomor WhatsApp admin (format internasional, tanpa + atau 0 di depan)
  // pesan otomatis saat tombol WhatsApp diklik
  msgOrder: `Halo Aisyae Digital Invitation 👋\n\nSaya ingin memesan undangan pernikahan digital. Mohon info paket, harga, dan prosesnya ya.\n\nNama mempelai:\nTanggal acara:\nDesain yang diminati:\n\nTerima kasih 🙏`,
  msgCustom: `Halo Aisyae Digital Invitation 👋\n\nSaya ingin memesan undangan digital dengan desain custom. Berikut konsep yang saya inginkan (warna / tema / animasi):\n\nBisa kita diskusikan? Terima kasih 🙏`,
  msgHelp: `Halo Aisyae Digital Invitation 👋\n\nSaya membuka link undangan tetapi halamannya tidak ditemukan (404). Mohon bantuannya ya 🙏`,
  base: "https://byaisyae.github.io/wedding-rere-jabal/",
  demo: "https://byaisyae.github.io/wedding-rere-jabal/?to=Tamu+Spesial", // tombol "Lihat Contoh Undangan" di hero
  msg: `Assalamualaikum Wr. Wb.\n\nKepada Yth. {nama},\n\nDengan penuh rasa syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.\n\nBuka undangan digital kami di sini:\n{link}\n\nMerupakan kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu. Terima kasih 🙏`,
};

// Kategori katalog — tambah/ubah kategori & pricelist di sini.
// "price" opsional: { was: harga coret, now: harga promo }
export const CATS = [
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

// Koleksi desain — tambah desain baru di sini
//  cat      : id kategori di CATS (kosongkan jika tidak masuk kategori)
//  featured : true = tampil juga di bagian "Koleksi Undangan Kami" pada beranda
//  title    : (opsional) nama kartu di katalog; default "<Kategori> 01, 02, ..."
//  shots    : (opsional) [screenshot cover, screenshot halaman lain] untuk 2 ponsel di katalog;
//             jika kosong, ponsel digambar otomatis dari foto `img`
export const D = [
  {
    n: "Rere & Jabal",
    d: "30 Desember 2026",
    tag: "Navy Elegant",
    featured: true,
    url: "https://byaisyae.github.io/wedding-rere-jabal/",
    img: "https://byaisyae.github.io/wedding-rere-jabal/img/4.jpg",
  },
  {
    n: "Ihsan & Ai Liana",
    d: "11 Oktober 2026",
    tag: "Soft Blue Classic",
    featured: true,
    url: "https://isanmh.github.io/wedding/",
    img: "https://isanmh.github.io/wedding/img/grt/1.webp",
  },
  {
    n: "Emily & Daniel",
    d: "16 Januari 2027",
    tag: "Minimalist Elegant",
    cat: "minimalist-elegant",
    shots: [elegant01Cover, elegant01Gallery],
    url: "https://byaisyae.github.io/minimalist-elegant-01/",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=75&w=900&h=1400",
  },
  {
    n: "Icha & Ridwan",
    d: "12 Desember 2026",
    tag: "Minimalist Elegant",
    cat: "minimalist-elegant",
    shots: [elegant02Cover, elegant02Gallery],
    url: "https://byaisyae.github.io/minimalist-elegant-02/",
    img: "https://images.unsplash.com/photo-1517456215183-9a2c3a748d0c?auto=format&fit=crop&q=75&w=900&h=1400", // ganti dengan foto cover asli
  },
];
/* ===================================== */
