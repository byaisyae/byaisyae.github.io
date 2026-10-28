/* Navbar mobile, tahun footer, dan tombol-tombol WhatsApp */
const mm = $("#mm"),
  mb = $("#mnu"),
  hd = $("#hd");
const icOpen = $("#icOpen"),
  icClose = $("#icClose");
const setMenu = (o) => {
  mm.classList.toggle("hidden", !o);
  icOpen.classList.toggle("hidden", o);
  icClose.classList.toggle("hidden", !o);
  mb.setAttribute("aria-expanded", o);
  mb.setAttribute("aria-label", o ? "Tutup menu" : "Buka menu");
};
mb.addEventListener("click", (e) => {
  e.stopPropagation();
  setMenu(mm.classList.contains("hidden"));
});
mm.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});
document.addEventListener("click", (e) => {
  if (!hd.contains(e.target)) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});
matchMedia("(min-width:768px)").addEventListener("change", (e) => {
  if (e.matches) setMenu(false);
});
$("#yr").textContent = new Date().getFullYear();

document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = WA(C[a.dataset.wa]);
  a.target = "_blank";
  a.rel = "noopener";
});
