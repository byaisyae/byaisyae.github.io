/** Salin teks ke clipboard (dengan fallback untuk browser/konteks non-HTTPS). */
export function copyText(t, ok) {
  const fb = () => {
    const a = document.createElement("textarea");
    a.value = t;
    a.style.cssText = "position:fixed;left:-9999px";
    document.body.appendChild(a);
    a.select();
    let g = false;
    try {
      g = document.execCommand("copy");
    } catch (_) {}
    a.remove();
    g ? ok() : prompt("Salin manual:", t);
  };
  navigator.clipboard && window.isSecureContext
    ? navigator.clipboard.writeText(t).then(ok, fb)
    : fb();
}
