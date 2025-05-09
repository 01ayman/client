import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  // server: {
  //   headers: {
  //     "Cross-Origin-Embedder-Policy": "require-corp",
  //     "Cross-Origin-Opener-Policy": "same-origin",
  //   },
  //   mimeTypes: {
  //     wasm: "application/wasm",
  //   },
  // },
  base:
    process.env.VITE_ENVIRONMENT === "production"
      ? "https://01ayman.github.io/client"
      : "/",
});
