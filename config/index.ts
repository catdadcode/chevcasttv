const configKeys = [ 
  "APP_URL",
  "AZULA_TWITCH_CHANNELS",
  "CHEV_ID",
  "CHEV_TWITCH_CHANNELS",
  "CONTEXT_TIMEOUT",
  "DATABASE_NAME",
  "DISCORD_BOT_TOKEN",
  "DISCORD_CHEVCAST_LIVESTREAM_TEXT_CHANNEL_ID",
  "DISCORD_CHEVCAST_LIVESTREAM_VOICE_CHANNEL_ID",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
  "DISCORD_WATERCOOLER_LIVESTREAM_VOICE_CHANNEL_ID",
  "DISCORD_EMBERSCABIN_LIVESTREAM_VOICE_CHANNEL_ID",
  "DISCORD_DOLLZULASDOLLHOUSE_LIVESTREAM_VOICE_CHANNEL_ID",
  "EMBER_TWITCH_CHANNELS",
  "GOOGLE_API_KEY",
  "JWT_SIGNING_KEY",
  "MONGODB_CONNECTION_STRING",
  "NODE_ENV",
  "SESSION_SECRET"

] as const;

type Config = Record<typeof configKeys[number], string>;

const config = configKeys.reduce((config, key) => {
  if (!process.env[key]) throw new Error(`Environment variable ${key} is not defined but is required for this app to run.`);
  config[key] = process.env[key]!;
  return config;
}, {} as Partial<Config>) as Config;

export default config;