import { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";
import jwt from "jsonwebtoken";
import config from "config";
import { User, PTSTimeSlot } from "db";
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
  const user = await User.findById(userId);
  if (!user) throw new Error(`Unable to find user with ID ${userId}`);
  if (!user.twitch) throw new Error(`User ${userId} does not have a connected Twitch account`);
  const rsvps = await PTSTimeSlot.find({ RSVP: user._id });
  if (rsvps.length > 2) throw new Error("You can only register for at most 2 time windows.");
  timeSlot.RSVP = user._id;
  await timeSlot.save();
  if (req.headers.accept?.toLowerCase().includes("text/html")) {
    res.redirect(`${APP_URL}/pass-the-stream`);
    return;
  }
  res.json({
    id: userId,
    avatar: user.twitch.avatar,
    username: user.twitch.username
  });
}

export default handler;