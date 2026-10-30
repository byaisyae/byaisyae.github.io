/** Konfigurasi Tailwind — warna & font kustom (sama seperti versi CDN sebelumnya). */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
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
  plugins: [],
};
