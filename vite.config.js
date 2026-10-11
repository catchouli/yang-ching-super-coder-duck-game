import { defineConfig } from "vite";

// Relative asset paths, so the build works from any subfolder (like a GitHub Pages project site).
export default defineConfig({
  base: "./"
});
