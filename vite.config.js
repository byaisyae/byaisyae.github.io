import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "/"  → situs di root domain (username.github.io)
// Jika situs ada di sub-folder repo (username.github.io/nama-repo/), ganti menjadi "/nama-repo/".
export default defineConfig({
  base: "/",
  plugins: [react()],
});
