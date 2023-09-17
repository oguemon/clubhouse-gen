/** @type {import('vite').UserConfig} */
export default {
  build: {
    rollupOptions: {
      input: "ts/main.ts",
      output: {
        entryFileNames: `main.js`,
      },
    },
    emptyOutDir: false,
    outDir: "",
    assetsDir: "",
  },
};
