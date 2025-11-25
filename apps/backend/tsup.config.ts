import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
 
  external: ["@repo/auth"], // <- KEEP EXTERNAL
  clean: true,
});
