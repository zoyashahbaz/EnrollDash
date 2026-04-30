import * as esbuild from "esbuild";
import { resolve } from "path";

esbuild.build({
  entryPoints: ["server.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  outfile: "dist/server.mjs",
  format: "esm",
  external: ["express", "better-sqlite3", "simple-statistics", "vite", "path", "url", "fs"],
}).catch(() => process.exit(1));
