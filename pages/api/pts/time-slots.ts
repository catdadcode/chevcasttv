import { NextApiRequest, NextApiResponse } from "next";
import { IUser, PTSTimeSlot } from "db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const timeSlots = await PTSTimeSlot.find().populate("RSVP").populate("backupRSVPs");
  res.json(timeSlots.map(timeSlot => {
    const data: any = {
      id: timeSlot._id.toString(),
      startTime: timeSlot.startTime.toString(),
      endTime: timeSlot.endTime.toString(),
    };
    if (timeSlot.RSVP) {
      const rsvp = timeSlot.RSVP as IUser;
      data.RSVP = {
        id: rsvp.id,
        avatar: rsvp.twitch!.avatar,
        username: rsvp.twitch!.username
      };
    }
    if (timeSlot.backupRSVPs) {
      data.backupRSVPs = (timeSlot.backupRSVPs as IUser[]).map(user => ({
        id: user.id,
        avatar: user.twitch!.avatar,
        username: user.twitch!.username
      }));
    }
    return data;
  }));
}

export default handler;