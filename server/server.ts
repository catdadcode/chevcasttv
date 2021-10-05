import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import config from "config";
import { initDb } from "db";
import debug from "debug";
import createChatbot from "./chatbot";

const log = debug("CHEVCASTTV:SERVER");

const {
  APP_URL,
  NODE_ENV,
  DISCORD_CHEVCAST_GUILD_ID,
  DISCORD_CHEVCAST_LIVESTREAM_TEXT_CHANNEL_ID,
  DISCORD_CHEVCAST_LIVESTREAM_VOICE_CHANNEL_ID,
  DISCORD_WATERCOOLER_GUILD_ID,
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

  log("Starting chatbot...");
  await createChatbot(
    TWITCH_CHANNELS.split(","),
    DISCORD_WATERCOOLER_GUILD_ID,
    DISCORD_WATERCOOLER_LIVESTREAM_VOICE_CHANNEL_ID
  );
  await createChatbot(
    TWITCH_CHANNELS.split(","),
    DISCORD_CHEVCAST_GUILD_ID,
    DISCORD_CHEVCAST_LIVESTREAM_VOICE_CHANNEL_ID
  );
  console.log("> Chatbot active.");

  // log("Initializing Chevbot...");
  // Initialize Chevbot
  // log("...done");

})().catch(console.log);