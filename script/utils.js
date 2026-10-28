/* Helper umum: selector, escape HTML, link WhatsApp */
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const WA = (m) =>
  "https://wa.me/" + C.wa + "?text=" + encodeURIComponent(m);
// isi href semua elemen [data-wa="namaPesan"] dengan link WhatsApp + pesannya
const bindWa = () =>
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = WA(C[a.dataset.wa]);
    a.target = "_blank";
    a.rel = "noopener";
  });
