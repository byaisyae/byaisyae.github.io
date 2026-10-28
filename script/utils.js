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
