import { NextApiRequest, NextApiResponse } from "next";
import config from "config";
import axios from "axios";
import { URLSearchParams } from "url";
import jwt from "jsonwebtoken";
import Cookies from "cookies";
import moment from "moment";
import { JwtPayload } from "types/JwtPayload";

import { User } from "db";

const {
  APP_URL,
  DISCORD_API_URL,
  DISCORD_CDN_URL,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_OAUTH_URL,
  JWT_SECRET
} = config;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = new Cookies(req, res);
  let sessionToken = cookies.get("session_token");

  // Exchange code for access token.
  const { code, state } = req.query as Record<string, string>;
  const redirectUri = `${APP_URL}/api/auth/discord-callback`;
  type TokenData = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  const { data: {
    access_token,
    refresh_token,
    expires_in
  }} = await axios.post<TokenData>(
    `${DISCORD_OAUTH_URL}/token`,
    new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  // Use access token to retrieve user data.
  type UserData = {
    avatar: string,
    email: string,
    id: string,
    username: string
  };
  const { data: {
    avatar,
    email,
    id,
    username
  }} = await axios.get<UserData>(`${DISCORD_API_URL}/users/@me`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  });

  // Look for existing user by Discord ID.
  let user = await User.findOne({ "discord.id": id });
  let payload: JwtPayload | null = null;
  if (!user && sessionToken) {
    try {
      const payload = jwt.verify(sessionToken, JWT_SECRET) as JwtPayload;
      user = await User.findById(payload.userId);
    } catch {}
  }
  const avatarUrl = `${DISCORD_CDN_URL}/avatars/${id}/${avatar}.png`;

  if (!user) {
    user = new User({
      primaryProvider: "discord",
      discord: {
        accessToken: access_token,
        accessTokenExpiration: new Date(expires_in),
        avatar: avatarUrl,
        id,
        email,
        refreshToken: refresh_token,
        username
      }
    });
  } else {
    Object.assign(user, {
      discord: {
        accessToken: access_token,
        accessTokenExpiration: new Date(expires_in),
        avatar: avatarUrl,
        id,
        email,
        refreshToken: refresh_token,
        username
      }
    });
  }
  await user.save();

  // Create JSON Web Token and store in cookie.
  if (!payload) {
    payload = {
      avatar: avatarUrl,
      email,
      twitchId: user.twitch?.id,
      userId: user.id,
      username
    };
  }
  payload.discordId = user.discord?.id;
  sessionToken = jwt.sign(JSON.stringify(payload), JWT_SECRET);
  cookies.set("session_token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    overwrite: true,
    expires: moment().add(30, "days").toDate()
  });
  res.redirect(decodeURIComponent(state));
};

export default handler;