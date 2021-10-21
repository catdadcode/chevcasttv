import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
const env = dotenv.config({ path: ".env.local" });
dotenvExpand(env);

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

const log = logger.extend("SERVER");

const {
  APP_URL,
  NODE_ENV,
  DISCORD_CHEVCAST_LIVESTREAM_VOICE_CHANNEL_ID,
  DISCORD_WATERCOOLER_LIVESTREAM_VOICE_CHANNEL_ID,
  TWITCH_CHANNELS
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
  await new Chatbot({
    twitchChannels: TWITCH_CHANNELS.split(","),
    discordChannelIds: [
      DISCORD_WATERCOOLER_LIVESTREAM_VOICE_CHANNEL_ID,
      DISCORD_CHEVCAST_LIVESTREAM_VOICE_CHANNEL_ID
    ]
  }).initialize();
  console.log("> Chatbots are now active.");

})().catch(console.log);