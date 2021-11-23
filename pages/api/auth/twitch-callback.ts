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
  TWITCH_API_URL,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  TWITCH_OAUTH_URL,
  JWT_SECRET
} = config;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = new Cookies(req, res);
  let sessionToken = cookies.get("session_token");

  // Exchange code for access token.
  const { code, state } = req.query as Record<string, string>;
  const redirectUri = `${APP_URL}/api/auth/twitch-callback`;
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
    `${TWITCH_OAUTH_URL}/token`,
    new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
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
    data: [{
      display_name: string,
      email: string,
      id: string,
      profile_image_url: string
    }]
  };
  const {
    data: {
      data: [{
        display_name,
        email,
        id,
        profile_image_url
      }]
    }
  } = await axios.get<UserData>(
    `${TWITCH_API_URL}/users`,
    {
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Client-Id": TWITCH_CLIENT_ID
      }
    }
  );

  // Look for user by Twitch ID.
  let user = await User.findOne({ "twitch.id": id });
  let payload: JwtPayload | null = null;
  if (sessionToken) {
    try {
      payload = jwt.verify(sessionToken, JWT_SECRET) as JwtPayload;
      user = await User.findById(payload.userId);
    } catch {}
  }
  if (!user) {
    user = new User({
      primaryProvider: "twitch",
      twitch: {
        accessToken: access_token,
        accessTokenExpiration: new Date(expires_in),
        avatar: profile_image_url,
        id,
        email,
        refreshToken: refresh_token,
        username: display_name
      }
    });
  } else {
    Object.assign(user, {
      twitch: {
        accessToken: access_token,
        accessTokenExpiration: new Date(expires_in),
        avatar: profile_image_url,
        id,
        email,
        refreshToken: refresh_token,
        username: display_name
      }
    });
  }
  await user.save();

  // Create JSON Web Token and store in cookie.
  if (!payload) {
    payload = {
      avatar: profile_image_url,
      discordId: user.discord?.id,
      email,
      twitchId: user.twitch?.id,
      userId: user.id,
      username: display_name
    };
  }
  payload.twitchId = user.twitch!.id;
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