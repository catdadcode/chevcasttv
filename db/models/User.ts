import { Schema, model } from "mongoose";

interface User {
  accessToken: string;
  accessTokenExpiration: Date;
  avatar: string;
  discordId: string;
  email: string;
  refreshToken: string;
  username: string;
}

const schema = new Schema<User>({
  accessToken: { type: String, required: true },
  accessTokenExpiration: { type: Date, required: true },
  avatar: { type: String, required: true },
  discordId: { type: String, required: true },
  email: { type: String, required: true },
  refreshToken: { type: String, required: true },
  username: { type: String, required: true }
});

export default global.userModel = global.userModel ?? model<User>("User", schema);