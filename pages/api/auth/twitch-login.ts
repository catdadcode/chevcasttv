import { URLSearchParams } from "url";
import { NextApiRequest, NextApiResponse } from "next";
import config from "config";

const {
  APP_URL,
  TWITCH_OAUTH_URL,
  TWITCH_CLIENT_ID
} = config;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: TWITCH_CLIENT_ID,
    scope: "user:read:email",
    redirect_uri: `${APP_URL}/api/auth/twitch-callback`,
    prompt: "none",
    state: req.headers.referer ?? req.headers.referrer ?? APP_URL 
  });
  res.redirect(`${TWITCH_OAUTH_URL}/authorize?${params.toString()}`);
};

export default handler;