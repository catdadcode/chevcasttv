import { Client } from "tmi.js";
import logger from "../logger";

const log = logger.extend("TWITCH_CLIENT");

const twitchClient = new Client({});

export const initialize = async () => {
  log("Initializing Twitch client...");
  await twitchClient.connect();
  log("Twitch client ready.");
};

type MessageHandler = (username: string, message: string, self: boolean) => void;
const messageHandlers: Record<string, MessageHandler[]> = {};
export const onMessage = async (channel: string, handler: MessageHandler) => {
  channel = channel.toLowerCase();
  const currentChannels = Object.keys(messageHandlers);
  if (!currentChannels.includes(channel)) {
    await twitchClient.join(channel);
    log(`Twitch client now monitoring channel for ${channel}.`);
  }
  let handlers = messageHandlers[channel];
  if (!handlers) {
    handlers = messageHandlers[channel] = [handler];
  } else {
    handlers.push(handler);
  }
  const unsubscribe = async () => {
    handlers.splice(handlers.indexOf(handler), 1);
    if (handlers.length === 0) {
      delete messageHandlers[channel];
      await twitchClient.part(channel);
      log(`Twitch client no longer monitoring channel for ${channel}.`);
    }
  };
  return unsubscribe;
};

twitchClient.on("message", (channel, tags, message, self) => {
  const handlers = messageHandlers[channel.slice(1)];
  if (!handlers) return;
  handlers.forEach(handler => handler(tags["display-name"]! as string, message, self));
});