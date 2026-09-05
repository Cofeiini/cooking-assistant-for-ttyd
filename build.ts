import { cp } from "node:fs/promises";

await Bun.build({
    entrypoints: ["./src/index.html"],
    minify: true,
    naming: {
        asset: "[hash].[ext]",
        chunk: "[hash].[ext]",
        entry: "[name].[ext]",
    },
    outdir: "./dist",
    sourcemap: "none",
    splitting: true,
    target: "browser",
});

await cp("./assets", "./dist/assets", { recursive: true });
