import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/Unnathi_Teleradiology_Frontend/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["dicom-parser"],
  },
  server: {
    proxy: {
      "/orthanc-pacs": {
        target: "http://localhost:8042",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/orthanc-pacs/, ""),
      },
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
