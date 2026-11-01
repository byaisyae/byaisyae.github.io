import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "/"  → situs di root domain (https://saevitation.com/)
// Jika situs dipindah ke sub-folder (domain.com/nama-folder/), ganti menjadi "/nama-folder/".
export default defineConfig({
  base: "/",
  plugins: [react()],
});
