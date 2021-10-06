import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
const env = dotenv.config({ path: ".env.local" });
dotenvExpand(env);

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import config from "config";
import { initDb } from "db";
import debug from "debug";
import { initialize as initDiscord } from "./discordClient";
import { initialize as initGoogleTTS } from "./googleTTSClient";
import { initialize as initTwitch } from "./twitchClient";
import createChatbot from "./chatbot";

const log = debug("CHEVCASTTV:SERVER");

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
    initTwitch()
  ]);
  log("API clients ready.");


  log("Starting chatbot...");
  await Promise.all([
    createChatbot(
      "WATERCOOLER",
      TWITCH_CHANNELS.split(","),
      DISCORD_WATERCOOLER_LIVESTREAM_VOICE_CHANNEL_ID
    ),
    createChatbot(
      "CHEVCAST",
      TWITCH_CHANNELS.split(","),
      DISCORD_CHEVCAST_LIVESTREAM_VOICE_CHANNEL_ID
    )
  ]);
  console.log("> Chatbots are now active.");

})().catch(console.log);