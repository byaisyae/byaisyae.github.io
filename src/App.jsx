import { useEffect } from "react";
import AOS from "aos";
import Home from "./pages/Home";
import CatalogPage from "./pages/CatalogPage";
import NotFound from "./pages/NotFound";

// Rute sederhana tanpa router: "/" → beranda, "/katalog/" → katalog, selain itu → 404.
// Di GitHub Pages, 404.html (salinan index.html) memuat app ini untuk alamat yang tidak ada.
const route = () => {
  const base = import.meta.env.BASE_URL; // "/" atau "/nama-repo/"
  let p = location.pathname;
  if (p + "/" === base) p = base;
  p = p.startsWith(base) ? p.slice(base.length) : p;
  p = p.replace(/index\.html$/, "").replace(/\/+$/, "");
  if (p === "") return "home";
  if (p === "katalog") return "catalog";
  return "404";
};

export default function App() {
  const page = route();

  // animasi scroll (AOS), dimatikan jika pengguna memilih reduced motion
  useEffect(() => {
    if (page === "404") return;
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
  }, [page]);

  if (page === "home") return <Home />;
  if (page === "catalog") return <CatalogPage />;
  return <NotFound />;
}
