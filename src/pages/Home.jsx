import { useEffect, useState } from "react";
import { C } from "../config";
import { savedBase } from "../utils/storage";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Catalog from "../components/Catalog";
import Testimonials from "../components/Testimonials";
import Features from "../components/Features";
import Steps from "../components/Steps";
import Generator from "../components/Generator";
import Cta from "../components/Cta";
import Footer from "../components/Footer";
import WaFloat from "../components/WaFloat";
import PromoPopup from "../components/PromoPopup";

export default function Home() {
  // link undangan terpilih dipakai bersama oleh Katalog ("Buat Link") dan Generator
  const [base, setBase] = useState(() => savedBase() || C.base);

  // Saat dibuka dari halaman lain (mis. /katalog/ → /#generator), isi halaman baru dirender
  // oleh React setelah browser mencoba scroll ke #hash, sehingga tujuan belum ada.
  // Scroll ulang ke section setelah halaman tampil.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const go = () =>
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    go();
    const t = setTimeout(go, 400); // koreksi setelah gambar/animasi selesai memuat
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Header />
      <Hero />
      <Catalog onPick={setBase} />
      <Testimonials />
      <Features />
      <Steps />
      <Generator base={base} setBase={setBase} />
      <Cta />
      <Footer />
      <WaFloat />
      <PromoPopup />
    </>
  );
}
