import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import Cookies from "cookies";
import moment from "moment";
import config from "config";

const {
  JWT_SECRET,
  NODE_ENV
} = config;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  // Verify session token.
  const cookies = new Cookies(req, res);
  const sessionToken = cookies.get("session_token");
  if (!sessionToken) {
    res.send(false);
    return;
  }
  const payload = jwt.verify(sessionToken, JWT_SECRET);
  cookies.set("session_token", sessionToken, {
    httpOnly: true,
    secure: NODE_ENV !== "development",
    sameSite: true,
    overwrite: true,
    expires: moment().add(30, "days").toDate()
  });
  res.json(payload);
};

export default handler;