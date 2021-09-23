import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import config from "config";

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  SESSION_SECRET
} = config;

export default NextAuth({
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