import { createServer } from "http";
import { parse } from "url";
import next from "next";
import config from "utils/config";

const { APP_URL, NODE_ENV } = config;

(async () => {

  // Configure nextjs app.
  const app = next({ dev: NODE_ENV !== "production"});
  const handle = app.getRequestHandler();
  await app.prepare();

  // Start http server
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "", true);
    handle(req, res, parsedUrl);
  });
  await server.listen(3000);
  console.log(`> ChevCastTV is running at ${APP_URL} in ${NODE_ENV} mode.`);

  // Initialize Chevbot

})().catch(console.log);