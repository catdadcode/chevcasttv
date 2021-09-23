import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import dbClient from "db";
import config from "config";

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  SESSION_SECRET
} = config;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return await NextAuth(req, res, {
    adapter: MongoDBAdapter({
      db: dbClient.db("chevcasttv")
    }),
    providers: [
      DiscordProvider({
        clientId: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        authorization: "https://discord.com/api/oauth2/authorize?scope=identify+email+guilds.join+guilds&prompt=none"
      })
    ],
    session: {
      jwt: true
    },
    secret: SESSION_SECRET
  });
};

export default handler;