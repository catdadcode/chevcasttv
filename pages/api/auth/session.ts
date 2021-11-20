import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import Cookies from "cookies";
import moment from "moment";
import config from "config";
import type { JwtPayload } from "types/JwtPayload";

const {
  JWT_SECRET
} = config;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  // Verify session token.
  const cookies = new Cookies(req, res);
  const sessionToken = cookies.get("session_token");
  if (!sessionToken) {
    res.send(false);
    return;
  }
  const payload = jwt.verify(sessionToken, JWT_SECRET) as JwtPayload;
  cookies.set("session_token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    overwrite: true,
    expires: moment().add(30, "days").toDate()
  });
  res.json(payload);
};

export default handler;