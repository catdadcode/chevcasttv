import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import config from "config";
import { initialize as initDb } from "db";
import logger from "./logger";
import { initialize as initDiscord } from "./api-clients/discordClient";
import { initialize as initGoogleTTS } from "./api-clients/googleTTSClient";
import { initialize as initTwitch } from "./api-clients/twitchClient";
import { initialize as initRestream } from "./api-clients/restreamClient";
import Chatbot from "./chatbot";
import RestreamChatbot from "./restream-chatbot";

const log = logger.extend("SERVER");

const {
  APP_URL,
  NODE_ENV
} = config;

(async () => {

  log("Initializing database...");
  await initDb();

  log("Preparing nextjs app...");
  const app = next({ dev: NODE_ENV !== "production"});
  const handle = app.getRequestHandler();
  await app.prepare();

  log("Starting http server...");
  const server = createServer((req, res) => {
    if (req.url === "/health") {
      res.statusCode = 200;
      res.write("Ok\n");
      res.end();
      return;
    }
    const parsedUrl = parse(req.url ?? "", true);
    handle(req, res, parsedUrl);
  });
  await server.listen(3000);
  console.log(`> ChevCastTV is running at ${APP_URL} in ${NODE_ENV} mode.`);

  log("Initializing API clients...");
  await Promise.all([
    initDiscord(),
    initGoogleTTS(),
    initTwitch(),
    initRestream()
  ]);
  log("API clients ready.");

  log("Starting chatbot...");
  if (NODE_ENV === "production") {
    await Promise.all([
      new RestreamChatbot({
        discordChannelIds: ["752398756229677171"]
      }).initialize(),
      // new Chatbot({
      //   twitchChannels: ["chevcast"],
      //   discordChannelIds: ["752398756229677171"]
      // }).initialize(),
      new Chatbot({
        twitchChannels: ["dollzie"],
        discordChannelIds: ["709836347548106785"]
      }).initialize(),
      new Chatbot({
        twitchChannels: ["ember_stone"],
        discordChannelIds: ["892242868406714373"]
      }).initialize(),
      new Chatbot({
        twitchChannels: ["alopex_art"],
        discordChannelIds: ["816050882818474088"]
      }).initialize(),
      new Chatbot({
        twitchChannels: ["jaded_ember"],
        discordChannelIds: ["850127846215122954"]
      }).initialize()
    ]);
  } else {
    // await new Chatbot({
    //   twitchChannels: ["chevcast"],
    //   discordChannelIds: ["752398756229677171"]
    // }).initialize();
    await new RestreamChatbot({
      discordChannelIds: ["752398756229677171"]
    }).initialize();
  }
  console.log("> Chatbots are now active.");

})().catch(console.log);