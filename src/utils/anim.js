// animasi kartu: di layar kecil semuanya fade-up
export const AN = matchMedia("(max-width:767px)").matches
  ? ["fade-up", "fade-up", "fade-up"]
  : ["fade-right", "zoom-in", "fade-left"];
