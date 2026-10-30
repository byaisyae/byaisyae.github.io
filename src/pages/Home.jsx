import { useState } from "react";
import { C } from "../config";
import { loadSaved } from "../utils/storage";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Catalog from "../components/Catalog";
import Features from "../components/Features";
import Steps from "../components/Steps";
import Generator from "../components/Generator";
import Cta from "../components/Cta";
import Footer from "../components/Footer";
import WaFloat from "../components/WaFloat";

export default function Home() {
  // link undangan terpilih dipakai bersama oleh Katalog ("Buat Link") dan Generator
  const [base, setBase] = useState(() => loadSaved().base || C.base);

  return (
    <>
      <Header />
      <Hero />
      <Catalog onPick={setBase} />
      <Features />
      <Steps />
      <Generator base={base} setBase={setBase} />
      <Cta />
      <Footer />
      <WaFloat />
    </>
  );
}
