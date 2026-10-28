/* Halaman 404: tampilkan alamat yang dibuka & aktifkan tombol WhatsApp */
(() => {
  const p = $("#path");
  if (p) p.textContent = location.pathname + location.search + location.hash;
  $("#yr").textContent = new Date().getFullYear();
  bindWa();
})();
