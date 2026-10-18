import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites under /Music/, not at domain root.
  base: "/Music/",
  server: { host: "0.0.0.0" },
});
