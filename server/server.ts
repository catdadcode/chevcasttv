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
  DISCORD_EMBERSCABIN_LIVESTREAM_VOICE_CHANNEL_ID,
  DISCORD_DOLLZULASDOLLHOUSE_LIVESTREAM_VOICE_CHANNEL_ID,
  CHEV_TWITCH_CHANNELS,
  EMBER_TWITCH_CHANNELS,
  AZULA_TWITCH_CHANNELS
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
  if (NODE_ENV === "production") {
    await Promise.all([
      new Chatbot({
        twitchChannels: CHEV_TWITCH_CHANNELS.split(","),
        discordChannelIds: [
          DISCORD_WATERCOOLER_LIVESTREAM_VOICE_CHANNEL_ID,
          DISCORD_CHEVCAST_LIVESTREAM_VOICE_CHANNEL_ID
        ],
        restream: true
      }).initialize(),
      new Chatbot({
        twitchChannels: AZULA_TWITCH_CHANNELS.split(","),
        discordChannelIds: [ DISCORD_DOLLZULASDOLLHOUSE_LIVESTREAM_VOICE_CHANNEL_ID ]
      }).initialize(),
      new Chatbot({
        twitchChannels: EMBER_TWITCH_CHANNELS.split(","),
        discordChannelIds: [ DISCORD_EMBERSCABIN_LIVESTREAM_VOICE_CHANNEL_ID ]
      }).initialize()
    ]);
  } else {
    await new Chatbot({
      twitchChannels: CHEV_TWITCH_CHANNELS.split(","),
      discordChannelIds: [
        DISCORD_WATERCOOLER_LIVESTREAM_VOICE_CHANNEL_ID,
        DISCORD_CHEVCAST_LIVESTREAM_VOICE_CHANNEL_ID
      ],
      restream: true
    }).initialize();
  }
  console.log("> Chatbots are now active.");

})().catch(console.log);