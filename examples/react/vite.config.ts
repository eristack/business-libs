import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:3001",
      "/me": "http://localhost:3001",
      "/orders": "http://localhost:3001",
      "/health": "http://localhost:3001",
    },
  },
});
