import { watch } from "node:fs";
import { rm } from "node:fs/promises";
import { join, normalize } from "node:path"

await rm("./dist", { recursive: true, force: true });

const compile = async (): Promise<Bun.BuildOutput> => {
    await rm("./dist", { recursive: true, force: true });

    return await Bun.build({
        entrypoints: ["./src/index.html"],
        minify: false,
        naming: {
            asset: "[name].[ext]",
            chunk: "[dir]/[name].[ext]",
            entry: "[dir]/[name].[ext]",
        },
        outdir: "./dist",
        sourcemap: "linked",
        splitting: false,
        target: "browser",
    });
};

let compiled = await compile();
let timeout = undefined as Timer | undefined;

const sockets = new Set<Bun.ServerWebSocket>();
const counters = new Map<string, number>();
watch("./src", { recursive: true }, (_event, file): void => {
    if (!file || !/\.(html|css|ts)$/.test(file)) {
        return;
    }

    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
        void (async () => {
            timeout = undefined;
            compiled = await compile();
            for (const socket of sockets) {
                const count = (counters.get(socket.remoteAddress) ?? 0) + 1;
                console.log(socket.remoteAddress, `refreshed (x${count})`);
                socket.send("reload");
                counters.set(socket.remoteAddress, count);
            }
        })();
    }, 1000);
});

const WEBSOCKET_SCRIPT = `
<script>
    const ws = new WebSocket("ws://" + location.host + "/hmr");
    ws.onmessage = (event) => {
        if (event.data === "reload") {
            location.reload();
        }
    };
</script>
`;

const assets = join(import.meta.dir, "assets");
const server = Bun.serve({
    development: true,
    websocket: {
        open(ws) {
            console.log(ws.remoteAddress, "connected");
            sockets.add(ws);
        },
        close(ws) {
            console.log(ws.remoteAddress, "disconnected");
            sockets.delete(ws);
        },
        message(ws, message) {
            console.log(ws, message);
        },
    },
    async fetch(request): Promise<Response> {
        const url = new URL(request.url);
        if (url.pathname === "/hmr") {
            if (!server.upgrade(request)) {
                return new Response("Upgrade failed", { status: 400 });
            }
        }

        if (url.pathname.startsWith("/assets/")) {
            const relative = normalize(url.pathname.replace(/^\/assets\//, ""));
            if (relative.startsWith("..")) {
                return new Response("Forbidden", { status: 403 });
            }

            const file = Bun.file(join(assets, relative));
            if (await file.exists()) {
                return new Response(file);
            }

            return new Response("Asset not found", { status: 404 });
        }

        const artifact = compiled.outputs.find(item => url.pathname.endsWith(item.path.split("/").at(-1) ?? ""));
        if (artifact) {
            const file = artifact.path.split("/").at(-1);
            if (file === "index.html") {
                const html = (await artifact.text()).replace("</body>", `${WEBSOCKET_SCRIPT}</body>`);
                return new Response(html, { headers: { "Content-Type": "text/html" } });
            }

            return new Response(artifact, { headers: { "Content-Type": artifact.type } });
        }

        return new Response("Asset not found", { status: 404 });
    },
});

console.log(`Server running at ${server.url.href}index.html`);
