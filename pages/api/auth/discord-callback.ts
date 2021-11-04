import { NextApiRequest, NextApiResponse } from "next";
import config from "config";
import axios from "axios";
import { URLSearchParams } from "url";
import jwt from "jsonwebtoken";
import Cookies from "cookies";
import moment from "moment";

import { User } from "db";

const {
  APP_URL,
  DISCORD_API_URL,
  DISCORD_CDN_URL,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  JWT_SECRET
} = config;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  // Exchange code for access token.
  const { code } = req.query;
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
    `${DISCORD_API_URL}/oauth2/token`,
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

  // Use email to look for existing user.
  let user = await User.findOne({ email });
  const avatarUrl = `${DISCORD_CDN_URL}/avatars/${id}/${avatar}.png`;
  if (!user) {
    user = new User({
      accessToken: access_token,
      accessTokenExpiration: new Date(expires_in),
      avatar: avatarUrl,
      discordId: id,
      email,
      refreshToken: refresh_token,
      username
    });
  } else {
    Object.assign(user, {
      accessToken: access_token,
      accessTokenExpiration: new Date(expires_in),
      avatar: avatarUrl,
      refreshToken: refresh_token,
      username
    });
  }
  user.save();

  // Create JSON Web Token and store in cookie.
  const payload = JSON.stringify({
    avatar: avatarUrl,
    email,
    username
  });
  const sessionToken = jwt.sign(payload, JWT_SECRET);
  const cookies = new Cookies(req, res);
  cookies.set("session_token", sessionToken, {
    httpOnly: true,
    sameSite: true,
    overwrite: true,
    expires: moment().add(30, "days").toDate()
  });
  res.redirect(APP_URL);
};

export default handler;