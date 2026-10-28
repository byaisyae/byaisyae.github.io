/* generator */
const K = "aisyae-gen",
  S = JSON.parse(localStorage.getItem(K) || "{}");
$("#base").value = S.base || C.base;
$("#names").value = S.names ?? "Aisyae Invitation\nMC Abuy";
$("#msg").value = S.msg || C.msg;
const phone = (p) => {
  p = (p || "").replace(/\D/g, "");
  return p.replace(/^0/, "62");
};
const copyTxt = (t, ok) => {
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
};
let R = [];
const render = () => {
  localStorage.setItem(
    K,
    JSON.stringify({
      base: $("#base").value,
      names: $("#names").value,
      msg: $("#msg").value,
    }),
  );
  let base;
  try {
    base = new URL($("#base").value.trim());
  } catch (_) {
    base = null;
  }
  $("#err").classList.toggle("hidden", !!base);
  R = !base
    ? []
    : $("#names")
        .value.split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [n, p] = l.split("|").map((x) => x.trim());
          const u = new URL(base);
          u.searchParams.set("to", n);
          const link = u.toString();
          const m = $("#msg")
            .value.replaceAll("{nama}", n)
            .replaceAll("{link}", link);
          return {
            n,
            link,
            m,
            wa: `https://wa.me/${phone(p)}?text=${encodeURIComponent(m)}`,
          };
        });
  $("#cnt").textContent = R.length ? `(${R.length} tamu)` : "";
  $("#out").innerHTML =
    R.map(
      (
        r,
        i,
      ) => `<div class="rounded-2xl border border-sk-300/25 bg-n9/70 p-4"><p class="font-medium text-white">${esc(r.n)}</p><p class="text-xs text-sk-300 break-all my-2">${esc(r.link)}</p>
 <div class="flex flex-wrap gap-2 text-sm"><button data-a="l" data-i="${i}" class="px-4 py-2 rounded-full bg-sk-300 text-n9 font-medium">Salin Link</button><button data-a="m" data-i="${i}" class="px-4 py-2 rounded-full border border-sk-300/50 hover:bg-sk-300/10">Salin Pesan</button><a href="${r.wa}" target="_blank" rel="noopener" class="px-4 py-2 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-400">Kirim WhatsApp</a></div></div>`,
    ).join("") ||
    '<p class="text-center text-sm text-sk-300/70 py-6">Belum ada nama tamu.</p>';
};
document.addEventListener("click", (e) => {
  const k = e.target.closest(".pk");
  if (k) {
    $("#base").value = k.dataset.u;
    render();
  }
});
["#base", "#names", "#msg"].forEach((s) =>
  $(s).addEventListener("input", render),
);
$("#out").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const r = R[b.dataset.i],
    t = b.textContent;
  copyTxt(b.dataset.a === "l" ? r.link : r.m, () => {
    b.textContent = "Tersalin ✓";
    setTimeout(() => (b.textContent = t), 1500);
  });
});
$("#all").onclick = (e) => {
  const b = e.target;
  copyTxt(R.map((r) => `${r.n}: ${r.link}`).join("\n"), () => {
    b.textContent = "Tersalin ✓";
    setTimeout(() => (b.textContent = "Salin Semua Link"), 1500);
  });
};
render();
