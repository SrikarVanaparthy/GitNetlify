import { defineConfig } from 'vite'; // Ensure this is imported
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist", // Ensure the output directory is set correctly
  },
});
