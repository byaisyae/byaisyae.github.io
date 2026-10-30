import { useEffect } from "react";
import AOS from "aos";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Beranda hanya untuk "/" (atau "/index.html"); alamat lain → halaman 404.
// Di GitHub Pages, 404.html (salinan index.html) memuat app ini untuk alamat yang tidak ada.
const isHome = () => {
  const base = import.meta.env.BASE_URL; // "/" atau "/nama-repo/"
  const p = location.pathname;
  return p === base || p === base.replace(/\/$/, "") || p === base + "index.html";
};

export default function App() {
  const home = isHome();

  // animasi scroll (AOS), dimatikan jika pengguna memilih reduced motion
  useEffect(() => {
    if (!home) return;
    try {
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        AOS.init({
          duration: 800,
          easing: "ease-out-cubic",
          once: false,
          mirror: true,
          offset: 70,
        });
        document.documentElement.classList.add("aos-on");
      }
    } catch (_) {}
  }, [home]);

  return home ? <Home /> : <NotFound />;
}
