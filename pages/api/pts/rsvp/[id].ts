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
  try {

    // Query for time slot.
    const { id } = req.query;
    const timeSlot = await PTSTimeSlot.findById(id);
    if (!timeSlot) throw new Error(`Unable to find time slot with ID ${id}`);

    // Check for session token.
    const cookies = new Cookies(req, res);
    const sessionToken = cookies.get("session_token");
    if (!sessionToken) return res.status(403).send("Not Authorized");

    // Check for user and that user has Twitch credentials.
    const { userId } = jwt.verify(sessionToken, JWT_SECRET) as JwtPayload;
    const user = await User.findById(userId);
    if (!user) throw new Error(`Unable to find user with ID ${userId}`);
    if (!user.twitch) throw new Error(`User ${userId} does not have a connected Twitch account`);

    // Check to ensure there is no current RSVP, the user hasn't already registered as a backup, and that the user hasn't registered for two windows already.
    if (timeSlot.RSVP) throw new Error(`User ${timeSlot.RSVP} has already registered for time slot ${timeSlot.id}`);
    if ((timeSlot.backupRSVPs?.map(b => b.toString()).includes(userId))) throw new Error(`User ${userId} has already registered as a backup for this time slot.`);
    const rsvps = await PTSTimeSlot.find({ RSVP: user._id });
    if (rsvps.length === 2) throw new Error("You can only register for at most 2 time windows.");

    // Set RSVP to user.
    timeSlot.RSVP = user._id;
    await timeSlot.save();

    // Redirect user to the page if this was a regular request.
    if (req.headers.accept?.toLowerCase().includes("text/html")) {
      res.redirect(`${APP_URL}/pass-the-stream`);
      return;
    }

    // Otherwise send back the data needed for front-end to add registered user.
    res.json({
      id: userId,
      avatar: user.twitch.avatar,
      username: user.twitch.username
    });

  } catch (err: any) {
    res.status(500).send(err.message ?? err.toString());
  }
}

export default handler;