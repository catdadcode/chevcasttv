import { Schema, Model, model } from "mongoose";

export interface IUser {
  id: string;
  accessToken: string;
  accessTokenExpiration: Date;
  avatar: string;
  discordId: string;
  email: string;
  refreshToken: string;
  username: string;
}

export const UserSchema = new Schema<IUser>({
  accessToken: { type: String, required: true },
  accessTokenExpiration: { type: Date, required: true },
  avatar: { type: String, required: true },
  discordId: { type: String, required: true },
  email: { type: String, required: true },
  refreshToken: { type: String, required: true },
  username: { type: String, required: true }
});

export const User: Model<IUser> = global.userModel = global.userModel ?? model<IUser>("User", UserSchema);