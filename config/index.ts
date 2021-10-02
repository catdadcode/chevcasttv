const configKeys = [ 
  "APP_URL",
  "DISCORD_BOT_TOKEN",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
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
  switch (key) {
    case "APP_URL": 
      process.env.NEXTAUTH_URL = config[key];
      break;
  }
  return config;
}, {} as Partial<Config>) as Config;

export default config;