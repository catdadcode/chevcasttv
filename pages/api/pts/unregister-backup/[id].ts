import { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";
import jwt from "jsonwebtoken";
import config from "config";
import { PTSTimeSlot } from "db";
import type { JwtPayload } from "types/JwtPayload";

const {
  APP_URL,
  JWT_SECRET
} = config;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const timeSlot = await PTSTimeSlot.findById(id);
  if (!timeSlot) throw new Error(`Unable to find time slot with ID ${id}`);
  const cookies = new Cookies(req, res);
  const sessionToken = cookies.get("session_token");
  if (!sessionToken) return res.status(403).send("Not Authorized");
  const { userId } = jwt.verify(sessionToken, JWT_SECRET) as JwtPayload;
  if (!timeSlot.backupRSVPs?.map(b => b.toString()).includes(userId)) return res.status(403).send("Not Authorized");
  const index = timeSlot.backupRSVPs.findIndex(b => b.toString() === userId);
  timeSlot.backupRSVPs.splice(index, 1);
  await timeSlot.save();
  if (req.headers.accept?.toLowerCase().includes("text/html")) {
    res.redirect(`${APP_URL}/pass-the-stream`);
    return;
  }
  res.send("Success");
}

export default handler;