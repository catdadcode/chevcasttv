import { NextApiRequest, NextApiResponse } from "next";
import { PTSTimeSlot } from "db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const timeSlots = (await PTSTimeSlot.find()).map(timeSlot => timeSlot.toJSON({
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret.startTime = ret.startTime.toString();
      ret.endTime = ret.endTime.toString();
      delete ret._id;
    }
  }));
  res.json(timeSlots);
}

export default handler;