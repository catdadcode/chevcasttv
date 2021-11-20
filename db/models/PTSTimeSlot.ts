import { Schema, Model, model } from "mongoose";
import { IUser, UserSchema } from "./User";

export interface IPTSTimeSlot {
  id: string,
  startTime: Date,
  endTime: Date,
  RSVP?: Schema.Types.ObjectId | IUser,
  backupRSVPs?: (Schema.Types.ObjectId | IUser)[]
}

export const PTSTimeSlotSchema = new Schema<IPTSTimeSlot>({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  RSVP: { type: Schema.Types.ObjectId, ref: "User", required: false },
  backupRSVPs: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    required: false
  }
});

export const PTSTimeSlot: Model<IPTSTimeSlot> = global.ptsTimeSlotModel = global.ptsTimeSlotModel ?? model<IPTSTimeSlot>("PTSTimeSlot", PTSTimeSlotSchema);