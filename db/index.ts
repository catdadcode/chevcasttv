import mongoose from "mongoose";
import config from "config";

const {
  DATABASE_NAME,
  MONGODB_CONNECTION_STRING
} = config;

export const initialize = async () => {
  const { connection } = global.mongoose =  global.mongoose ?? await mongoose.connect(MONGODB_CONNECTION_STRING, {
    dbName: DATABASE_NAME
  });
  connection.on("error", console.log);
};

export const close = async () => {
  mongoose.connection.close();
}

export * from "./models/User";
export * from "./models/PTSTimeSlot";