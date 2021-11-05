import { URLSearchParams } from "url";
import { NextApiRequest, NextApiResponse } from "next";
import config from "config";

const {
  APP_URL,
  DISCORD_API_URL,
  DISCORD_CLIENT_ID
} = config;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: DISCORD_CLIENT_ID,
    scope: "identify email guilds guilds.join",
    redirect_uri: `${APP_URL}/api/auth/discord-callback`,
    prompt: "none",
    state: req.headers.referrer ?? APP_URL 
  });
  res.redirect(`${DISCORD_API_URL}/oauth2/authorize?${params.toString()}`);
};

export default handler;