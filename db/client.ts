import { MongoClient } from "mongodb";
import config from "config";

const { MONGODB_CONNECTION_STRING } = config;

const client = global._mongoClient =  global._mongoClient ?? new MongoClient(MONGODB_CONNECTION_STRING);

export default client;