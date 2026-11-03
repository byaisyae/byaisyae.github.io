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
        // dashboard admin (tema terang, mengikuti template dashboard)
        adm: {
          primary: "#165DFF",
          hover: "#0E4BD9",
          fg: "#080C1A",
          sec: "#6A7686",
          muted: "#EFF2F7",
          line: "#E3E7EE",
          ok: "#30B22D",
          err: "#ED6B60",
          warn: "#FED71F",
        },
      },
      fontFamily: {
        script: ['"Great Vibes"', "cursive"],
        serif: ['"Playfair Display"', "serif"],
        sans: ["Poppins", "sans-serif"],
        lexend: ['"Lexend Deca"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
