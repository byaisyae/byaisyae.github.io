import { useEffect } from "react";
import Header from "../components/Header";
import Faq from "../components/Faq";
import Cta from "../components/Cta";
import Footer from "../components/Footer";
import WaFloat from "../components/WaFloat";

export default function FaqPage() {
  useEffect(() => {
    document.title = "F.A.Q — Pertanyaan Umum | Aisyae Digital Invitation";
  }, []);

  return (
    <>
      <Header />
      <main className="pt-16">
        <Faq />
      </main>
      <Cta />
      <Footer />
      <WaFloat />
    </>
  );
}
