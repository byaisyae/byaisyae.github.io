/* Konten statis: daftar keunggulan & langkah pemesanan */
export const F = [
  [
    "💌",
    "Nama Tamu Personal",
    "Setiap tamu disapa dengan namanya sendiri — terasa istimewa, bukan sekadar broadcast.",
  ],
  [
    "♾️",
    "Unlimited Share Undangan",
    "Bagikan ke sebanyak apa pun tamu, tanpa batas jumlah, lewat WhatsApp maupun media sosial.",
  ],
  [
    "⏳",
    "Hitung Mundur Acara",
    "Hitung mundur hari, jam, menit, dan detik menuju hari bahagia Anda.",
  ],
  [
    "📍",
    "Peta & Detail Acara",
    "Lokasi lewat Google Maps, jam, dan jadwal dalam satu halaman. Tamu tidak lagi bingung mencari tempat.",
  ],
  [
    "✅",
    "RSVP & Ucapan Doa",
    "Konfirmasi kehadiran dan kolom ucapan terkumpul rapi, tanpa repot rekap manual.",
  ],
  [
    "🎁",
    "Amplop Digital & Kado",
    "Nomor rekening dan alamat kado bisa disalin dengan satu ketukan.",
  ],
  [
    "📸",
    "Galeri & Cerita Cinta",
    "Pamerkan foto prewedding dan perjalanan kisah kalian secara elegan.",
  ],
  [
    "🎶",
    "Musik Latar",
    "Suasana romantis langsung terasa begitu undangan dibuka.",
  ],
  [
    "🎬",
    "Video Prewedding & Live Streaming",
    "Sematkan video prewedding dan link live streaming agar tamu yang jauh tetap bisa menyaksikan.",
  ],
  [
    "🗓️",
    "Masa Aktif Panjang",
    "Undangan tetap bisa dibuka selama layanan Saevitation masih berjalan.",
  ],
  [
    "📱",
    "Nyaman di Semua Layar",
    "Tampil memukau di HP, tablet, maupun komputer.",
  ],
  [
    "🌿",
    "Hemat & Ramah Lingkungan",
    "Tanpa cetak, tanpa ongkir, tanpa limbah — cukup satu link.",
  ],
];

export const STEPS = [
  [
    "1",
    "Pilih Desain",
    "Tentukan tema undangan yang paling mewakili kisah cinta Anda.",
  ],
  [
    "2",
    "Kirim Data & Foto",
    "Cukup siapkan nama, jadwal, lokasi, dan foto — sisanya kami rapikan.",
  ],
  [
    "3",
    "Bagikan Link",
    "Buat link personal tiap tamu lewat generator di bawah, lalu kirim ke WhatsApp.",
  ],
];

/* ===== F.A.Q & Add On =====
 * PENTING: isi di bawah (harga, batas revisi, refund, lama pengerjaan, masa aktif) adalah
 * nilai awal yang mengacu ke situs referensi. Sesuaikan dengan ketentuan Saevitation
 * yang sebenarnya sebelum dipublikasikan.
 * a: string = satu paragraf, array = daftar poin.
 */
export const FAQ = [
  {
    q: "Benarkah Undangan Aktif Selamanya?",
    a: "Undangan Anda tetap aktif selama layanan Saevitation masih beroperasi.",
  },
  {
    q: "Cara Pemesanan",
    a: "Pemesanan dilakukan lewat admin WhatsApp kami. Pilih desain di katalog, klik tombol Pesan, lalu kirimkan data dan foto Anda kepada admin.",
  },
  {
    q: "Nikah Masih Lama tapi Mau Pesan Sekarang",
    a: "Boleh sekali. Undangan tidak memiliki tanggal kedaluwarsa, jadi Anda bisa memesan jauh-jauh hari sekaligus mengamankan slot pengerjaan lebih awal.",
  },
  {
    q: "Lama Pengerjaan",
    a: "Preview undangan kami kirim paling lambat 2 hari kerja sejak data lengkap kami terima (hari Minggu dan tanggal merah tidak dihitung). Butuh lebih cepat? Pilih add on pengerjaan prioritas.",
  },
  {
    q: "Penempatan Foto dalam Undangan",
    a: "Penempatan foto mengikuti permintaan Anda saat pemesanan dan akan dipandu oleh tim kami.",
  },
  {
    q: "Batas Revisi",
    a: [
      "Revisi penempatan foto: 2 kali.",
      "Revisi penempatan foto lebih dari 2 kali dikenakan biaya Rp 50.000 per revisi.",
      "Revisi typo, redaksi, amplop digital, lokasi Google Maps, dan jadwal pernikahan: tanpa batas.",
      "Revisi dapat dilakukan paling lambat H-1 acara pernikahan; setelah itu undangan tidak bisa direvisi lagi.",
    ],
  },
  {
    q: "Menghilangkan Bagian yang Tidak Digunakan",
    a: "Bagian yang tidak Anda perlukan, misalnya galeri atau love story, bisa dihilangkan dari undangan.",
  },
  {
    q: "Ganti Tema",
    a: "Tema tidak dapat diganti setelah undangan mulai dikerjakan oleh tim kami.",
  },
  {
    q: "Masa Aktif Undangan",
    a: "Masa aktif undangan adalah selamanya, selama layanan Saevitation masih beroperasi.",
  },
  {
    q: "Refund (Pengembalian Dana)",
    a: [
      "Refund dapat diajukan sebelum pengerjaan undangan dimulai.",
      "Setelah pengerjaan dimulai, refund tidak dapat dilakukan.",
    ],
  },
  {
    q: "Ubah Tone",
    a: "Tone warna tema Minimalist Elegant dan Minimalist Aesthetic dapat diubah dengan biaya tambahan Rp 75.000.",
  },
];

export const ADDONS = [
  {
    title: "Durasi Pengerjaan",
    note: "Hari Minggu dan tanggal merah tidak dihitung dalam jadwal pengerjaan.",
    items: [
      { name: "Pengerjaan prioritas 24 jam", price: "75.000" },
      { name: "Pengerjaan prioritas 12 jam", price: "100.000" },
      { name: "Pengerjaan prioritas 6 jam", price: "125.000" },
    ],
  },
  {
    title: "Lain-lain",
    items: [
      { name: "Ganti background tema tanpa foto", price: "50.000" },
      { name: "Ganti font (rekomendasi Google Fonts)", price: "50.000" },
      { name: "Ganti tone undangan", price: "75.000" },
    ],
  },
];
