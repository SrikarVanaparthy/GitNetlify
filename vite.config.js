export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist", // Ensure the output directory is set correctly
  },
});
