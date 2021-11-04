import { NextApiRequest, NextApiResponse } from "next";
import config from "config";

const {
  APP_URL,
  DISCORD_API_URL,
  DISCORD_CLIENT_ID
} = config;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const redirectUri = encodeURIComponent(`${APP_URL}/api/auth/discord-callback`);
  res.redirect(`${DISCORD_API_URL}/oauth2/authorize?response_type=code&client_id=${DISCORD_CLIENT_ID}&scope=identify%20email%20guilds.join%20guilds&redirect_uri=${redirectUri}&prompt=none`);
};

export default handler;