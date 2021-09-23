import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "lib/mongodb";
import config from "config";

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  SESSION_SECRET
} = config;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return await NextAuth(req, res, {
    adapter: MongoDBAdapter({
      db: (await clientPromise).db("chevcasttv")
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
}