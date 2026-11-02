import { useEffect } from "react";
import Header from "../components/Header";
import AddOn from "../components/AddOn";
import Cta from "../components/Cta";
import Footer from "../components/Footer";
import WaFloat from "../components/WaFloat";

export default function AddOnPage() {
  useEffect(() => {
    document.title = "Add On — Layanan Tambahan | Aisyae Digital Invitation";
  }, []);

  return (
    <>
      <Header />
      <main className="pt-[calc(4rem+var(--bar))]">
        <AddOn />
      </main>
      <Cta />
      <Footer />
      <WaFloat />
    </>
  );
}
