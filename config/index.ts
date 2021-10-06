const configKeys = [ 
  "APP_URL",
  "DISCORD_BOT_TOKEN",
  "DISCORD_CHEVCAST_GUILD_ID",
  "DISCORD_CHEVCAST_LIVESTREAM_TEXT_CHANNEL_ID",
  "DISCORD_CHEVCAST_LIVESTREAM_VOICE_CHANNEL_ID",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
  "DISCORD_WATERCOOLER_GUILD_ID",
  "DISCORD_WATERCOOLER_LIVESTREAM_VOICE_CHANNEL_ID",
  "GOOGLE_API_KEY",
  "JWT_SIGNING_KEY",
  "MONGODB_CONNECTION_STRING",
  "NODE_ENV",
  "SESSION_SECRET",
  "TWITCH_CHANNELS"
] as const;

type Config = Record<typeof configKeys[number], string>;

const config = configKeys.reduce((config, key) => {
  if (!process.env[key]) throw new Error(`Environment variable ${key} is not defined but is required for this app to run.`);
  config[key] = process.env[key]!;
  return config;
}, {} as Partial<Config>) as Config;

export default config;