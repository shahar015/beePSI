// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Optional: configure dev server
    // port: 3000, // Example port for frontend
    // strictPort: true, // Fail if port is already in use
    // proxy: {
    //   // Optional: if you want to proxy API requests during development
    //   "/api": {
    //     target: "http://localhost:5001", // Your backend address
    //     changeOrigin: true,
    //     // rewrite: (path) => path.replace(/^\/api/, '') // if backend doesn't have /api prefix
    //   },
    // },
  },
});
