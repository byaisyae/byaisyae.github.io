/* Konfigurasi Tailwind (CDN) — warna & font kustom.
   Dimuat SETELAH cdn.tailwindcss.com dan SEBELUM konten halaman. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        n9: "#06122a",
        n8: "#0b1f3d",
        n7: "#12305c",
        sk: { 200: "#d6e4f8", 300: "#a9c6ee", 400: "#7fa8e0" },
      },
      fontFamily: {
        script: ['"Great Vibes"', "cursive"],
        serif: ['"Playfair Display"', "serif"],
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
};
