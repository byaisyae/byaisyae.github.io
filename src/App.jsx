import { useEffect } from "react";
import AOS from "aos";
import Home from "./pages/Home";
import CatalogPage from "./pages/CatalogPage";
import FaqPage from "./pages/FaqPage";
import AddOnPage from "./pages/AddOnPage";
import TestimoniFormPage from "./pages/TestimoniFormPage";
import TestimoniPage from "./pages/TestimoniPage";
import NotFound from "./pages/NotFound";

// Rute sederhana tanpa router: "/" → beranda, "/katalog/", "/faq/", "/add-on/", "/testimoni/", "/form-testimoni/", selain itu → 404.
// Di GitHub Pages, 404.html (salinan index.html) memuat app ini untuk alamat yang tidak ada.
const route = () => {
  const base = import.meta.env.BASE_URL; // "/" atau "/nama-repo/"
  let p = location.pathname;
  if (p + "/" === base) p = base;
  p = p.startsWith(base) ? p.slice(base.length) : p;
  p = p.replace(/index\.html$/, "").replace(/\/+$/, "");
  if (p === "") return "home";
  if (p === "katalog") return "catalog";
  if (p === "faq") return "faq";
  if (p === "add-on") return "addon";
  if (p === "testimoni") return "testimoni";
  if (p === "form-testimoni") return "testimoni-form"; // halaman rahasia, tanpa tautan
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
  if (page === "faq") return <FaqPage />;
  if (page === "addon") return <AddOnPage />;
  if (page === "testimoni") return <TestimoniPage />;
  if (page === "testimoni-form") return <TestimoniFormPage />;
  return <NotFound />;
}
