import { Schema, Model, model } from "mongoose";

export interface IUser {
  id: string;
  primaryProvider: "discord" | "twitch"
  discord?: {
    accessToken: string;
    accessTokenExpiration: Date;
    avatar: string;
    email: string;
    id: string;
    refreshToken: string;
    username: string;
  },
  twitch?: {
    accessToken: string;
    accessTokenExpiration: Date;
    avatar: string;
    email: string;
    id: string;
    refreshToken: string;
    username: string;
  }
}

export const UserSchema = new Schema<IUser>({
  primaryProvider: { type: String, required: true },
  discord: { type: {
    accessToken: { type: String, required: true },
    accessTokenExpiration: { type: Date, required: true },
    avatar: { type: String, required: true },
    id: { type: String, required: true },
    email: { type: String, required: true },
    refreshToken: { type: String, required: true },
    username: { type: String, required: true }
  }, required: false },
  twitch: { type: {
    accessToken: { type: String, required: true },
    accessTokenExpiration: { type: String, required: true },
    avatar: { type: String, required: true },
    email: { type: String, required: true },
    id: { type: String, required: true },
    refreshToken: { type: String, required: true },
    username: { type: String, required: true }
  }, required: false }
});

export const User: Model<IUser> = global.userModel = global.userModel ?? model<IUser>("User", UserSchema);