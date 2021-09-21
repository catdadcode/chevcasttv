// server.js
import { createServer } from "http";
import { parse } from "url";
import next from "next";

const { NODE_ENV, PORT } = process.env;

const dev = NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "", true)
    handle(req, res, parsedUrl);
  }).listen(PORT ?? 3000, () => {
    console.log(`> Ready on http://localhost:${PORT ?? 3000}`)
  });
})