import { MongoClient } from "mongodb"
import config from "config";

const { MONGODB_CONNECTION_STRING } = config;

let client = global._mongoClient =  global._mongoClient ?? new MongoClient(MONGODB_CONNECTION_STRING);

export const initDb = async () => {
  return client.connect();
}

export default client;